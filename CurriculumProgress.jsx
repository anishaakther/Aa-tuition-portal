import { useMemo, useState } from 'react'
import ProgressBar from './ProgressBar'
import { areaProgressFor, displayTopicName, MASTERY_LABEL } from '../lib/gcseCurriculum'

export default function CurriculumProgress({student,topics=[]}){
  const [open,setOpen]=useState({}),[openChapters,setOpenChapters]=useState({})
  const areas=useMemo(()=>areaProgressFor(student,topics),[student,topics])
  const statusByTopic=useMemo(()=>new Map(topics.map(t=>[t.topic,t.status])),[topics])
  const statusByCurriculumId=useMemo(()=>new Map(topics.filter(t=>t.curriculum_topic_id).map(t=>[t.curriculum_topic_id,t.status])),[topics])
  const secure=topics.filter(t=>t.status==='green').slice(0,3)
  const focus=[...topics.filter(t=>t.status==='red'),...topics.filter(t=>t.status==='amber')].slice(0,3)
  if(!areas.length)return <div className="empty">Topic progress is not configured for this course yet.</div>
  return <>
    <div className="curriculumAreas">
      {areas.map(area=>{const expanded=!!open[area.key];return <div className={`curriculumArea ${expanded?'open':''}`} key={area.key}>
        <button className="curriculumAreaHead" onClick={()=>setOpen(v=>({...v,[area.key]:!expanded}))} aria-expanded={expanded}>
          <div className="curriculumAreaTitle"><b>{area.name}</b><span>{area.rated} of {area.total} topics rated</span></div><strong>{area.score}%</strong><span className={`curriculumChevron ${expanded?'expanded':''}`}>⌄</span>
        </button><div className="curriculumBar"><ProgressBar value={area.score}/></div>
        {expanded&&area.kind==='gcse'&&<div className="curriculumTopicList">{area.topics.map(name=>{const status=statusByTopic.get(name);return <div className="curriculumTopicRow" key={name}><span>{name}</span><b className={status||'notStarted'}>{status?MASTERY_LABEL[status]:'Not started'}</b></div>})}</div>}
        {expanded&&area.kind!=='gcse'&&<div className="curriculumChapters">{area.chapters.map(ch=>{const ck=`${area.key}-${ch.number}`,co=!!openChapters[ck];return <div className="curriculumChapter" key={ck}><button className="curriculumChapterHead" onClick={()=>setOpenChapters(v=>({...v,[ck]:!co}))}><div><b>Chapter {ch.number} — {ch.name}</b><span>{ch.rated} of {ch.total} topics rated</span></div><div><strong>{ch.score}%</strong><span className={`chapterChevron ${co?'expanded':''}`}>⌄</span></div></button>{co&&<div className="curriculumTopicList">{ch.topics.map(t=>{const status=(t.id&&statusByCurriculumId.get(t.id))||statusByTopic.get(t.key);return <div className="curriculumTopicRow" key={t.key}><span><small>{t.number}</small> {t.name}</span><b className={status||'notStarted'}>{status?MASTERY_LABEL[status]:'Not started'}</b></div>})}</div>}</div>})}</div>}
      </div>})}
    </div>
    <div className="progressHighlights"><div><span className="eyebrow">STRENGTHS</span>{secure.length?secure.map(t=><p key={t.id}><span className="dot green"></span>{displayTopicName(t.topic)}</p>):<p className="mutedHighlight">Secure topics will appear here.</p>}</div><div><span className="eyebrow">CURRENT FOCUS</span>{focus.length?focus.map(t=><p key={t.id}><span className={`dot ${t.status}`}></span>{displayTopicName(t.topic)}<small>{MASTERY_LABEL[t.status]}</small></p>):<p className="mutedHighlight">No topics currently require additional focus.</p>}</div></div>
  </>
}
