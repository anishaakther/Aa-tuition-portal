# v10.15.13 — timetable course selection

- Timetable lessons now store the exact `student_course_id` for each selected student.
- Multi-course students can choose GCSE Mathematics, GCSE Combined Science, A-level Mathematics, etc. directly in the lesson editor.
- Group lessons can link each student to the correct course.
- Timetable cards display the linked course.
- Student Home filters the next timetable lesson to the selected course when course data is available.
- No new Supabase migration is required because `timetable_session_students.student_course_id` already exists.

## v10.15.1

- Classwork is now scoped to the selected student course. Maths materials/homework no longer appear under Combined Science and vice versa.
- Resource topics, lesson materials and assignments now store `student_course_id`.
- Student/parent Classwork view applies the same course filter.


## v3 role fix
Tutor role detection now uses the `is_tutor()` Supabase RPC first so tutor logins are not misclassified as parents when profile SELECT is affected by RLS.

## v6 automatic GCSE Maths progress
Before deploying v6 to a Supabase project created with an earlier version, run `supabase/v6_progress_migration.sql` once in the Supabase SQL Editor. It only adds optional student configuration fields; it does not delete or reset existing records.

For a GCSE Mathematics student, set Exam board and Tier (Foundation/Higher). Course progress is then calculated from the AA Tuition master curriculum. Missing curriculum topics count as Not started; red = Developing (33%), amber = Progressing (67%), green = Secure (100%). Each of the six curriculum areas contributes equally to the overall percentage.

To enable Expected by now, also set Baseline progress, Tracking start date and Target completion date. Expected progress moves linearly from the baseline on the start date toward 100% on the target date.

## v7 student/parent access-code setup
1. Run `supabase/v7_access_code_security.sql` in Supabase SQL Editor.
2. In Vercel, add `SUPABASE_SERVICE_ROLE_KEY` as a Production environment variable. Do not prefix it with `VITE_`.
3. Keep the existing `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` variables.
4. Deploy to a temporary Vercel project first and test `/access` with a real active student code.

The `/api/student-access` server function validates `AA####` codes using the service role and rate-limits attempts using `portal_access_attempts`. The service-role key is never sent to the browser.


## v8.1 lesson resources
Tutor student profiles can upload private PDF lesson resources. Student/parent access-code sessions receive only resources belonging to that student, with 15-minute signed Storage URLs.


## v8.2 resource formats
Tutor uploads support PDF, PowerPoint, Word, Excel, JPG and PNG files up to 25 MB. The lesson-resources bucket must remain private. Student/parent access receives only short-lived signed links for that student’s resources.


## v8.3 fixes
- Corrected student/parent private resource signed URLs so files open from Supabase Storage.
- Restored tutor Sign out control on tablet/mobile layouts.

## v8.4 parent report refinement
- Parent reports no longer print every rated/mastered topic.
- GCSE reports show a compact six-area curriculum overview with each area's percentage.
- Learning highlights are limited to up to 3 recently updated Secure strengths and up to 3 Developing/Progressing current-focus topics.
- Includes the v8.3 private-resource Open fix and tablet/mobile tutor Sign out fix.

## v9 classwork upgrade
- New students receive a unique `AA####` access code automatically.
- Tutor profiles show Copy / Regenerate access-code controls.
- Lesson materials can be organised into tutor-created topics.
- Assignments support instructions, due dates and an optional worksheet.
- Students can submit multiple photos, PDFs or Word files through their access-code session.
- Student uploads use short-lived signed Storage upload tokens; the `homework-files` bucket remains private.
- Tutors can open submissions, mark them Completed or request Resubmission, and leave feedback.


## v10.1 refinements
- Google Classroom-style compact Classwork lists for tutor and student/parent views.
- Tap a material or assignment title to reveal its details.
- Tutor can edit/move/delete materials and assignments.
- Tutor can rename/delete Classwork topics; duplicate topic names are blocked in the UI.
- Student access code moved into the student header.
- Dashboard now shows homework submissions waiting for review.

## v10.3 weekly lesson schedule
Run `supabase/v10_3_weekly_schedule.sql` once before deploying. Tutor can set each student's recurring lesson day, start time, duration and lesson type. Student/parent Home calculates the next weekly lesson automatically. This schedule does not create attendance/history records in `lessons`.


## v10.4 polish
- Separates each student into a distinct mobile dashboard card.
- Adds a guarded Delete student action in Edit student, including cleanup of linked portal records and stored files.
- Retains weekly lesson schedule and student Home dashboard features from v10.3.

## v10.6 progress-page refinement
- Student/parent Progress tab now summarises GCSE mastery across the six curriculum areas.
- Each curriculum area is expandable to reveal individual topic statuses.
- Adds compact Strengths and Current focus summaries instead of showing every rated topic at once.
- Student Home places Latest feedback before Progress.
- Removes the detached progress-status badge from the student Home header.
- No database migration is required for this release.

## v10.6 assessment groups

- Tutor assessments can be organised into flexible student-specific groups such as Topic Tests, Past Papers and Mocks.
- Assessments can be added, edited, moved between groups and deleted.
- Groups can be renamed or deleted without deleting the assessments inside them; those assessments fall back to Other assessments.
- Student access shows the same assessment groups with a compact expandable layout and group averages.
- Database migration: `supabase/v10_6_assessment_groups.sql`.


## v10.7 homework workflow
Students can now choose multiple files, remove files before submitting, unsubmit while work is awaiting review, edit the current submission, and resubmit. Completed homework remains locked; tutor-requested resubmissions reopen editing.


## v10.10
- Assessment groups connected across tutor, student-access and parent portal views.
- Existing assessments without a group remain under Other assessments.

## v10.11 timetable UI
Adds the multi-tutor weekly timetable screen backed by `timetable_sessions`, `timetable_session_students`, and `tutor_availability`. Owner can switch between tutor views and all tutors; tutors see their own timetable. Supports recurring/one-off lessons, group sessions, availability/free slots, meeting links, editing and deletion.

## v10.12 tutor Classwork redesign
- Tutor Classwork now uses a compact Google Classroom-inspired layout while retaining AA Tuition styling.
- Replaces the permanent Material and Assignment forms with a single `+ Create` menu for Material, Assignment or Topic.
- Adds a topic filter and Collapse all control.
- Topics remain collapsible and materials/assignments expand only when needed.
- Dashboard homework `Review` links now open and scroll directly to the exact submitted assignment.
- Student-specific homework submission/resubmission/completed workflow is unchanged.
- Students without an expected-progress timeline now show `Set timeline` in the Student directory instead of `On Track`.
- No database migration is required for this release.

## v10.13 — Multi-course student profiles
- Students can take GCSE Mathematics, A-level Mathematics, A-level Further Mathematics, or multiple courses on one profile.
- Target grade, working grade and progress timeline are stored per course in `student_courses`.
- Further Maths always includes Core Pure 1 and Core Pure 2 and requires exactly two optional textbooks from `student_course_modules`.
- Tutor progress pages use the live `curriculum_topics` database for A-level Maths and Further Maths.
- Multi-course students get course tabs so progress is kept separate.
- Student access-code and parent portals also support switching between a student's courses.
- Existing `students` course fields remain mirrored to the first course for compatibility with older dashboard/report views.

## v10.14

Student portal and scheduling refinement release built on the tested v10.13 multi-course foundation.

- Timetable is now the single scheduling source for the access-code student portal: Next Lesson and Teams/meeting link come from `timetable_sessions` / `timetable_session_students`.
- Removed the obsolete Weekly Lesson Schedule and Teams link fields from Add Student and Edit Student. Legacy database columns are intentionally retained as backup and are not deleted.
- New students are automatically linked to the tutor/owner who creates them so they can be selected in that tutor's timetable.
- Course checkboxes can all be temporarily unticked while editing; at least one course is enforced only when saving.
- Curriculum sections reset to collapsed when switching courses/reopening the progress view.
- Student Classwork redesigned as a cleaner topic stream with material/assignment icons, compact status, collapsible topics, and less nested-card styling.
- Progress UI uses clearer chevrons, tighter curriculum cards, parent-friendly empty focus copy, and formatted lesson dates.
- Home keeps the AA Tuition dashboard layout with tighter spacing and timetable-backed lesson information.

### Required Supabase permission for timetable-backed student Home
Run `supabase/v10_14_student_timetable_access.sql` once before testing the v10.14 student access-code portal. It grants the server-only `service_role` SELECT access to the two timetable tables. It does not expose timetable data publicly.


## v10.14.1 correction build
- Adds explicit Assigned tutor to Add/Edit Student.
- Owner retains global student visibility; tutor assignment controls timetable selection and homework review.
- New students are assigned without SQL.
- Materials open directly from the Classwork row and due dates use readable UK formatting.


## v10.15 — Multi-course tutors + OCR Combined Science

- Adds GCSE Combined Science as a supported course.
- Loads OCR Gateway Biology, Chemistry and Physics curriculum rows from `curriculum_topics`.
- Foundation students automatically exclude `higher_only` learning outcomes.
- Science topic progress links to `curriculum_topics.id` through `topic_progress.curriculum_topic_id`.
- Tutor assignment is configurable per student course through `student_course_tutors`.
- Legacy `student_tutors` links are kept in sync for dashboard/timetable compatibility.
- Existing single-tutor assignments are backfilled to current courses by `supabase/v10_15_multicourse_science.sql`.
- Existing GCSE Mathematics and A-level curriculum/progress behaviour is retained.


## v10.15.2 UI cleanup
- Removes repetitive grey helper copy beneath obvious tutor page headings (Timetable, Lesson log, Reports, Classwork).
- Removes the redundant Classwork helper sentence from the student portal.
- Retains purple section labels and functional controls.


## v10.15.3 inline topic creation
- Assignment and Material forms now allow selecting **No topic**, an existing topic, or **+ Create topic** directly from the same form.
- Creating a topic inline keeps the current draft open and automatically selects the new topic.
- No additional Supabase migration is required for this UI change (the assessment course-scope migration previously supplied is still required).

## v10.15.4 full-screen classwork composer
- Assignment and Material creation now open as full-screen composers rather than compact modals.
- Main content is on the left; course/student, due date, related lesson and topic controls are in a right-side panel.
- Inline topic creation remains available without closing the draft.
- Assignment/Material action buttons are pinned in the top header, similar to modern classroom tools while retaining AA Tuition styling.
- No additional Supabase migration is required for this UI-only change.


## v10.15.9 — Classroom-style attachments
- Assignment and Material composers now have Upload and Link actions.
- Supports multiple uploaded files and multiple web links on one post.
- Attachment cards are visible before posting and in tutor/student Classwork views.
- Existing legacy single-file materials and assignments remain supported.
- Run `supabase/v10_15_9_classwork_attachments.sql` before deploying this build.
