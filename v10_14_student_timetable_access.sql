-- v10.14: allow the server-only student access endpoint to read timetable data.
-- This does not expose timetable data to the browser or anonymous users.
grant select on table public.timetable_sessions to service_role;
grant select on table public.timetable_session_students to service_role;
