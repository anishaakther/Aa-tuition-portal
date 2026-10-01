-- v10.15.20 — scope assessments and assessment groups to a student course

alter table public.assessments
  add column if not exists student_course_id uuid references public.student_courses(id) on delete cascade;

alter table public.assessment_groups
  add column if not exists student_course_id uuid references public.student_courses(id) on delete cascade;

-- Safe backfill: only students with exactly one course can be assigned unambiguously.
update public.assessments a
set student_course_id = sc.id
from public.student_courses sc
where a.student_course_id is null
  and sc.student_id = a.student_id
  and 1 = (select count(*) from public.student_courses x where x.student_id = a.student_id);

update public.assessment_groups g
set student_course_id = sc.id
from public.student_courses sc
where g.student_course_id is null
  and sc.student_id = g.student_id
  and 1 = (select count(*) from public.student_courses x where x.student_id = g.student_id);

create index if not exists assessments_student_course_idx on public.assessments(student_course_id);
create index if not exists assessment_groups_student_course_idx on public.assessment_groups(student_course_id);
