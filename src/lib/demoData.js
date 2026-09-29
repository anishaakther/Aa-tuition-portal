export const demoStudents = [
  {
    id: 'hana',
    name: 'Hana',
    course: 'GCSE Mathematics',
    target_grade: '9',
    working_grade: '8',
    progress: 46,
    expected_progress: 39,
    tutor_update: 'Hana has strong mathematical knowledge. The main priority is reducing avoidable errors and building consistency on higher-grade problem solving.',
    attendance: 96,
  },
  {
    id: 'liora',
    name: 'Liora',
    course: 'GCSE Mathematics',
    target_grade: '9',
    working_grade: '9',
    progress: 51,
    expected_progress: 39,
    tutor_update: 'Liora is performing very strongly. Current focus is maintaining accuracy under timed conditions and extending problem-solving depth.',
    attendance: 100,
  },
  {
    id: 'steve',
    name: 'Steve',
    course: 'GCSE Mathematics',
    target_grade: '9',
    working_grade: '9',
    progress: 49,
    expected_progress: 39,
    tutor_update: 'Steve is securely on a grade 9 trajectory. Current work is focused on exam technique and complex multi-step questions.',
    attendance: 94,
  },
]

export const demoAssessments = [
  { id: 1, student_id: 'hana', title: 'Specimen Paper', score: 59, total: 80, taken_on: '2026-06-10' },
  { id: 2, student_id: 'hana', title: 'Practice Paper', score: 64, total: 80, taken_on: '2026-07-05' },
  { id: 3, student_id: 'hana', title: '2024 Paper 2', score: 57, total: 80, taken_on: '2026-08-16' },
  { id: 4, student_id: 'liora', title: '2019 Paper 2', score: 92, total: 100, taken_on: '2026-08-20' },
  { id: 5, student_id: 'steve', title: '2019 Paper 2', score: 90, total: 100, taken_on: '2026-08-20' },
]

export const demoTopics = [
  { student_id: 'hana', topic: 'Quadratics', status: 'green' },
  { student_id: 'hana', topic: 'Trigonometry', status: 'green' },
  { student_id: 'hana', topic: 'Similar shapes', status: 'amber' },
  { student_id: 'hana', topic: 'Vectors', status: 'amber' },
  { student_id: 'hana', topic: 'Probability', status: 'red' },
]

export const demoLessons = [
  { id: 1, student_id: 'hana', lesson_date: '2026-09-07', topic: 'Factorising harder quadratics', attendance: 'present', notes: 'Improved by the end of the lesson. Extra practice set for homework.' },
  { id: 2, student_id: 'hana', lesson_date: '2026-08-31', topic: 'Similar shapes and frustums', attendance: 'present', notes: 'Good understanding of length scale factors. Volume ratios need more practice.' },
  { id: 3, student_id: 'liora', lesson_date: '2026-09-06', topic: 'Higher-tier exam practice', attendance: 'present', notes: 'Excellent accuracy and pace.' },
]
