-- AA Tuition Portal v6: additive fields for automatic GCSE Maths progress.
-- Safe to run on the existing database. It does not delete or reset any data.

alter table public.students add column if not exists exam_board text;
alter table public.students add column if not exists tier text;
alter table public.students add column if not exists baseline_progress numeric;
alter table public.students add column if not exists progress_start_date date;
alter table public.students add column if not exists target_date date;

-- Add constraints only if they are not already present.
do $$
begin
  if not exists (select 1 from pg_constraint where conname='students_exam_board_check') then
    alter table public.students add constraint students_exam_board_check
      check (exam_board is null or exam_board in ('Edexcel','AQA','OCR'));
  end if;
  if not exists (select 1 from pg_constraint where conname='students_tier_check') then
    alter table public.students add constraint students_tier_check
      check (tier is null or tier in ('Foundation','Higher'));
  end if;
  if not exists (select 1 from pg_constraint where conname='students_baseline_progress_check') then
    alter table public.students add constraint students_baseline_progress_check
      check (baseline_progress is null or baseline_progress between 0 and 100);
  end if;
end $$;
