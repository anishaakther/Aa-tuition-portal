-- AA Tuition Portal v10.15.1
-- Keep Classwork (topics, materials and assignments) separate per student course.
-- Safe to run more than once.

alter table public.resource_topics
  add column if not exists student_course_id uuid references public.student_courses(id) on delete cascade;

alter table public.lesson_resources
  add column if not exists student_course_id uuid references public.student_courses(id) on delete cascade;

alter table public.assignments
  add column if not exists student_course_id uuid references public.student_courses(id) on delete cascade;

-- Backfill old topic rows to the student's earliest/current original course.
update public.resource_topics rt
set student_course_id = chosen.id
from lateral (
  select sc.id
  from public.student_courses sc
  where sc.student_id = rt.student_id
  order by sc.created_at asc, sc.id asc
  limit 1
) chosen
where rt.student_course_id is null;

-- Prefer the topic's course for existing materials; otherwise use the student's original course.
update public.lesson_resources lr
set student_course_id = coalesce(rt.student_course_id, chosen.id)
from lateral (
  select sc.id
  from public.student_courses sc
  where sc.student_id = lr.student_id
  order by sc.created_at asc, sc.id asc
  limit 1
) chosen
left join public.resource_topics rt on rt.id = lr.resource_topic_id
where lr.student_course_id is null;

-- Prefer the topic's course for existing assignments; otherwise use the student's original course.
update public.assignments a
set student_course_id = coalesce(rt.student_course_id, chosen.id)
from lateral (
  select sc.id
  from public.student_courses sc
  where sc.student_id = a.student_id
  order by sc.created_at asc, sc.id asc
  limit 1
) chosen
left join public.resource_topics rt on rt.id = a.resource_topic_id
where a.student_course_id is null;

create index if not exists idx_resource_topics_student_course_id
  on public.resource_topics(student_course_id);

create index if not exists idx_lesson_resources_student_course_id
  on public.lesson_resources(student_course_id);

create index if not exists idx_assignments_student_course_id
  on public.assignments(student_course_id);
