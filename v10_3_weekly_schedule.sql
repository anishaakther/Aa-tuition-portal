-- AA Tuition v10.3: recurring weekly lesson schedule.
-- Run once in Supabase SQL Editor before deploying v10.3.

alter table public.students
  add column if not exists lesson_day smallint,
  add column if not exists lesson_start_time time,
  add column if not exists lesson_duration_minutes integer,
  add column if not exists lesson_mode text;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'students_lesson_day_check') then
    alter table public.students add constraint students_lesson_day_check check (lesson_day between 0 and 6);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'students_lesson_duration_check') then
    alter table public.students add constraint students_lesson_duration_check check (lesson_duration_minutes is null or lesson_duration_minutes between 15 and 240);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'students_lesson_mode_check') then
    alter table public.students add constraint students_lesson_mode_check check (lesson_mode is null or lesson_mode in ('Online','In person'));
  end if;
end $$;

comment on column public.students.lesson_day is 'Recurring weekly lesson weekday: Sunday=0 through Saturday=6.';
comment on column public.students.lesson_start_time is 'Recurring weekly lesson start time.';
comment on column public.students.lesson_duration_minutes is 'Scheduled lesson duration in minutes.';
comment on column public.students.lesson_mode is 'Online or In person.';
