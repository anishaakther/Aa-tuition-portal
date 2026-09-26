-- AA Tuition Portal v10.15.9
-- Multiple files + web links for Materials and Assignments.
-- Safe to run more than once.

alter table public.lesson_resources
  alter column file_path drop not null;

create table if not exists public.classwork_attachments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  student_course_id uuid references public.student_courses(id) on delete cascade,
  parent_type text not null check (parent_type in ('material','assignment')),
  parent_id uuid not null,
  attachment_type text not null check (attachment_type in ('file','link')),
  title text,
  file_path text,
  original_name text,
  mime_type text,
  file_size bigint,
  storage_bucket text,
  url text,
  created_at timestamptz not null default now(),
  check (
    (attachment_type = 'file' and file_path is not null and storage_bucket is not null and url is null)
    or
    (attachment_type = 'link' and url is not null and file_path is null)
  )
);

create index if not exists idx_classwork_attachments_student
  on public.classwork_attachments(student_id);

create index if not exists idx_classwork_attachments_course
  on public.classwork_attachments(student_course_id);

create index if not exists idx_classwork_attachments_parent
  on public.classwork_attachments(parent_type,parent_id);

-- Tutors/owners use the same authenticated access pattern as the rest of the portal.
alter table public.classwork_attachments enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='classwork_attachments'
      and policyname='Authenticated tutors can manage classwork attachments'
  ) then
    create policy "Authenticated tutors can manage classwork attachments"
      on public.classwork_attachments
      for all
      to authenticated
      using (true)
      with check (true);
  end if;
end $$;
