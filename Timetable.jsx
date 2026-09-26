import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const DAYS=[
  {n:1,label:'Monday',short:'Mon'}, {n:2,label:'Tuesday',short:'Tue'},
  {n:3,label:'Wednesday',short:'Wed'}, {n:4,label:'Thursday',short:'Thu'},
  {n:5,label:'Friday',short:'Fri'}, {n:6,label:'Saturday',short:'Sat'},
  {n:7,label:'Sunday',short:'Sun'}
]
const blankSession={tutor_id:'',student_ids:[],recurrence:'weekly',day_of_week:1,session_date:'',start_time:'18:00',duration_minutes:60,mode:'online',meeting_url:''}
const blankAvailability={day_of_week:1,start_time:'18:00',end_time:'21:00'}

const pad=n=>String(n).padStart(2,'0')
const dateKey=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
const mondayOf=d=>{const x=new Date(d);x.setHours(12,0,0,0);const day=x.getDay()||7;x.setDate(x.getDate()-day+1);return x}
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x}
const niceDate=d=>d.toLocaleDateString('en-GB',{day:'numeric',month:'short'})
const niceTime=t=>String(t||'').slice(0,5)
const mins=t=>{const [h,m]=String(t||'00:00').split(':').map(Number);return h*60+m}
const timeFromMins=n=>`${pad(Math.floor(n/60))}:${pad(n%60)}`

export default function Timetable(){
  const {user}=useAuth()
  const [isOwner,setIsOwner]=useState(false),[profiles,setProfiles]=useState([]),[students,setStudents]=useState([]),[links,setLinks]=useState([])
  const [sessions,setSessions]=useState([]),[sessionStudents,setSessionStudents]=useState([]),[availability,setAvailability]=useState([])
  const [selectedTutor,setSelectedTutor]=useState(user?.id||''),[weekStart,setWeekStart]=useState(()=>mondayOf(new Date()))
  const [loading,setLoading]=useState(true),[error,setError]=useState(''),[sessionOpen,setSessionOpen]=useState(false),[availabilityOpen,setAvailabilityOpen]=useState(false)
  const [sessionForm,setSessionForm]=useState({...blankSession,tutor_id:user?.id||''}),[availabilityForm,setAvailabilityForm]=useState(blankAvailability),[editingId,setEditingId]=useState(null),[saving,setSaving]=useState(false)

  const load=async()=>{
    setLoading(true);setError('')
    const {data:ownerFlag}=await supabase.rpc('is_owner')
    setIsOwner(ownerFlag===true)
    const [p,s,l,ts,tss,a]=await Promise.all([
      supabase.from('profiles').select('id,full_name,role').in('role',['owner','tutor']).order('full_name'),
      supabase.from('students').select('id,name,course,active').eq('active',true).order('name'),
      supabase.from('student_tutors').select('student_id,tutor_id'),
      supabase.from('timetable_sessions').select('*').eq('active',true).order('start_time'),
      supabase.from('timetable_session_students').select('session_id,student_id'),
      supabase.from('tutor_availability').select('*').eq('active',true).order('day_of_week').order('start_time')
    ])
    const firstError=[p,s,l,ts,tss,a].find(x=>x.error)?.error
    if(firstError)setError(firstError.message)
    const profileRows=p.data||[]
    setProfiles(profileRows);setStudents(s.data||[]);setLinks(l.data||[]);setSessions(ts.data||[]);setSessionStudents(tss.data||[]);setAvailability(a.data||[])
    if(!selectedTutor)setSelectedTutor(user?.id||profileRows[0]?.id||'')
    setLoading(false)
  }
  useEffect(()=>{if(user?.id)load()},[user?.id])

  const tutorName=id=>profiles.find(p=>p.id===id)?.full_name|| (id===user?.id?'My timetable':'Tutor')
  const studentName=id=>students.find(s=>s.id===id)?.name||'Student'
  const studentsForTutor=id=>students.filter(s=>links.some(l=>l.student_id===s.id&&l.tutor_id===id))
  const weekDates=useMemo(()=>DAYS.map((d,i)=>({...d,date:addDays(weekStart,i),key:dateKey(addDays(weekStart,i))})),[weekStart])
  const visibleTutorIds=selectedTutor==='all'?profiles.map(p=>p.id):[selectedTutor||user?.id]
  const visibleSessions=useMemo(()=>sessions.filter(s=>visibleTutorIds.includes(s.tutor_id)),[sessions,visibleTutorIds.join('|')])
  const visibleAvailability=useMemo(()=>availability.filter(a=>visibleTutorIds.includes(a.tutor_id)),[availability,visibleTutorIds.join('|')])

  const sessionsForDay=day=>visibleSessions.filter(s=>{
    if(s.recurrence==='weekly') return Number(s.day_of_week)===day.n
    return s.session_date===day.key
  }).sort((a,b)=>String(a.start_time).localeCompare(String(b.start_time)))
  const studentIdsForSession=id=>sessionStudents.filter(x=>x.session_id===id).map(x=>x.student_id)

  const freeSlotsForDay=day=>{
    if(selectedTutor==='all')return []
    const windows=visibleAvailability.filter(a=>Number(a.day_of_week)===day.n)
    const booked=sessionsForDay(day)
    const slots=[]
    windows.forEach(w=>{
      for(let t=mins(w.start_time);t+60<=mins(w.end_time);t+=60){
        const overlap=booked.some(s=>{const a=mins(s.start_time),b=a+Number(s.duration_minutes||60);return t<b&&t+60>a})
        if(!overlap)slots.push(timeFromMins(t))
      }
    })
    return [...new Set(slots)]
  }

  const openNew=(day=null,start='')=>{
    const tutorId=selectedTutor==='all'?(user?.id||''):selectedTutor
    setEditingId(null)
    setSessionForm({...blankSession,tutor_id:tutorId,day_of_week:day?.n||1,session_date:day?.key||'',start_time:start||'18:00'})
    setSessionOpen(true)
  }
  const openEdit=s=>{
    setEditingId(s.id)
    setSessionForm({tutor_id:s.tutor_id,student_ids:studentIdsForSession(s.id),recurrence:s.recurrence||'weekly',day_of_week:Number(s.day_of_week||1),session_date:s.session_date||'',start_time:niceTime(s.start_time),duration_minutes:Number(s.duration_minutes||60),mode:s.mode||'online',meeting_url:s.meeting_url||''})
    setSessionOpen(true)
  }
  const toggleStudent=id=>setSessionForm(f=>({...f,student_ids:f.student_ids.includes(id)?f.student_ids.filter(x=>x!==id):[...f.student_ids,id]}))

  const saveSession=async e=>{
    e.preventDefault();setError('')
    if(!sessionForm.student_ids.length){setError('Choose at least one student for the lesson.');return}
    if(sessionForm.recurrence==='one_off'&&!sessionForm.session_date){setError('Choose the date for the one-off lesson.');return}
    setSaving(true)
    const payload={tutor_id:sessionForm.tutor_id,start_time:sessionForm.start_time,duration_minutes:Number(sessionForm.duration_minutes),mode:sessionForm.mode,meeting_url:sessionForm.meeting_url.trim()||null,recurrence:sessionForm.recurrence,active:true,day_of_week:sessionForm.recurrence==='weekly'?Number(sessionForm.day_of_week):null,session_date:sessionForm.recurrence==='one_off'?sessionForm.session_date:null}
    let id=editingId
    if(editingId){
      const {error}=await supabase.from('timetable_sessions').update(payload).eq('id',editingId)
      if(error){setError(error.message);setSaving(false);return}
      const {error:delError}=await supabase.from('timetable_session_students').delete().eq('session_id',editingId)
      if(delError){setError(delError.message);setSaving(false);return}
    }else{
      const {data,error}=await supabase.from('timetable_sessions').insert(payload).select('id').single()
      if(error){setError(error.message);setSaving(false);return}
      id=data.id
    }
    const {error:linkError}=await supabase.from('timetable_session_students').insert(sessionForm.student_ids.map(student_id=>({session_id:id,student_id})))
    if(linkError){setError(linkError.message);setSaving(false);return}
    setSessionOpen(false);setSaving(false);await load()
  }
  const deleteSession=async()=>{
    if(!editingId||!window.confirm('Delete this timetable lesson?'))return
    setSaving(true);setError('')
    const {error:e1}=await supabase.from('timetable_session_students').delete().eq('session_id',editingId)
    const {error:e2}=e1?{error:null}:await supabase.from('timetable_sessions').delete().eq('id',editingId)
    if(e1||e2)setError((e1||e2).message);else{setSessionOpen(false);await load()}
    setSaving(false)
  }

  const addAvailability=async e=>{
    e.preventDefault();setError('')
    const tutorId=selectedTutor==='all'?(user?.id||''):selectedTutor
    if(mins(availabilityForm.end_time)<=mins(availabilityForm.start_time)){setError('Availability end time must be after the start time.');return}
    setSaving(true)
    const {error}=await supabase.from('tutor_availability').insert({tutor_id:tutorId,day_of_week:Number(availabilityForm.day_of_week),start_time:availabilityForm.start_time,end_time:availabilityForm.end_time,active:true})
    if(error)setError(error.message);else{setAvailabilityForm(blankAvailability);await load()}
    setSaving(false)
  }
  const removeAvailability=async id=>{
    const {error}=await supabase.from('tutor_availability').delete().eq('id',id)
    if(error)setError(error.message);else await load()
  }

  if(loading)return <div className="loading">Loading timetable…</div>
  const activeTutor=selectedTutor==='all'?null:(selectedTutor||user?.id)
  const availableStudents=studentsForTutor(sessionForm.tutor_id)
  return <>
    <div className="pageHead timetableHead"><div><span className="eyebrow">TIMETABLE</span><h1>Weekly timetable</h1></div><div className="timetableHeadActions"><button className="ghost" onClick={()=>setAvailabilityOpen(true)} disabled={selectedTutor==='all'}>Manage availability</button><button className="primary btn" onClick={()=>openNew()}>+ Add lesson</button></div></div>
    {error&&<div className="errorBox">{error}</div>}
    <section className="panel timetableControls">
      <div className="tutorViewControl"><span>Timetable</span>{isOwner?<select value={selectedTutor} onChange={e=>setSelectedTutor(e.target.value)}><option value={user?.id}>My timetable</option>{profiles.filter(p=>p.id!==user?.id).map(p=><option key={p.id} value={p.id}>{p.full_name}</option>)}<option value="all">All tutors</option></select>:<strong>My timetable</strong>}</div>
      <div className="weekNav"><button className="ghost" onClick={()=>setWeekStart(addDays(weekStart,-7))}>←</button><button className="ghost" onClick={()=>setWeekStart(mondayOf(new Date()))}>Today</button><b>{niceDate(weekStart)} – {niceDate(addDays(weekStart,6))}</b><button className="ghost" onClick={()=>setWeekStart(addDays(weekStart,7))}>→</button></div>
    </section>

    <section className="timetableWeek">
      {weekDates.map(day=>{const booked=sessionsForDay(day),free=freeSlotsForDay(day);return <article className="timetableDay" key={day.key}>
        <header><div><b>{day.short}</b><span>{niceDate(day.date)}</span></div><button className="dayAdd" onClick={()=>openNew(day)}>+</button></header>
        <div className="dayBody">
          {booked.map(s=>{const ids=studentIdsForSession(s.id);return <button className="bookedSlot" key={s.id} onClick={()=>openEdit(s)}><span className="slotTime">{niceTime(s.start_time)}–{timeFromMins(mins(s.start_time)+Number(s.duration_minutes||60))}</span><b>{ids.map(studentName).join(', ')||'Lesson'}</b><small>{s.mode==='online'?'Online':'In person'}{selectedTutor==='all'?` · ${tutorName(s.tutor_id)}`:''}{ids.length>1?' · Group':''}</small></button>})}
          {free.map(t=><button className="freeSlot" key={t} onClick={()=>openNew(day,t)}><span>{t}</span><b>Free</b></button>)}
          {!booked.length&&!free.length&&<div className="closedSlot">{selectedTutor==='all'?'No lessons':'Not available'}</div>}
        </div>
      </article>})}
    </section>
    {activeTutor&&visibleAvailability.length===0&&<section className="panel timetableEmpty"><b>No teaching availability set yet</b><p>Add the hours you are available to teach. The timetable will then show the unbooked times as Free.</p><button className="textButton" onClick={()=>setAvailabilityOpen(true)}>Set availability →</button></section>}

    {sessionOpen&&<div className="modalBackdrop" onMouseDown={()=>setSessionOpen(false)}><div className="modalCard timetableModal" onMouseDown={e=>e.stopPropagation()}><div className="modalHead"><div><span className="eyebrow">{editingId?'LESSON':'NEW LESSON'}</span><h2>{editingId?'Edit timetable lesson':'Add timetable lesson'}</h2></div><button className="ghost" onClick={()=>setSessionOpen(false)}>Close</button></div><form className="formGrid" onSubmit={saveSession}>
      {isOwner&&<label>Tutor<select value={sessionForm.tutor_id} onChange={e=>setSessionForm({...sessionForm,tutor_id:e.target.value,student_ids:[]})}>{profiles.map(p=><option key={p.id} value={p.id}>{p.id===user?.id?'Anisha (Owner)':p.full_name}</option>)}</select></label>}
      <label>Lesson type<select value={sessionForm.recurrence} onChange={e=>setSessionForm({...sessionForm,recurrence:e.target.value})}><option value="weekly">Weekly recurring</option><option value="one_off">One-off lesson</option></select></label>
      {sessionForm.recurrence==='weekly'?<label>Day<select value={sessionForm.day_of_week} onChange={e=>setSessionForm({...sessionForm,day_of_week:Number(e.target.value)})}>{DAYS.map(d=><option key={d.n} value={d.n}>{d.label}</option>)}</select></label>:<label>Date<input type="date" required value={sessionForm.session_date} onChange={e=>setSessionForm({...sessionForm,session_date:e.target.value})}/></label>}
      <label>Start time<input type="time" required value={sessionForm.start_time} onChange={e=>setSessionForm({...sessionForm,start_time:e.target.value})}/></label>
      <label>Duration<select value={sessionForm.duration_minutes} onChange={e=>setSessionForm({...sessionForm,duration_minutes:Number(e.target.value)})}><option value="30">30 minutes</option><option value="45">45 minutes</option><option value="60">1 hour</option><option value="90">1.5 hours</option><option value="120">2 hours</option></select></label>
      <label>Mode<select value={sessionForm.mode} onChange={e=>setSessionForm({...sessionForm,mode:e.target.value})}><option value="online">Online</option><option value="in_person">In person</option></select></label>
      <label className="full">Teams / meeting link<input placeholder="Optional" value={sessionForm.meeting_url} onChange={e=>setSessionForm({...sessionForm,meeting_url:e.target.value})}/></label>
      <div className="full studentPicker"><span className="formSectionLabel">Student{sessionForm.student_ids.length>1?'s':''}</span>{availableStudents.length?<div className="studentPickGrid">{availableStudents.map(s=><label className={sessionForm.student_ids.includes(s.id)?'picked':''} key={s.id}><input type="checkbox" checked={sessionForm.student_ids.includes(s.id)} onChange={()=>toggleStudent(s.id)}/><span><b>{s.name}</b><small>{s.course}</small></span></label>)}</div>:<p>No students are assigned to this tutor yet.</p>}<small>Select more than one student to create a group lesson.</small></div>
      <div className="full modalFooter">{editingId&&<button type="button" className="dangerButton" onClick={deleteSession} disabled={saving}>Delete lesson</button>}<button className="primary" disabled={saving}>{saving?'Saving…':editingId?'Save changes':'Add lesson'}</button></div>
    </form></div></div>}

    {availabilityOpen&&<div className="modalBackdrop" onMouseDown={()=>setAvailabilityOpen(false)}><div className="modalCard availabilityModal" onMouseDown={e=>e.stopPropagation()}><div className="modalHead"><div><span className="eyebrow">AVAILABILITY</span><h2>{selectedTutor==='all'?'Teaching availability':`${tutorName(activeTutor)} availability`}</h2></div><button className="ghost" onClick={()=>setAvailabilityOpen(false)}>Close</button></div>
      <form className="availabilityAdd" onSubmit={addAvailability}><label>Day<select value={availabilityForm.day_of_week} onChange={e=>setAvailabilityForm({...availabilityForm,day_of_week:Number(e.target.value)})}>{DAYS.map(d=><option key={d.n} value={d.n}>{d.label}</option>)}</select></label><label>From<input type="time" value={availabilityForm.start_time} onChange={e=>setAvailabilityForm({...availabilityForm,start_time:e.target.value})}/></label><label>To<input type="time" value={availabilityForm.end_time} onChange={e=>setAvailabilityForm({...availabilityForm,end_time:e.target.value})}/></label><button className="primary" disabled={saving}>Add hours</button></form>
      <div className="availabilityList">{availability.filter(a=>a.tutor_id===activeTutor).length?availability.filter(a=>a.tutor_id===activeTutor).map(a=><div className="availabilityRow" key={a.id}><div><b>{DAYS.find(d=>d.n===Number(a.day_of_week))?.label}</b><span>{niceTime(a.start_time)} – {niceTime(a.end_time)}</span></div><button className="textButton dangerText" onClick={()=>removeAvailability(a.id)}>Remove</button></div>):<div className="empty">No availability added yet.</div>}</div>
    </div></div>}
  </>
}
