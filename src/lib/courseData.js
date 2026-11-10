export const COURSE_OPTIONS = ['GCSE Mathematics','GCSE Combined Science','A-level Mathematics','A-level Further Mathematics','A-level Chemistry','A-level Physics']
export const EXAM_BOARDS = ['Edexcel','AQA','OCR','OCR Gateway']
export const FURTHER_MODULES = [
  'Core Pure 1','Core Pure 2','Further Pure 1','Further Pure 2',
  'Further Statistics 1','Further Statistics 2','Further Mechanics 1','Further Mechanics 2',
  'Decision Mathematics 1','Decision Mathematics 2'
]
export const FURTHER_CORE = ['Core Pure 1','Core Pure 2']
export const FURTHER_OPTIONAL = FURTHER_MODULES.filter(x=>!FURTHER_CORE.includes(x))
export const PHYSICS_CORE = ['1 Measurements and their errors','2 Particles and radiation','3 Waves','4 Mechanics and materials','5 Electricity','6 Further mechanics and thermal physics','7 Fields and their consequences','8 Nuclear physics']
export const PHYSICS_OPTIONAL = ['9 Astrophysics','10 Medical physics','11 Engineering physics','12 Turning points in physics','13 Electronics']

export const blankCourseSettings = course => ({
  course,
  exam_board:course==='GCSE Combined Science'?'OCR Gateway':course==='A-level Chemistry'?'OCR':course==='A-level Physics'?'AQA':'Edexcel',
  tier:['GCSE Mathematics','GCSE Combined Science'].includes(course)?'Higher':'',
  target_grade:'', working_grade:'', baseline_progress:'', progress_start_date:'', target_date:'',
  portal_enabled:true, goodnotes_url:'',
  modules:course==='A-level Further Mathematics'?[...FURTHER_CORE]:course==='A-level Physics'?[...PHYSICS_CORE]:[]
})

export const courseLabel = c => c?.course || 'Course'
export const isGcseCourse = c => ['GCSE Mathematics','GCSE Combined Science'].includes(c?.course)
export const isCombinedScience = c => c?.course === 'GCSE Combined Science'
export const isFurtherCourse = c => c?.course === 'A-level Further Mathematics'
export const isPhysicsCourse = c => c?.course === 'A-level Physics'
export const normaliseCourse = c => ({
  ...c,
  exam_board:c.exam_board||'', tier:c.tier||'', target_grade:c.target_grade||'', working_grade:c.working_grade||'',
  baseline_progress:c.baseline_progress??'', progress_start_date:c.progress_start_date||'', target_date:c.target_date||'',
  portal_enabled:c.portal_enabled!==false, goodnotes_url:c.goodnotes_url||'',
  modules:Array.isArray(c.modules)?c.modules:[]
})
