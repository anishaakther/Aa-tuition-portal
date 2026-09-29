-- AA Tuition v9 classwork / assignment migration.
-- This mirrors the setup performed in Supabase before deploying this build.
create table if not exists public.resource_topics (
  id uuid primary key default gen_random_uuid(), student_id uuid not null references public.students(id) on delete cascade,
  name text not null, position integer not null default 0, created_at timestamptz not null default now()
);
alter table public.lesson_resources add column if not exists resource_topic_id uuid references public.resource_topics(id) on delete set null;

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(), student_id uuid not null references public.students(id) on delete cascade,
  resource_topic_id uuid references public.resource_topics(id) on delete set null, title text not null, instructions text,
  due_date date, attachment_path text, attachment_name text, created_at timestamptz not null default now()
);
create table if not exists public.assignment_submissions (
  id uuid primary key default gen_random_uuid(), assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade, status text not null default 'submitted' check(status in ('submitted','completed','resubmit')),
  tutor_feedback text, submitted_at timestamptz not null default now(), reviewed_at timestamptz,
  unique(assignment_id,student_id)
);
create table if not exists public.assignment_submission_files (
  id uuid primary key default gen_random_uuid(), submission_id uuid not null references public.assignment_submissions(id) on delete cascade,
  file_path text not null, original_name text, mime_type text, file_size bigint, uploaded_at timestamptz not null default now()
);
