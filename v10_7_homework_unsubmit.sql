-- AA Tuition v10.7: allow students to move a submitted homework back to a draft
-- before the tutor has completed it.
alter table public.assignment_submissions
drop constraint if exists assignment_submissions_status_check;

alter table public.assignment_submissions
add constraint assignment_submissions_status_check
check (status in ('draft', 'submitted', 'completed', 'resubmit'));
