-- AA Tuition Portal v10.18.0
-- Goodnotes, flexible homework, optional portal access, and AQA A-level Physics 7408.

alter table public.student_courses add column if not exists goodnotes_url text;
alter table public.student_courses add column if not exists portal_enabled boolean not null default true;
update public.student_courses set portal_enabled=true where portal_enabled is null;

alter table public.assignments add column if not exists submission_method text not null default 'portal';
alter table public.assignments drop constraint if exists assignments_submission_method_check;
alter table public.assignments add constraint assignments_submission_method_check check (submission_method in ('portal','goodnotes','checked_in_lesson','no_submission'));

alter table public.assignment_submissions drop constraint if exists assignment_submissions_status_check;
alter table public.assignment_submissions add constraint assignment_submissions_status_check check (status in ('draft','submitted','completed','resubmit','not_completed'));

-- Allow A-level Physics as a course.
alter table public.student_courses drop constraint if exists student_courses_course_check;
alter table public.student_courses add constraint student_courses_course_check check (course in ('GCSE Mathematics','GCSE Combined Science','A-level Mathematics','A-level Further Mathematics','A-level Chemistry','A-level Physics'));

alter table public.curriculum_topics drop constraint if exists curriculum_topics_course_check;
alter table public.curriculum_topics add constraint curriculum_topics_course_check check (course in ('GCSE Combined Science','A-level Mathematics','A-level Further Mathematics','A-level Chemistry','A-level Physics'));

delete from public.curriculum_topics where course='A-level Physics';
insert into public.curriculum_topics (course,module,chapter_number,chapter_name,topic_number,topic_name,position,higher_only) values
('A-level Physics','1 Measurements and their errors','3.1','Measurements and their errors','3.1.1','Use of SI units and their prefixes',1,false),
('A-level Physics','1 Measurements and their errors','3.1','Measurements and their errors','3.1.2','Limitation of physical measurements',2,false),
('A-level Physics','1 Measurements and their errors','3.1','Measurements and their errors','3.1.3','Estimation of physical quantities',3,false),
('A-level Physics','2 Particles and radiation','3.2','Particles and radiation','3.2.1','Particles',4,false),
('A-level Physics','2 Particles and radiation','3.2','Particles and radiation','3.2.2','Electromagnetic radiation and quantum phenomena',5,false),
('A-level Physics','3 Waves','3.3','Waves','3.3.1','Progressive and stationary waves',6,false),
('A-level Physics','3 Waves','3.3','Waves','3.3.2','Refraction, diffraction and interference',7,false),
('A-level Physics','4 Mechanics and materials','3.4','Mechanics and materials','3.4.1','Force, energy and momentum',8,false),
('A-level Physics','4 Mechanics and materials','3.4','Mechanics and materials','3.4.2','Materials',9,false),
('A-level Physics','5 Electricity','3.5','Electricity','3.5.1','Current electricity',10,false),
('A-level Physics','6 Further mechanics and thermal physics','3.6','Further mechanics and thermal physics','3.6.1','Periodic motion',11,false),
('A-level Physics','6 Further mechanics and thermal physics','3.6','Further mechanics and thermal physics','3.6.2','Thermal physics',12,false),
('A-level Physics','7 Fields and their consequences','3.7','Fields and their consequences','3.7.1','Fields',13,false),
('A-level Physics','7 Fields and their consequences','3.7','Fields and their consequences','3.7.2','Gravitational fields',14,false),
('A-level Physics','7 Fields and their consequences','3.7','Fields and their consequences','3.7.3','Electric fields',15,false),
('A-level Physics','7 Fields and their consequences','3.7','Fields and their consequences','3.7.4','Capacitance',16,false),
('A-level Physics','7 Fields and their consequences','3.7','Fields and their consequences','3.7.5','Magnetic fields',17,false),
('A-level Physics','7 Fields and their consequences','3.7','Fields and their consequences','3.7.6','Electromagnetic induction',18,false),
('A-level Physics','8 Nuclear physics','3.8','Nuclear physics','3.8','Nuclear physics',19,false),
('A-level Physics','9 Astrophysics','3.9','Astrophysics','3.9','Astrophysics (optional topic)',20,false),
('A-level Physics','10 Medical physics','3.10','Medical physics','3.10','Medical physics (optional topic)',21,false),
('A-level Physics','11 Engineering physics','3.11','Engineering physics','3.11','Engineering physics (optional topic)',22,false),
('A-level Physics','12 Turning points in physics','3.12','Turning points in physics','3.12','Turning points in physics (optional topic)',23,false),
('A-level Physics','13 Electronics','3.13','Electronics','3.13','Electronics (optional topic)',24,false);
