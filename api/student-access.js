import crypto from 'node:crypto'
import { createStudentSession } from '../server/student-session.js'

const WINDOW_MINUTES = 15
const MAX_IP_ATTEMPTS = 12
const MAX_CODE_ATTEMPTS = 8

const hashIdentifier = (value, secret) =>
  crypto.createHmac('sha256', secret).update(value).digest('hex')

const jsonHeaders = (serviceKey, extra = {}) => ({
  apikey: serviceKey,
  'Content-Type': 'application/json',
  ...extra,
})

const restUrl = (base, path, params = {}) => {
  const url = new URL(`/rest/v1/${path}`, base)
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value))
  }
  return url
}

async function countAttempts(base, serviceKey, identifier, since) {
  const url = restUrl(base, 'portal_access_attempts', {
    select: 'id',
    identifier: `eq.${identifier}`,
    attempted_at: `gte.${since}`,
  })
  const response = await fetch(url, {
    method: 'HEAD',
    headers: jsonHeaders(serviceKey, { Prefer: 'count=exact' }),
  })
  if (!response.ok) {
    console.error('portal_access_attempts count failed', response.status, await response.text())
    throw new Error('rate-limit-count')
  }
  const range = response.headers.get('content-range') || ''
  const match = range.match(/\/(\d+)$/)
  return match ? Number(match[1]) : 0
}

async function recordAttempts(base, serviceKey, identifiers) {
  const response = await fetch(restUrl(base, 'portal_access_attempts'), {
    method: 'POST',
    headers: jsonHeaders(serviceKey, { Prefer: 'return=minimal' }),
    body: JSON.stringify(identifiers.map(identifier => ({ identifier }))),
  })
  if (!response.ok) {
    console.error('portal_access_attempts insert failed', response.status, await response.text())
    throw new Error('rate-limit-insert')
  }
}

async function createSignedFileUrl(base, serviceKey, bucket, filePath) {
  const encodedPath = String(filePath).split('/').map(encodeURIComponent).join('/')
  const endpoint = new URL(`/storage/v1/object/sign/${bucket}/${encodedPath}`, base)
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: jsonHeaders(serviceKey),
    body: JSON.stringify({ expiresIn: 900 }),
  })
  if (!response.ok) {
    console.error(`${bucket} signing failed`, response.status, await response.text())
    throw new Error('resource-sign')
  }
  const result = await response.json()
  const signed = result.signedURL || result.signedUrl
  if (!signed) throw new Error('resource-sign-empty')
  if (signed.startsWith('http')) return signed
  // Supabase Storage returns paths such as /object/sign/... . They are
  // relative to /storage/v1, not to the project root.
  if (signed.startsWith('/storage/v1/')) return new URL(signed, base).toString()
  if (signed.startsWith('/object/')) return new URL(`/storage/v1${signed}`, base).toString()
  return new URL(`/storage/v1/${signed.replace(/^\/+/, '')}`, base).toString()
}

async function getRows(base, serviceKey, table, params) {
  const response = await fetch(restUrl(base, table, params), {
    method: 'GET',
    headers: jsonHeaders(serviceKey),
  })
  if (!response.ok) {
    console.error(`${table} read failed`, response.status, await response.text())
    throw new Error(`${table}-read`)
  }
  return response.json()
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return res.status(500).json({ error: 'Student access is not configured yet.' })

  let body = req.body
  if (typeof body === 'string') {
    try { body = JSON.parse(body) } catch { body = {} }
  }
  const code = String(body?.code || '').trim().toUpperCase()
  if (!/^AA\d{4}$/.test(code)) return res.status(400).json({ error: 'Enter a valid AA access code.' })

  const forwarded = String(req.headers['x-forwarded-for'] || '')
  const ip = forwarded.split(',')[0].trim() || String(req.headers['x-real-ip'] || 'unknown')
  const ipKey = `ip:${hashIdentifier(ip, serviceKey)}`
  const codeKey = `code:${hashIdentifier(code, serviceKey)}`
  const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString()

  try {
    const [ipCount, codeCount] = await Promise.all([
      countAttempts(url, serviceKey, ipKey, since),
      countAttempts(url, serviceKey, codeKey, since),
    ])

    if (ipCount >= MAX_IP_ATTEMPTS || codeCount >= MAX_CODE_ATTEMPTS) {
      return res.status(429).json({ error: 'Too many attempts. Please wait 15 minutes and try again.' })
    }

    await recordAttempts(url, serviceKey, [ipKey, codeKey])

    const students = await getRows(url, serviceKey, 'students', {
      select: 'id,name,course,target_grade,working_grade,progress,expected_progress,tutor_update,active,exam_board,tier,baseline_progress,progress_start_date,target_date,teams_link,lesson_day,lesson_start_time,lesson_duration_minutes,lesson_mode,curriculum_modules',
      access_code: `eq.${code}`,
      access_code_active: 'eq.true',
      active: 'eq.true',
      limit: '1',
    })

    const student = students?.[0]
    if (!student) return res.status(401).json({ error: 'That access code was not recognised.' })

    const [studentCourses, curriculumRows] = await Promise.all([
      getRows(url, serviceKey, 'student_courses', { select: '*', student_id: `eq.${student.id}`, order: 'created_at.asc' }),
      getRows(url, serviceKey, 'curriculum_topics', { select: '*', order: 'position.asc' }),
    ])
    let courseModules = []
    if (studentCourses?.length) courseModules = await getRows(url, serviceKey, 'student_course_modules', { select: '*', student_course_id: `in.(${studentCourses.map(x=>x.id).join(',')})` })

    // Timetable is the single source of truth for the student's next lesson and meeting link.
    // Keep this read isolated so a permissions/configuration problem cannot lock the student out of the rest of the portal.
    let timetableSessions = []
    try {
      const sessionLinks = await getRows(url, serviceKey, 'timetable_session_students', {
        select: 'session_id,student_course_id', student_id: `eq.${student.id}`,
      })
      const sessionIds = (sessionLinks || []).map(x => x.session_id)
      if (sessionIds.length) {
        timetableSessions = await getRows(url, serviceKey, 'timetable_sessions', {
          select: 'id,tutor_id,session_date,day_of_week,start_time,duration_minutes,mode,meeting_url,recurrence,active',
          id: `in.(${sessionIds.join(',')})`, active: 'eq.true', order: 'start_time.asc',
        })
        const courseBySession = Object.fromEntries((sessionLinks || []).map(x => [x.session_id, x.student_course_id || null]))
        timetableSessions = (timetableSessions || []).map(x => ({ ...x, student_course_id: courseBySession[x.id] || null }))
      }
    } catch (error) {
      console.warn('timetable read unavailable', error?.message || 'unknown')
    }

    const [assessments, assessmentGroups, lessons, topics, resourceRows, resourceTopics, assignments, classworkAttachments, submissions] = await Promise.all([
      getRows(url, serviceKey, 'assessments', {
        select: 'id,title,score,total,taken_on,notes,assessment_group_id',
        student_id: `eq.${student.id}`,
        order: 'taken_on.desc',
      }),
      getRows(url, serviceKey, 'assessment_groups', {
        select: 'id,student_course_id,name,position,created_at', student_id: `eq.${student.id}`, order: 'position.asc,created_at.asc',
      }),
      getRows(url, serviceKey, 'lessons', {
        select: 'id,lesson_date,topic,attendance,duration_minutes,notes,homework',
        student_id: `eq.${student.id}`,
        order: 'lesson_date.desc',
      }),
      getRows(url, serviceKey, 'topic_progress', {
        select: 'id,student_course_id,curriculum_topic_id,topic,status,updated_at',
        student_id: `eq.${student.id}`,
        order: 'topic.asc',
      }),
      getRows(url, serviceKey, 'lesson_resources', {
        select: 'id,student_course_id,title,file_path,original_name,mime_type,file_size,uploaded_at,lesson_id,resource_topic_id',
        student_id: `eq.${student.id}`,
        order: 'uploaded_at.desc',
      }),
      getRows(url, serviceKey, 'resource_topics', {
        select: 'id,student_course_id,name,position,created_at', student_id: `eq.${student.id}`, order: 'position.asc,created_at.asc',
      }),
      getRows(url, serviceKey, 'assignments', {
        select: 'id,student_course_id,title,instructions,due_date,attachment_path,attachment_name,created_at,resource_topic_id', student_id: `eq.${student.id}`, order: 'created_at.desc',
      }),
      getRows(url, serviceKey, 'classwork_attachments', {
        select: 'id,student_course_id,parent_type,parent_id,attachment_type,title,file_path,original_name,mime_type,file_size,storage_bucket,url,created_at', student_id: `eq.${student.id}`, order: 'created_at.asc',
      }),
      getRows(url, serviceKey, 'assignment_submissions', {
        select: 'id,assignment_id,status,tutor_feedback,submitted_at,reviewed_at', student_id: `eq.${student.id}`, order: 'submitted_at.desc',
      }),
    ])

    const resources = []
    for (const resource of resourceRows || []) {
      const { file_path, ...safeResource } = resource
      // New classwork materials keep uploaded files in classwork_attachments, so
      // file_path can legitimately be null. Keep the material row and only
      // create a legacy signed URL when an old-style file_path exists.
      if (!file_path) {
        resources.push({ ...safeResource, url: null })
        continue
      }
      try {
        const signedUrl = await createSignedFileUrl(url, serviceKey, 'lesson-resources', file_path)
        resources.push({ ...safeResource, url: signedUrl })
      } catch (error) {
        console.error('legacy resource attachment omitted', resource.id, error?.message || 'unknown')
        resources.push({ ...safeResource, url: null })
      }
    }

    const safeAssignments = []
    for (const assignment of assignments || []) {
      let attachment_url = null
      if (assignment.attachment_path) {
        try { attachment_url = await createSignedFileUrl(url, serviceKey, 'homework-files', assignment.attachment_path) } catch (e) { console.error('assignment attachment omitted', assignment.id, e?.message || 'unknown') }
      }
      const { attachment_path, ...safe } = assignment
      safeAssignments.push({ ...safe, attachment_url })
    }

    const safeClassworkAttachments = []
    for (const attachment of classworkAttachments || []) {
      if (attachment.attachment_type === 'file' && attachment.file_path) {
        try {
          const file_url = await createSignedFileUrl(url, serviceKey, attachment.storage_bucket || 'lesson-resources', attachment.file_path)
          const { file_path, ...safe } = attachment
          safeClassworkAttachments.push({ ...safe, file_url })
        } catch (e) { console.error('classwork attachment omitted', attachment.id, e?.message || 'unknown') }
      } else if (attachment.attachment_type === 'link' && attachment.url) {
        safeClassworkAttachments.push(attachment)
      }
    }

    const submissionIds = (submissions || []).map(x => x.id)
    let submissionFiles = []
    if (submissionIds.length) {
      const raw = await getRows(url, serviceKey, 'assignment_submission_files', {
        select: 'id,submission_id,original_name,mime_type,file_size,file_path,uploaded_at',
        submission_id: `in.(${submissionIds.join(',')})`, order: 'uploaded_at.asc',
      })
      for (const file of raw || []) {
        try {
          const file_url = await createSignedFileUrl(url, serviceKey, 'homework-files', file.file_path)
          const { file_path, ...safe } = file
          submissionFiles.push({ ...safe, file_url })
        } catch (e) { console.error('submission file omitted', file.id, e?.message || 'unknown') }
      }
    }

    return res.status(200).json({
      student,
      studentCourses: studentCourses || [],
      courseModules: courseModules || [],
      curriculumRows: curriculumRows || [],
      assessments: assessments || [],
      assessmentGroups: assessmentGroups || [],
      lessons: lessons || [],
      topics: topics || [],
      resources,
      resourceTopics: resourceTopics || [],
      assignments: safeAssignments,
      classworkAttachments: safeClassworkAttachments,
      submissions: submissions || [],
      submissionFiles,
      timetableSessions,
      sessionToken: createStudentSession(student.id, serviceKey),
    })
  } catch (error) {
    console.error('student-access failed', error?.message || 'unknown')
    return res.status(500).json({ error: 'Unable to open the student portal right now.' })
  }
}
