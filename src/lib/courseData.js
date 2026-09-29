export const COURSE_OPTIONS = ['GCSE Mathematics','GCSE Combined Science','A-level Mathematics','A-level Further Mathematics']
export const EXAM_BOARDS = ['Edexcel','AQA','OCR','OCR Gateway']
export const FURTHER_MODULES = [
  'Core Pure 1','Core Pure 2','Further Pure 1','Further Pure 2',
  'Further Statistics 1','Further Statistics 2','Further Mechanics 1','Further Mechanics 2',
  'Decision Mathematics 1','Decision Mathematics 2'
]
export const FURTHER_CORE = ['Core Pure 1','Core Pure 2']
export const FURTHER_OPTIONAL = FURTHER_MODULES.filter(x=>!FURTHER_CORE.includes(x))

export const blankCourseSettings = course => ({
  course,
  exam_board:course==='GCSE Combined Science'?'OCR Gateway':'Edexcel',
  tier:['GCSE Mathematics','GCSE Combined Science'].includes(course)?'Higher':'',
  target_grade:'', working_grade:'', baseline_progress:'', progress_start_date:'', target_date:'',
  modules:course==='A-level Further Mathematics'?[...FURTHER_CORE]:[]
})

export const courseLabel = c => c?.course || 'Course'
export const isGcseCourse = c => ['GCSE Mathematics','GCSE Combined Science'].includes(c?.course)
export const isCombinedScience = c => c?.course === 'GCSE Combined Science'
export const isFurtherCourse = c => c?.course === 'A-level Further Mathematics'
export const normaliseCourse = c => ({
  ...c,
  exam_board:c.exam_board||'', tier:c.tier||'', target_grade:c.target_grade||'', working_grade:c.working_grade||'',
  baseline_progress:c.baseline_progress??'', progress_start_date:c.progress_start_date||'', target_date:c.target_date||'',
  modules:Array.isArray(c.modules)?c.modules:[]
})
