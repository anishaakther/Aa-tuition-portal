import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Dashboard(){
 const {user}=useAuth()
 const [students,setStudents]=useState([]),[lessons,setLessons]=useState([]),[assignments,setAssignments]=useState([]),[submissions,setSubmissions]=useState([]),[tutorLinks,setTutorLinks]=useState([]),[studentCourses,setStudentCourses]=useState([]),[tutorName,setTutorName]=useState(''),[loading,setLoading]=useState(true)
 useEffect(()=>{(async()=>{const [{data:s},{data:l},{data:a},{data:su},{data:st},{data:sc},{data:p}]=await Promise.all([
  supabase.from('students').select('*').eq('active',true).order('name'),
  supabase.from('lessons').select('student_id,attendance'),
  supabase.from('assignments').select('id,student_id,title,due_date'),
  supabase.from('assignment_submissions').select('id,assignment_id,student_id,status,submitted_at').eq('status','submitted').order('submitted_at',{ascending:false}),
  supabase.from('student_tutors').select('student_id,tutor_id'),
  supabase.from('student_courses').select('student_id,course'),
  user?.id?supabase.from('profiles').select('full_name').eq('id',user.id).maybeSingle():Promise.resolve({data:null})
 ]);setStudents(s||[]);setLessons(l||[]);setAssignments(a||[]);setSubmissions(su||[]);setTutorLinks(st||[]);setStudentCourses(sc||[]);setTutorName((p?.full_name||'').trim());setLoading(false)})()},[user?.id])
 const rows=useMemo(()=>students.map(s=>{
  const ls=lessons.filter(l=>l.student_id===s.id&&l.attendance!=='cancelled')
  const present=ls.filter(l=>l.attendance==='present').length
  const courses=[...new Set(studentCourses.filter(c=>c.student_id===s.id).map(c=>c.course).filter(Boolean))]
  return {...s,courses,lessonCount:ls.length,attendance:ls.length?Math.round(present/ls.length*100):null}
 }),[students,lessons,studentCourses])
 const reviewItems=useMemo(()=>submissions.map(sub=>({sub,student:students.find(s=>s.id===sub.student_id),assignment:assignments.find(a=>a.id===sub.assignment_id)})).filter(x=>x.student&&x.assignment&&tutorLinks.some(l=>l.student_id===x.student.id&&l.tutor_id===user?.id)),[submissions,students,assignments,tutorLinks,user?.id])
 if(loading)return <div className="loading">Loading dashboard…</div>
 const attendanceRows=rows.filter(s=>s.attendance!=null)
 const attendance=attendanceRows.length?Math.round(attendanceRows.reduce((a,s)=>a+s.attendance,0)/attendanceRows.length):null
 const lessonCount=rows.reduce((a,s)=>a+s.lessonCount,0)
 const priorities=rows.filter(s=>s.attendance!=null&&s.attendance<85).slice(0,3)
 const accountFallback=user?.email==='aamathstutor@outlook.com'?'Anisha':user?.email==='wahid_413@yahoo.com'?'Waheed':'Tutor'
 const firstName=(tutorName||accountFallback).split(/\s+/)[0]
 return <><div className="pageHead tutorWelcomeHead"><div><span className="eyebrow">WELCOME</span><h1>{firstName}</h1></div><Link className="primary btn" to="/students">+ Add student</Link></div>
 <div className="statGrid">
  <Stat label="Active students" value={rows.length} note="Across all courses"/>
  <Stat label="Lessons recorded" value={lessonCount} note="All active students"/>
  <Stat label="Average attendance" value={attendance==null?'—':`${attendance}%`} note={attendance==null?'No lessons recorded':'Recorded lessons'}/>
  <Stat label="Homework to review" value={reviewItems.length} note={reviewItems.length?'New submissions':'Nothing waiting'}/>
 </div>
 {reviewItems.length>0&&<section className="panel submissionInbox"><div className="panelHead"><div><h2>New homework submissions</h2><p>Students waiting for you to review their work.</p></div><span className="notificationCount">{reviewItems.length}</span></div><div className="submissionInboxList">{reviewItems.slice(0,8).map(({sub,student,assignment})=><Link className="submissionInboxItem" to={`/students/${student.id}?assignment=${assignment.id}#classwork-assignment-${assignment.id}`} key={sub.id}><span className="notificationDot"></span><div><b>{student.name}</b><span>{assignment.title}</span><small>Submitted {new Date(sub.submitted_at).toLocaleString('en-GB')}</small></div><strong>Review →</strong></Link>)}</div></section>}
 <div className="twoCol"><section className="panel"><div className="panelHead"><div><h2>Student overview</h2><p>Attendance and recorded lessons across all courses.</p></div></div>{rows.length?<><div className="tableWrap desktopOnly"><table><thead><tr><th>Student</th><th>Courses</th><th>Lessons</th><th>Attendance</th></tr></thead><tbody>{rows.map(s=><tr key={s.id}><td><Link className="studentLink" to={`/students/${s.id}`}>{s.name}</Link></td><td>{s.courses.length?s.courses.join(' · '):(s.course||'—')}</td><td>{s.lessonCount}</td><td>{s.attendance==null?'—':`${s.attendance}%`}</td></tr>)}</tbody></table></div><div className="dashboardStudentCards mobileOnly">{rows.map(s=><Link className="dashboardStudentCard" key={s.id} to={`/students/${s.id}`}><div className="directoryTop"><div><b>{s.name}</b><span>{s.courses.length?s.courses.join(' · '):(s.course||'—')}</span></div></div><div className="studentProgressGrid"><div><span>Lessons</span><b>{s.lessonCount}</b></div><div><span>Attendance</span><b>{s.attendance==null?'—':`${s.attendance}%`}</b></div></div></Link>)}</div></>:<div className="empty">No students yet.</div>}</section>
 <section className="panel"><div className="panelHead"><div><h2>Needs attention</h2><p>Students with low recorded attendance.</p></div></div>{priorities.length?<div className="stack">{priorities.map(s=><div className="infoCard red" key={s.id}><span>{s.name}</span><b>Attendance {s.attendance}%</b><small>{s.courses.length?s.courses.join(' · '):(s.course||'')}</small></div>)}</div>:<div className="empty">No students currently need attention.</div>}</section></div></>
}
const Stat=({label,value,note})=><div className="stat"><span>{label}</span><strong>{value}</strong><small>{note}</small></div>
