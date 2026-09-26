-- Optional hardening for the private lesson-resources bucket.
-- The bucket can also be configured in Supabase Storage UI.
update storage.buckets
set public = false,
    file_size_limit = 26214400,
    allowed_mime_types = string_to_array(
      'application/pdf|application/vnd.ms-powerpoint|application/vnd.openxmlformats-officedocument.presentationml.presentation|application/msword|application/vnd.openxmlformats-officedocument.wordprocessingml.document|application/vnd.ms-excel|application/vnd.openxmlformats-officedocument.spreadsheetml.sheet|image/jpeg|image/png',
      '|'
    )
where id = 'lesson-resources';
