-- AA Tuition v10.2: permanent Teams lesson link for each student.
-- Run once in Supabase SQL Editor before testing the new student/parent Home dashboard.

alter table public.students
add column if not exists teams_link text;

comment on column public.students.teams_link is
'Permanent Microsoft Teams lesson URL shown on the student/parent Home dashboard.';
