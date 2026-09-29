-- v10.6 — organise assessments into flexible student-specific groups
-- Examples: Topic Tests, Past Papers, Mocks, Year 10 Assessments.

create table if not exists public.assessment_groups (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  name text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.assessments
  add column if not exists assessment_group_id uuid references public.assessment_groups(id) on delete set null;

create unique index if not exists assessment_groups_student_name_unique
  on public.assessment_groups (student_id, lower(name));

alter table public.assessment_groups enable row level security;

drop policy if exists "Tutors manage assessment groups" on public.assessment_groups;
create policy "Tutors manage assessment groups"
on public.assessment_groups
for all
to authenticated
using (public.is_tutor())
with check (public.is_tutor());

drop policy if exists "Linked users view assessment groups" on public.assessment_groups;
create policy "Linked users view assessment groups"
on public.assessment_groups
for select
to authenticated
using (public.can_access_student(student_id));

grant select, insert, update, delete on public.assessment_groups to authenticated;
grant all on public.assessment_groups to service_role;
