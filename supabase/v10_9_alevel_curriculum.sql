alter table public.students
add column if not exists curriculum_modules text[] not null default '{}';
