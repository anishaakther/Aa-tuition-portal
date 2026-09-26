import { useMemo, useState } from 'react'
import ProgressBar from './ProgressBar'
import { areaProgressFor, MASTERY_LABEL } from '../lib/gcseCurriculum'

export default function CurriculumEditor({student,topics=[],onSetTopic}){
 const [open,setOpen]=useState({}),[openChapters,setOpenChapters]=useState({})
 const areas=useMemo(()=>areaProgressFor(student,topics),[student,topics])
 const byTopic=useMemo(()=>new Map(topics.map(t=>[t.topic,t])),[topics])
 const byCurriculumId=useMemo(()=>new Map(topics.filter(t=>t.curriculum_topic_id).map(t=>[t.curriculum_topic_id,t])),[topics])
 return <div className="curriculumAreas">{areas.map(area=>{const ao=!!open[area.key];return <div className="curriculumArea" key={area.key}><button className="curriculumAreaHead" onClick={()=>setOpen(v=>({...v,[area.key]:!ao}))}><div><b>{area.name}</b><span>{area.rated} of {area.total} topics rated</span></div><div><strong>{area.score}%</strong><span className={`curriculumChevron ${ao?'expanded':''}`}>⌄</span></div></button><ProgressBar value={area.score}/>
 {ao&&area.kind==='gcse'&&<div className="curriculumTopics">{area.topics.map(name=>{const current=byTopic.get(name);return <button key={name} className={`curriculumTopic ${current?.status||'notStarted'}`} onClick={()=>onSetTopic(name,current)}><span className={`dot ${current?.status||'notStarted'}`}></span><span>{name}</span><b>{current?MASTERY_LABEL[current.status]:'Not started'}</b></button>})}</div>}
 {ao&&area.kind!=='gcse'&&<div className="curriculumChapters">{area.chapters.map(ch=>{const ck=`${area.key}-${ch.number}`,co=!!openChapters[ck];return <div className="curriculumChapter" key={ck}><button className="curriculumChapterHead" onClick={()=>setOpenChapters(v=>({...v,[ck]:!co}))}><div><b>Chapter {ch.number} — {ch.name}</b><span>{ch.rated} of {ch.total} topics rated</span></div><div><strong>{ch.score}%</strong><span className={`chapterChevron ${co?'expanded':''}`}>⌄</span></div></button>{co&&<div className="curriculumTopics nestedCurriculumTopics">{ch.topics.map(t=>{const current=(t.id&&byCurriculumId.get(t.id))||byTopic.get(t.key);return <button key={t.key} className={`curriculumTopic ${current?.status||'notStarted'}`} onClick={()=>onSetTopic(t.key,current,t.id)}><span className={`dot ${current?.status||'notStarted'}`}></span><span><small className="topicNumber">{t.number}</small>{t.name}</span><b>{current?MASTERY_LABEL[current.status]:'Not started'}</b></button>})}</div>}</div>})}</div>}
 </div>})}</div>
}
