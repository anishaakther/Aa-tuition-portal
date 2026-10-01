-- v10.15.14: scope lesson records to a student's course without removing legacy data.
alter table public.lessons
  add column if not exists student_course_id uuid references public.student_courses(id) on delete set null;

create index if not exists lessons_student_course_idx
  on public.lessons(student_course_id);
