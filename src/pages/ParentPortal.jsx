import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'
import ProgressBar from '../components/ProgressBar'
import { progressSnapshot } from '../lib/gcseCurriculum'
import CurriculumProgress from '../components/CurriculumProgress'

const prettyDate=value=>value?new Date(`${value}T12:00:00`).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):''

export default function ParentPortal(){
 const {user}=useAuth()
 const [s,setS]=useState(null),[courses,setCourses]=useState([]),[courseModules,setCourseModules]=useState([]),[curriculumRows,setCurriculumRows]=useState([]),[activeCourseId,setActiveCourseId]=useState(''),[assessments,setAssessments]=useState([]),[assessmentGroups,setAssessmentGroups]=useState([]),[lessons,setLessons]=useState([]),[topics,setTopics]=useState([]),[openAssessmentGroups,setOpenAssessmentGroups]=useState({}),[loading,setLoading]=useState(true)
 useEffect(()=>{if(!user)return;(async()=>{
  const {data:links}=await supabase.from('parent_student_links').select('student_id').eq('parent_id',user.id).limit(1)
  const sid=links?.[0]?.student_id
  if(!sid){setLoading(false);return}
  const [{data:student},{data:c},{data:a},{data:ag},{data:l},{data:t},{data:cr}]=await Promise.all([
   supabase.from('students').select('*').eq('id',sid).single(),
   supabase.from('student_courses').select('*').eq('student_id',sid).order('created_at'),
   supabase.from('assessments').select('*').eq('student_id',sid).order('taken_on',{ascending:false}),
   supabase.from('assessment_groups').select('*').eq('student_id',sid).order('position').order('created_at'),
   supabase.from('lessons').select('*').eq('student_id',sid).order('lesson_date',{ascending:false}),
   supabase.from('topic_progress').select('*').eq('student_id',sid).order('topic'),
   supabase.from('curriculum_topics').select('*').in('course',['GCSE Combined Science','A-level Mathematics','A-level Further Mathematics']).order('position')
  ])
  let cm=[];if(c?.length){const {data}=await supabase.from('student_course_modules').select('*').in('student_course_id',c.map(x=>x.id));cm=data||[]}
  setS(student);setCourses(c||[]);setCourseModules(cm);setCurriculumRows(cr||[]);setActiveCourseId(c?.[0]?.id||'');setAssessments(a||[]);setAssessmentGroups(ag||[]);setLessons(l||[]);setTopics(t||[]);setLoading(false)
 })()},[user])
 const attendance=useMemo(()=>{const ls=lessons.filter(l=>l.attendance!=='cancelled');return ls.length?Math.round(ls.filter(l=>l.attendance==='present').length/ls.length*100):null},[lessons])
 const activeCourse=courses.find(c=>c.id===activeCourseId)||courses[0]||null
 const activeModules=activeCourse?courseModules.filter(m=>m.student_course_id===activeCourse.id).map(m=>m.module):[]
 const viewStudent=activeCourse&&s?{...s,...activeCourse,id:s.id,curriculum_modules:activeModules,curriculum_rows:curriculumRows.filter(r=>r.course===activeCourse.course)}:s
 const courseTopics=activeCourse?topics.filter(t=>t.student_course_id===activeCourse.id||(!t.student_course_id&&courses.length===1)):topics
 const courseAssessments=activeCourse?assessments.filter(a=>a.student_course_id===activeCourse.id||(!a.student_course_id&&(courses.length===1||s?.course===activeCourse.course))):assessments
 const courseAssessmentGroups=activeCourse?assessmentGroups.filter(g=>g.student_course_id===activeCourse.id||(!g.student_course_id&&(courses.length===1||s?.course===activeCourse.course))):assessmentGroups
 const snap=useMemo(()=>viewStudent?progressSnapshot(viewStudent,courseTopics):null,[viewStudent,courseTopics])
 const groupedAssessments=useMemo(()=>[...courseAssessmentGroups,{id:'uncategorised',name:'Other assessments'}].map(g=>({...g,items:courseAssessments.filter(a=>(a.assessment_group_id||'uncategorised')===g.id)})).filter(g=>g.items.length),[courseAssessmentGroups,courseAssessments])
 if(loading)return <div className="loading">Loading parent portal…</div>
 if(!s||!snap)return <div className="portalCard"><h2>No student linked yet</h2><p className="updateText">Ask AA Tuition to link this parent account to a student.</p></div>
 const row={...snap,attendance}
 return <>
  <div className="parentWelcome"><span className="eyebrow">STUDENT PROGRESS</span><h1>{s.name}</h1><p>{viewStudent.course}{viewStudent.exam_board?` · ${viewStudent.exam_board}`:''}{viewStudent.tier?` · ${viewStudent.tier} Tier`:''}</p>{snap.expectedConfigured&&<StatusBadge student={row}/>}</div>
  {courses.length>1&&<div className="courseTabs">{courses.map(c=><button key={c.id} className={c.id===activeCourse?.id?'active':''} onClick={()=>{setActiveCourseId(c.id);setOpenAssessmentGroups({})}}>{c.course}</button>)}</div>}
  <div className="parentMetrics"><Metric label="Target grade" value={viewStudent.target_grade||'—'}/><Metric label="Working grade" value={viewStudent.working_grade||'—'}/><Metric label="Progress" value={`${snap.progress}%`}/><Metric label="Attendance" value={attendance==null?'—':`${attendance}%`}/></div>
  {s.teams_link&&<section className="teamsHero"><div><span className="eyebrow">YOUR ONLINE LESSON</span><h2>Join your Teams lesson</h2><p>Your permanent AA Tuition lesson link.</p></div><a className="teamsJoinButton" href={s.teams_link} target="_blank" rel="noreferrer">Join Teams</a></section>}
  <section className="portalCard"><div className="panelHead"><div><h2>Progress against time</h2><p>Course mastery compared with the expected pace.</p></div></div><div className="compare"><div><span>Current progress</span><b>{snap.progress}%</b><ProgressBar value={snap.progress}/></div><div><span>Expected by now</span><b>{snap.expectedConfigured?`${snap.expected_progress}%`:'—'}</b><ProgressBar value={snap.expectedConfigured?snap.expected_progress:0}/></div></div></section>
  <section className="portalCard curriculumProgressCard"><div className="panelHead"><div><h2>Topic progress</h2><p>Your course is organised into sections and chapters. Tap a section to see the topics.</p></div></div><CurriculumProgress key={activeCourseId} student={viewStudent} topics={courseTopics}/></section>
  <section className="portalCard"><h2>Latest tutor update</h2><p className="updateText">{s.tutor_update||'No update yet.'}</p></section>
  <div className="parentCols">
   <section className="portalCard studentAssessmentCard"><div className="panelHead"><div><h2>Assessments</h2><p>Tests, mocks and past papers.</p></div></div>{groupedAssessments.length?<div className="studentAssessmentGroups">{groupedAssessments.map(g=>{const avg=Math.round(g.items.reduce((sum,a)=>sum+(Number(a.score)/Number(a.total)*100),0)/g.items.length);return <div className="studentAssessmentGroup" key={g.id}><button className="studentAssessmentGroupHead" onClick={()=>setOpenAssessmentGroups(v=>({...v,[g.id]:!v[g.id]}))}><div><b>{g.name}</b><span>{g.items.length} assessment{g.items.length===1?'':'s'} · Average {avg}%</span></div><div className="assessmentGroupSummary"><strong>{avg}%</strong><span className={`assessmentChevron ${openAssessmentGroups[g.id]?'expanded':''}`}>⌄</span></div></button>{openAssessmentGroups[g.id]&&<div className="studentAssessmentItems">{g.items.map(a=><div className="studentAssessmentRow" key={a.id}><div><b>{a.title}</b><span>{prettyDate(a.taken_on)}</span>{a.notes&&<small>{a.notes}</small>}</div><strong>{Math.round(a.score/a.total*100)}%<small>{a.score}/{a.total}</small></strong></div>)}</div>}</div>})}</div>:<div className="empty">No assessments yet.</div>}</section>
   <section className="portalCard"><h2>Recent lessons</h2>{lessons.length?lessons.slice(0,8).map(l=><div className="rowCard lesson" key={l.id}><div><b>{l.topic}</b><span>{prettyDate(l.lesson_date)}</span>{l.notes&&<p>{l.notes}</p>}{l.homework&&<div className="lessonHomework"><b>Homework</b><p>{l.homework}</p></div>}</div></div>):<div className="empty">No lessons yet.</div>}</section>
  </div>
 </>
}
const Metric=({label,value})=><div className="parentMetric"><span>{label}</span><strong>{value}</strong></div>
