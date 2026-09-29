-- Run this in Supabase SQL Editor.
-- AA Tuition portal: profiles, students, parent links, lessons, assessments and topic progress.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null check (role in ('tutor','parent')) default 'parent',
  created_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  course text not null default 'GCSE Mathematics',
  target_grade text,
  working_grade text,
  progress numeric not null default 0 check (progress between 0 and 100),
  expected_progress numeric not null default 0 check (expected_progress between 0 and 100),
  exam_board text check (exam_board is null or exam_board in ('Edexcel','AQA','OCR')),
  tier text check (tier is null or tier in ('Foundation','Higher')),
  baseline_progress numeric check (baseline_progress is null or baseline_progress between 0 and 100),
  progress_start_date date,
  target_date date,
  tutor_update text,
  teams_link text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.parent_student_links (
  parent_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  primary key(parent_id, student_id)
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  lesson_date date not null default current_date,
  topic text not null,
  attendance text not null check (attendance in ('present','absent','cancelled')) default 'present',
  duration_minutes integer not null default 60,
  notes text,
  homework text,
  created_at timestamptz not null default now()
);

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  title text not null,
  score numeric not null,
  total numeric not null check (total > 0),
  taken_on date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.topic_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  topic text not null,
  status text not null check (status in ('red','amber','green')) default 'red',
  updated_at timestamptz not null default now(),
  unique(student_id, topic)
);

alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.parent_student_links enable row level security;
alter table public.lessons enable row level security;
alter table public.assessments enable row level security;
alter table public.topic_progress enable row level security;

create or replace function public.is_tutor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'tutor');
$$;

create or replace function public.can_access_student(sid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_tutor() or exists(
    select 1 from public.parent_student_links
    where parent_id = auth.uid() and student_id = sid
  );
$$;

create policy "profiles own or tutor" on public.profiles
for select using (id = auth.uid() or public.is_tutor());

create policy "tutors manage profiles" on public.profiles
for all using (public.is_tutor()) with check (public.is_tutor());

create policy "student access" on public.students
for select using (public.can_access_student(id));
create policy "tutors manage students" on public.students
for all using (public.is_tutor()) with check (public.is_tutor());

create policy "parent links visible" on public.parent_student_links
for select using (parent_id = auth.uid() or public.is_tutor());
create policy "tutors manage parent links" on public.parent_student_links
for all using (public.is_tutor()) with check (public.is_tutor());

create policy "lesson access" on public.lessons
for select using (public.can_access_student(student_id));
create policy "tutors manage lessons" on public.lessons
for all using (public.is_tutor()) with check (public.is_tutor());

create policy "assessment access" on public.assessments
for select using (public.can_access_student(student_id));
create policy "tutors manage assessments" on public.assessments
for all using (public.is_tutor()) with check (public.is_tutor());

create policy "topic access" on public.topic_progress
for select using (public.can_access_student(student_id));
create policy "tutors manage topics" on public.topic_progress
for all using (public.is_tutor()) with check (public.is_tutor());

-- Automatically create a profile when a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), coalesce(new.raw_user_meta_data->>'role','parent'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
