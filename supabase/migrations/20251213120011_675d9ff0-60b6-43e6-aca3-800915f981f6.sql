-- Backfill missing assistant record for application a2769b71-a879-488b-973b-ff0f202e7747
INSERT INTO compliance_assistants (
  application_id,
  first_name,
  last_name,
  date_of_birth,
  email,
  phone,
  role,
  dbs_status,
  form_status
) VALUES (
  'a2769b71-a879-488b-973b-ff0f202e7747',
  'Salah',
  'assistant',
  '2000-01-01',
  'daryelcare72@gmail.com',
  '07984897731',
  'Assistant',
  'not_requested',
  'not_sent'
);

-- Backfill missing co-childminder record for application a2769b71-a879-488b-973b-ff0f202e7747
INSERT INTO compliance_cochildminders (
  application_id,
  first_name,
  last_name,
  date_of_birth,
  email,
  phone,
  dbs_status,
  form_status
) VALUES (
  'a2769b71-a879-488b-973b-ff0f202e7747',
  'Fahmo',
  'CO CHILD',
  '2000-01-01',
  'fiqiyusuf4@gmail.com',
  '07984897731',
  'not_requested',
  'not_sent'
);