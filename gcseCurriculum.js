import { A_LEVEL_MATHS_MODULES, A_LEVEL_MATHS_DEFAULT_MODULES, FURTHER_MATHS_MODULES, FURTHER_MATHS_DEFAULT_MODULES } from './aLevelCurriculum'
export const GCSE_AREAS = [
  {
    key:'number', name:'Number', topics:[
      ['Four operations','both'],['Place value & ordering','both'],['Negative numbers','both'],['Fractions','both'],['Decimals','both'],['Percentages','both'],['Fraction, decimal & percentage conversions','both'],['Ratio of amounts','both'],['Standard form','both'],['Indices','both'],['Roots','both'],['Prime factors, HCF & LCM','both'],['Recurring decimals','higher'],['Estimation','both'],['Bounds & error intervals','both'],['Calculator skills','both'],['Surds','higher'],['Fractional & negative indices','higher'],['Number proof','higher']
    ]
  },
  {
    key:'algebra', name:'Algebra', topics:[
      ['Simplifying expressions','both'],['Expanding brackets','both'],['Factorising','both'],['Algebraic fractions','higher'],['Substitution','both'],['Forming expressions & equations','both'],['Solving linear equations','both'],['Rearranging formulae','both'],['Inequalities','both'],['Sequences','both'],['Straight-line graphs','both'],['Real-life graphs','both'],['Quadratic expressions','both'],['Factorising quadratics','both'],['Solving quadratics','both'],['Quadratic Formula','higher'],['Completing the square','higher'],['Simultaneous equations','both'],['Graphical simultaneous equations','higher'],['Functions','higher'],['Iteration','higher'],['Algebraic proof','higher'],['Cubic & reciprocal graphs','higher'],['Transformations of graphs','higher']
    ]
  },
  {
    key:'ratio', name:'Ratio, Proportion & Rates of Change', topics:[
      ['Simplifying ratio','both'],['Sharing in a ratio','both'],['Direct proportion','both'],['Inverse proportion','higher'],['Best buys','both'],['Recipes','both'],['Scale drawings','both'],['Compound measures','both'],['Speed, distance & time','both'],['Density','both'],['Pressure','both'],['Percentage change','both'],['Reverse percentages','both'],['Compound interest','both'],['Growth & decay','both'],['Proportion graphs','both'],['Rates of change','higher']
    ]
  },
  {
    key:'geometry', name:'Geometry & Measures', topics:[
      ['Angles','both'],['Parallel lines','both'],['Polygons','both'],['Bearings','both'],['Perimeter','both'],['Area','both'],['Circles','both'],['Arc length & sectors','higher'],['Volume','both'],['Surface area','both'],['Units & conversions','both'],['Pythagoras','both'],['Trigonometry','both'],['Exact trig values','higher'],['Sine rule','higher'],['Cosine rule','higher'],['Area using ½ab sin C','higher'],['Similarity','both'],['Congruence','both'],['Transformations','both'],['Enlargements','both'],['Vectors','both'],['Plans & elevations','both'],['Loci & constructions','both'],['Geometric proof','higher'],['Circle theorems','higher']
    ]
  },
  {
    key:'probability', name:'Probability', topics:[
      ['Basic probability','both'],['Relative frequency','both'],['Expected frequency','both'],['Sample spaces','both'],['Two-way tables','both'],['Frequency trees','both'],['Venn diagrams','both'],['Tree diagrams','both'],['Independent events','both'],['Conditional probability','higher']
    ]
  },
  {
    key:'statistics', name:'Statistics', topics:[
      ['Averages','both'],['Range','both'],['Frequency tables','both'],['Grouped data','both'],['Bar charts','both'],['Pie charts','both'],['Line graphs','both'],['Time series','both'],['Scatter graphs','both'],['Histograms','higher'],['Cumulative frequency','higher'],['Box plots','both'],['Stem-and-leaf','both'],['Sampling','both'],['Comparing distributions','both']
    ]
  }
]

export const MASTERY = { red:33, amber:67, green:100 }
export const MASTERY_LABEL = { red:'Developing', amber:'Progressing', green:'Secure' }

export const isGcseMaths = student => /gcse\s*(mathematics|maths)/i.test(student?.course || '')
export const isCombinedScience = student => /gcse\s*combined\s*science/i.test(student?.course || '')
export const isFurtherMaths = student => /(further\s*(mathematics|maths)|a[- ]?level\s*fm)/i.test(student?.course || '')
export const isALevelMaths = student => !isFurtherMaths(student) && /(a[- ]?level.*(mathematics|maths)|(mathematics|maths).*a[- ]?level)/i.test(student?.course || '')

const topicKey=(course,moduleKey,chapterNumber,topic)=>`${course}|${moduleKey}|${chapterNumber}|${topic.number}|${topic.name}`
const selectedFurtherModules=student=>{
  const selected=Array.isArray(student?.curriculum_modules)?student.curriculum_modules.filter(Boolean):[]
  return selected.length?selected:FURTHER_MATHS_DEFAULT_MODULES
}
const selectedALevelModules=student=>{
  const selected=Array.isArray(student?.curriculum_modules)?student.curriculum_modules.filter(Boolean):[]
  return selected.length?selected:A_LEVEL_MATHS_DEFAULT_MODULES
}
const decorateModules=(course,modules,selected)=>modules.filter(m=>selected.includes(m.key)).map(m=>({
  ...m,
  chapters:m.chapters.map(c=>({...c,topics:c.topics.map(t=>({...t,key:topicKey(course,m.key,c.number,t)}))}))
}))

export const availableCurriculumModules=student=>isFurtherMaths(student)?FURTHER_MATHS_MODULES:isALevelMaths(student)?A_LEVEL_MATHS_MODULES:[]
export const curriculumTitle=student=>isGcseMaths(student)?'GCSE Mathematics curriculum mastery':isCombinedScience(student)?'GCSE Combined Science curriculum mastery':isFurtherMaths(student)?'A-Level Further Maths curriculum mastery':isALevelMaths(student)?'A-Level Maths curriculum mastery':'Curriculum mastery'
export const hasAutomaticCurriculum = student => ((isGcseMaths(student)||isCombinedScience(student)) && ['foundation','higher'].includes((student?.tier || '').toLowerCase())) || isALevelMaths(student) || isFurtherMaths(student)

export function curriculumFor(student){
  if(isGcseMaths(student)){
    const tier=(student?.tier||'').toLowerCase()
    if(!['foundation','higher'].includes(tier)) return []
    return GCSE_AREAS.map(area=>({
      ...area,
      kind:'gcse',
      topics:area.topics.filter(([,t])=>t==='both'||tier==='higher').map(([name])=>name)
    }))
  }
  const dbRows=Array.isArray(student?.curriculum_rows)?student.curriculum_rows:[]
  if(isCombinedScience(student)&&dbRows.length){
    const tier=(student?.tier||'').toLowerCase()
    const filtered=dbRows.filter(r=>tier==='higher'||!r.higher_only)
    const subjects=['Biology','Chemistry','Physics'].filter(subject=>filtered.some(r=>r.subject===subject))
    return subjects.map(subject=>{
      const subjectRows=filtered.filter(r=>r.subject===subject).sort((a,b)=>Number(a.position||0)-Number(b.position||0))
      const chapterNumbers=[...new Set(subjectRows.map(r=>r.chapter_number))]
      return {
        key:`science-${subject.toLowerCase()}`, name:subject, kind:'science',
        chapters:chapterNumbers.map(chapterNumber=>{
          const rows=subjectRows.filter(r=>r.chapter_number===chapterNumber)
          return {number:chapterNumber,name:rows[0]?.chapter_name||'',topics:rows.map(r=>({id:r.id,number:r.topic_number,name:r.topic_name,key:`${student.course}|${subject}|${r.topic_number}|${r.topic_name}`,higher_only:!!r.higher_only}))}
        })
      }
    })
  }
  if((isFurtherMaths(student)||isALevelMaths(student))&&dbRows.length){
    const selected=isFurtherMaths(student)?(Array.isArray(student?.curriculum_modules)&&student.curriculum_modules.length?student.curriculum_modules:['Core Pure 1','Core Pure 2']):null
    const filtered=selected?dbRows.filter(r=>selected.includes(r.module)):dbRows
    const preferred=isFurtherMaths(student)?['Core Pure 1','Core Pure 2','Further Pure 1','Further Pure 2','Further Statistics 1','Further Statistics 2','Further Mechanics 1','Further Mechanics 2','Decision Mathematics 1','Decision Mathematics 2']:['Pure Year 1','Pure Year 2','Statistics Year 1','Mechanics Year 1','Statistics Year 2','Mechanics Year 2']
    const present=[...new Set(filtered.map(r=>r.module))]
    const modules=[...preferred.filter(m=>present.includes(m)),...present.filter(m=>!preferred.includes(m))]
    return modules.map(moduleName=>{
      const moduleRows=filtered.filter(r=>r.module===moduleName).sort((a,b)=>Number(a.position||0)-Number(b.position||0))
      const chapterNumbers=[...new Set(moduleRows.map(r=>r.chapter_number))]
      return {
        key:moduleName, name:moduleName, kind:'alevel',
        chapters:chapterNumbers.map(chapterNumber=>{
          const rows=moduleRows.filter(r=>r.chapter_number===chapterNumber)
          return {number:chapterNumber,name:rows[0]?.chapter_name||'',topics:rows.map(r=>({id:r.id,number:r.topic_number,name:r.topic_name,key:`${student.course}|${r.module}|${r.topic_number}|${r.topic_name}`}))}
        })
      }
    })
  }
  if(isFurtherMaths(student)) return decorateModules('fm',FURTHER_MATHS_MODULES,selectedFurtherModules(student))
  if(isALevelMaths(student)) return decorateModules('am',A_LEVEL_MATHS_MODULES,selectedALevelModules(student))
  return []
}

const makeProgressLookup=topicRows=>({
  byTopic:new Map(topicRows.map(t=>[t.topic,t.status])),
  byCurriculumId:new Map(topicRows.filter(t=>t.curriculum_topic_id).map(t=>[t.curriculum_topic_id,t.status]))
})
const statusForCurriculumTopic=(lookup,topic)=>{
  if(typeof topic==='string') return lookup.byTopic.get(topic)
  return (topic?.id&&lookup.byCurriculumId.get(topic.id))||lookup.byTopic.get(topic?.key)
}
const topicScore=(lookup,topic)=>MASTERY[statusForCurriculumTopic(lookup,topic)]||0
const chapterScore=(lookup,chapter)=>chapter.topics.length?chapter.topics.reduce((sum,t)=>sum+topicScore(lookup,t),0)/chapter.topics.length:0

export function progressFor(student, topicRows=[]){
  if(!hasAutomaticCurriculum(student)) return Number(student?.progress||0)
  const lookup=makeProgressLookup(topicRows)
  const areas=curriculumFor(student)
  if(!areas.length) return 0
  const areaScores=areas.map(area=>{
    if(area.kind==='gcse') return area.topics.length?area.topics.reduce((sum,t)=>sum+topicScore(lookup,t),0)/area.topics.length:0
    return area.chapters.length?area.chapters.reduce((sum,c)=>sum+chapterScore(lookup,c),0)/area.chapters.length:0
  })
  return Math.round(areaScores.reduce((a,b)=>a+b,0)/areaScores.length)
}

export function areaProgressFor(student, topicRows=[]){
  const lookup=makeProgressLookup(topicRows)
  return curriculumFor(student).map(area=>{
    if(area.kind==='gcse'){
      const score=area.topics.length?Math.round(area.topics.reduce((sum,t)=>sum+topicScore(lookup,t),0)/area.topics.length):0
      const rated=area.topics.filter(t=>statusForCurriculumTopic(lookup,t)).length
      return {...area,score,rated,total:area.topics.length}
    }
    const chapters=area.chapters.map(c=>{
      const score=Math.round(chapterScore(lookup,c))
      const rated=c.topics.filter(t=>statusForCurriculumTopic(lookup,t)).length
      return {...c,score,rated,total:c.topics.length}
    })
    const score=chapters.length?Math.round(chapters.reduce((sum,c)=>sum+c.score,0)/chapters.length):0
    const rated=chapters.reduce((sum,c)=>sum+c.rated,0),total=chapters.reduce((sum,c)=>sum+c.total,0)
    return {...area,chapters,score,rated,total}
  })
}

export function curriculumTopicKeys(student){
  return new Set(curriculumFor(student).flatMap(area=>area.kind==='gcse'?area.topics:area.chapters.flatMap(c=>c.topics.map(t=>t.key))))
}
export const displayTopicName=topic=>String(topic||'').includes('|')?String(topic).split('|').slice(-1)[0]:topic

export function expectedProgressFor(student, actualProgress=null){
  if(!hasAutomaticCurriculum(student)) return Number(student?.expected_progress||0)
  const baselineValue=student?.baseline_progress
  const start=student?.progress_start_date
  const target=student?.target_date
  if(baselineValue===null||baselineValue===undefined||baselineValue===''||!start||!target) return null
  const baseline=Number(baselineValue)
  if(Number.isNaN(baseline)) return null
  const startMs=new Date(`${start}T12:00:00`).getTime()
  const targetMs=new Date(`${target}T12:00:00`).getTime()
  if(!(targetMs>startMs)) return null
  const now=Date.now()
  const fraction=Math.max(0,Math.min(1,(now-startMs)/(targetMs-startMs)))
  return Math.round(Math.max(0,Math.min(100,baseline+(100-baseline)*fraction)))
}

export function progressSnapshot(student, topicRows=[]){
  const progress=progressFor(student,topicRows)
  const expected=expectedProgressFor(student,progress)
  return {...student,progress,expected_progress:expected==null?Number(student?.expected_progress||0):expected,expectedConfigured:expected!=null,automatic:hasAutomaticCurriculum(student)}
}
