-- AA Tuition Portal v10.17.0
-- Parent/guardian contacts + course-aware homework review inbox.
-- Safe to run more than once.

alter table public.students
  add column if not exists parent_name text,
  add column if not exists parent_relationship text,
  add column if not exists parent_phone text,
  add column if not exists parent_email text,
  add column if not exists second_guardian_name text,
  add column if not exists second_guardian_relationship text,
  add column if not exists second_guardian_phone text,
  add column if not exists second_guardian_email text;

alter table public.assignment_submissions
  add column if not exists student_course_id uuid references public.student_courses(id) on delete cascade;

-- Existing submissions inherit the course from their assignment.
update public.assignment_submissions s
set student_course_id = a.student_course_id
from public.assignments a
where s.assignment_id = a.id
  and s.student_course_id is null
  and a.student_course_id is not null;

create index if not exists idx_assignment_submissions_student_course_id
  on public.assignment_submissions(student_course_id);
