-- AA Tuition Portal v10.15
-- Combined Science progress links + supporting indexes.
-- Safe to run more than once.

alter table public.topic_progress
  add column if not exists curriculum_topic_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'topic_progress_curriculum_topic_id_fkey'
  ) then
    alter table public.topic_progress
      add constraint topic_progress_curriculum_topic_id_fkey
      foreign key (curriculum_topic_id)
      references public.curriculum_topics(id)
      on delete set null;
  end if;
end $$;

create index if not exists idx_topic_progress_curriculum_topic_id
  on public.topic_progress(curriculum_topic_id);

create index if not exists idx_student_course_tutors_course
  on public.student_course_tutors(student_course_id);

create index if not exists idx_student_course_tutors_tutor
  on public.student_course_tutors(tutor_id);

-- Backfill course-level tutor assignment from the previous one-tutor-per-student model.
insert into public.student_course_tutors (student_course_id, tutor_id)
select sc.id, old_link.tutor_id
from public.student_courses sc
join lateral (
  select st.tutor_id
  from public.student_tutors st
  where st.student_id = sc.student_id
  order by st.created_at nulls last
  limit 1
) old_link on true
where not exists (
  select 1
  from public.student_course_tutors sct
  where sct.student_course_id = sc.id
);
