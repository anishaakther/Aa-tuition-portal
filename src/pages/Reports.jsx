import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { areaProgressFor, displayTopicName, progressSnapshot } from '../lib/gcseCurriculum'
import { statusFor } from '../components/StatusBadge'

const masteryLabel = status => ({ red:'Developing', amber:'Progressing', green:'Secure' }[status] || status)
const formatDate = value => value ? new Date(`${value}T12:00:00`).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : '—'

export default function Reports(){
 const [students,setStudents]=useState([]),[id,setId]=useState(''),[report,setReport]=useState(null),[loading,setLoading]=useState(false),[error,setError]=useState('')
 useEffect(()=>{supabase.from('students').select('*').eq('active',true).order('name').then(({data,error})=>{setStudents(data||[]);if(error)setError(error.message)})},[])
 const selected=useMemo(()=>students.find(x=>x.id===id),[students,id])
 const generate=async()=>{
  if(!selected)return
  setLoading(true);setError('')
  const [{data:l,error:le},{data:a,error:ae},{data:t,error:te}]=await Promise.all([
   supabase.from('lessons').select('*').eq('student_id',id).order('lesson_date',{ascending:false}),
   supabase.from('assessments').select('*').eq('student_id',id).order('taken_on',{ascending:false}),
   supabase.from('topic_progress').select('*').eq('student_id',id).order('topic')
  ])
  const e=le||ae||te;if(e){setError(e.message);setLoading(false);return}
  const lessons=l||[], assessments=a||[], topics=t||[]
  const valid=lessons.filter(x=>x.attendance!=='cancelled')
  const attendance=valid.length?Math.round(valid.filter(x=>x.attendance==='present').length/valid.length*100):null
  const student=progressSnapshot(selected,topics)
  const progressConfigured=student.automatic||Number(student.progress)!==0||Number(student.expected_progress)!==0
  const progressStatus=student.expectedConfigured?statusFor(student):null
  const areas=student.automatic?areaProgressFor(selected,topics):[]
  const strengths=[...topics].filter(x=>x.status==='green').sort((a,b)=>new Date(b.updated_at||0)-new Date(a.updated_at||0)).slice(0,3)
  const focus=[...topics].filter(x=>x.status==='amber'||x.status==='red').sort((a,b)=>{const rank={amber:0,red:1};return rank[a.status]-rank[b.status]||new Date(b.updated_at||0)-new Date(a.updated_at||0)}).slice(0,3)
  setReport({student,lessons,assessments,topics,areas,strengths,focus,attendance,progressConfigured,progressStatus,generated:new Date()})
  setLoading(false)
 }
 const share=async()=>{
  if(!report||!navigator.share)return
  const latest=report.assessments[0]
  const text=`${report.student.name} – ${report.student.course}\nTarget: ${report.student.target_grade||'—'} | Working: ${report.student.working_grade||'—'}\nAttendance: ${report.attendance==null?'No lessons recorded':`${report.attendance}%`}${latest?`\nLatest assessment: ${latest.title} – ${Math.round(latest.score/latest.total*100)}%`:''}\n\n${report.student.tutor_update||''}`
  try{await navigator.share({title:`${report.student.name} – AA Tuition progress report`,text})}catch{}
 }
 return <><div className="pageHead noPrint"><div><span className="eyebrow">REPORTS</span><h1>Parent progress reports</h1></div></div>{error&&<div className="errorBox">{error}</div>}<section className="panel reportBuilder noPrint"><label>Student<select value={id} onChange={e=>{setId(e.target.value);setReport(null)}}><option value="">Select a student</option>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><button className="primary btn" disabled={!id||loading} onClick={generate}>{loading?'Generating…':'Generate report'}</button></section>
 {report?<ReportPreview report={report} onShare={share}/>:<section className="reportEmpty noPrint"><span className="eyebrow">PREVIEW</span><h3>Parent-friendly report</h3><p>Select a student and generate a report.</p></section>}</>
}

function ReportPreview({report,onShare}){
 const {student:s,lessons,assessments,topics,areas=[],strengths=[],focus=[],attendance,progressConfigured,progressStatus,generated}=report
 const latest=assessments[0]
 return <section className="parentReport" id="parent-report">
  <div className="reportActions noPrint"><button className="ghost" onClick={()=>window.print()}>Print / Save PDF</button>{typeof navigator!=='undefined'&&navigator.share&&<button className="primary" onClick={onShare}>Share summary</button>}</div>
  <header className="reportHeader"><div><div className="reportBrand">AA Tuition</div><div className="reportTitle">Student Progress Report</div></div><div className="reportDate">Report date<br/><b>{generated.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</b></div></header>
  <div className="reportStudent"><span className="eyebrow">{s.course}{s.exam_board?` · ${s.exam_board}`:''}{s.tier?` · ${s.tier} Tier`:''}</span><h2>{s.name}</h2><div className="reportGradeLine"><span>Target grade <b>{s.target_grade||'—'}</b></span><span>Working grade <b>{s.working_grade||'—'}</b></span>{progressStatus&&<span className={`reportStatus ${progressStatus.tone}`}>{progressStatus.label}</span>}</div></div>
  <div className="reportMetrics"><ReportMetric label="Attendance" value={attendance==null?'—':`${attendance}%`} note={attendance==null?'No lessons recorded':'Across recorded lessons'}/><ReportMetric label="Assessments" value={assessments.length} note="Results recorded"/>{latest&&<ReportMetric label="Latest result" value={`${Math.round(latest.score/latest.total*100)}%`} note={latest.title}/>}</div>
  {progressConfigured&&<ReportSection title="Course progress"><div className="reportProgress"><div><span>Mastery</span><b>{s.progress}%</b></div><div><span>Expected by now</span><b>{s.expectedConfigured?`${s.expected_progress}%`:'—'}</b></div></div></ReportSection>}
  {latest&&<ReportSection title="Recent assessment"><div className="reportAssessment"><div><b>{latest.title}</b><span>{formatDate(latest.taken_on)}</span></div><strong>{latest.score}/{latest.total}<small>{Math.round(latest.score/latest.total*100)}%</small></strong></div></ReportSection>}
  {areas.length>0&&<ReportSection title="Curriculum overview"><div className="reportAreaGrid">{areas.map(area=><div className="reportArea" key={area.key}><div><b>{area.name}</b><span>{area.rated}/{area.total} topics assessed</span></div><strong>{area.score}%</strong></div>)}</div></ReportSection>}
  {(strengths.length>0||focus.length>0)&&<ReportSection title="Learning highlights"><div className="reportHighlights">{strengths.length>0&&<div className="reportHighlightGroup"><span>Strengths</span><div className="reportTopics">{strengths.map(t=><div className="reportTopic" key={t.id}><span className="dot green"></span><b>{displayTopicName(t.topic)}</b><span>Secure</span></div>)}</div></div>}{focus.length>0&&<div className="reportHighlightGroup"><span>Current focus / next steps</span><div className="reportTopics">{focus.map(t=><div className="reportTopic" key={t.id}><span className={`dot ${t.status}`}></span><b>{displayTopicName(t.topic)}</b><span>{masteryLabel(t.status)}</span></div>)}</div></div>}</div></ReportSection>}
  {s.tutor_update&&<ReportSection title="Tutor's comments"><p className="reportComment">{s.tutor_update}</p></ReportSection>}
  {lessons.length>0&&<ReportSection title="Recent learning"><div className="reportLessons">{lessons.slice(0,5).map(l=><article key={l.id} className="reportLesson"><div className="reportLessonHead"><div><b>{l.topic}</b><span>{formatDate(l.lesson_date)} · {l.attendance} · {l.duration_minutes} mins</span></div></div>{l.notes&&<div className="reportField"><span>Lesson notes</span><p>{l.notes}</p></div>}{l.homework&&<div className="reportField homework"><span>Homework set</span><p>{l.homework}</p></div>}</article>)}</div></ReportSection>}
  <footer className="reportFooter">AA Tuition · Student Progress Report</footer>
 </section>
}
const ReportMetric=({label,value,note})=><div className="reportMetric"><span>{label}</span><strong>{value}</strong><small>{note}</small></div>
const ReportSection=({title,children})=><section className="reportSection"><h3>{title}</h3>{children}</section>
