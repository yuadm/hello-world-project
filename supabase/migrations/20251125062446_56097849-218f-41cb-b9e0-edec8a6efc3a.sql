-- Phase 1: Add triggers and monitoring functions

-- 1. Drop triggers if they exist, then recreate
DROP TRIGGER IF EXISTS update_household_member_age_group ON household_member_dbs_tracking;
DROP TRIGGER IF EXISTS update_employee_household_member_age_group ON employee_household_members;

CREATE TRIGGER update_household_member_age_group
  BEFORE INSERT OR UPDATE ON household_member_dbs_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_member_age_group();

CREATE TRIGGER update_employee_household_member_age_group
  BEFORE INSERT OR UPDATE ON employee_household_members
  FOR EACH ROW
  EXECUTE FUNCTION update_member_age_group();

-- 2. Function for applicant children turning 16
CREATE OR REPLACE FUNCTION public.get_applicant_children_turning_16_soon(days_ahead integer DEFAULT 90)
RETURNS TABLE(
  id uuid,
  application_id uuid,
  full_name text,
  date_of_birth date,
  current_age integer,
  days_until_16 integer,
  turns_16_on date,
  email text,
  relationship text,
  dbs_status text,
  turning_16_notification_sent boolean
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    hm.id,
    hm.application_id,
    hm.full_name,
    hm.date_of_birth,
    public.calculate_age(hm.date_of_birth) AS current_age,
    public.days_until_16th_birthday(hm.date_of_birth) AS days_until_16,
    date(hm.date_of_birth + INTERVAL '16 years') AS turns_16_on,
    hm.email,
    hm.relationship,
    hm.dbs_status::text as dbs_status,
    hm.turning_16_notification_sent
  FROM public.household_member_dbs_tracking hm
  WHERE hm.member_type = 'child'
    AND public.days_until_16th_birthday(hm.date_of_birth) BETWEEN 0 AND days_ahead
  ORDER BY public.days_until_16th_birthday(hm.date_of_birth) ASC;
$$;

-- 3. Function for expiring DBS certificates
CREATE OR REPLACE FUNCTION public.get_expiring_dbs_certificates(days_ahead integer DEFAULT 30)
RETURNS TABLE(
  member_id uuid,
  member_name text,
  member_type text,
  certificate_number text,
  certificate_date date,
  expiry_date date,
  days_until_expiry integer,
  email text,
  source_table text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    hm.id as member_id,
    hm.full_name as member_name,
    hm.member_type,
    hm.dbs_certificate_number as certificate_number,
    hm.dbs_certificate_date as certificate_date,
    hm.dbs_certificate_expiry_date as expiry_date,
    (hm.dbs_certificate_expiry_date - CURRENT_DATE)::integer as days_until_expiry,
    hm.email,
    'applicant' as source_table
  FROM public.household_member_dbs_tracking hm
  WHERE hm.dbs_certificate_expiry_date IS NOT NULL
    AND (hm.dbs_certificate_expiry_date - CURRENT_DATE) BETWEEN 0 AND days_ahead
    AND hm.expiry_reminder_sent = false
  
  UNION ALL
  
  SELECT 
    ehm.id as member_id,
    ehm.full_name as member_name,
    ehm.member_type::text,
    ehm.dbs_certificate_number as certificate_number,
    ehm.dbs_certificate_date as certificate_date,
    ehm.dbs_certificate_expiry_date as expiry_date,
    (ehm.dbs_certificate_expiry_date - CURRENT_DATE)::integer as days_until_expiry,
    ehm.email,
    'employee' as source_table
  FROM public.employee_household_members ehm
  WHERE ehm.dbs_certificate_expiry_date IS NOT NULL
    AND (ehm.dbs_certificate_expiry_date - CURRENT_DATE) BETWEEN 0 AND days_ahead
    AND ehm.expiry_reminder_sent = false
  
  ORDER BY days_until_expiry ASC;
$$;

-- 4. Function for overdue DBS requests
CREATE OR REPLACE FUNCTION public.get_overdue_dbs_requests()
RETURNS TABLE(
  member_id uuid,
  member_name text,
  member_type text,
  days_overdue integer,
  reminder_count integer,
  last_reminder_date timestamp with time zone,
  email text,
  source_table text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    hm.id as member_id,
    hm.full_name as member_name,
    hm.member_type,
    (CURRENT_DATE - hm.dbs_request_date::date)::integer as days_overdue,
    hm.reminder_count,
    hm.last_reminder_date,
    hm.email,
    'applicant' as source_table
  FROM public.household_member_dbs_tracking hm
  WHERE hm.dbs_status::text = 'requested'
    AND hm.dbs_request_date IS NOT NULL
    AND (CURRENT_DATE - hm.dbs_request_date::date) >= 28
  
  UNION ALL
  
  SELECT 
    ehm.id as member_id,
    ehm.full_name as member_name,
    ehm.member_type::text,
    (CURRENT_DATE - ehm.dbs_request_date::date)::integer as days_overdue,
    ehm.reminder_count,
    ehm.last_reminder_date,
    ehm.email,
    'employee' as source_table
  FROM public.employee_household_members ehm
  WHERE ehm.dbs_status = 'requested'::dbs_status
    AND ehm.dbs_request_date IS NOT NULL
    AND (CURRENT_DATE - ehm.dbs_request_date::date) >= 28
  
  ORDER BY days_overdue DESC;
$$;