alter table public.student_courses
  add column if not exists tutor_update text;

-- Preserve the existing student-level update by assigning it to the student's
-- primary (oldest) course. Other courses start with no update.
update public.student_courses sc
set tutor_update = s.tutor_update
from public.students s
where sc.student_id = s.id
  and sc.tutor_update is null
  and nullif(trim(s.tutor_update), '') is not null
  and sc.id = (
    select sc2.id
    from public.student_courses sc2
    where sc2.student_id = sc.student_id
    order by sc2.created_at asc, sc2.id asc
    limit 1
  );
