-- Fix security warning: Add search_path to functions
CREATE OR REPLACE FUNCTION public.calculate_age(dob date)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXTRACT(YEAR FROM AGE(dob))::integer;
$$;

CREATE OR REPLACE FUNCTION public.get_members_approaching_16(days_ahead integer DEFAULT 90)
RETURNS TABLE (
  id uuid,
  application_id uuid,
  full_name text,
  date_of_birth date,
  relationship text,
  days_until_16 integer,
  turning_16_notification_sent boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    application_id,
    full_name,
    date_of_birth,
    relationship,
    EXTRACT(DAY FROM (date_of_birth + INTERVAL '16 years' - CURRENT_DATE))::integer as days_until_16,
    turning_16_notification_sent
  FROM public.household_member_dbs_tracking
  WHERE member_type = 'child'
    AND calculate_age(date_of_birth) < 16
    AND EXTRACT(DAY FROM (date_of_birth + INTERVAL '16 years' - CURRENT_DATE)) <= days_ahead
    AND EXTRACT(DAY FROM (date_of_birth + INTERVAL '16 years' - CURRENT_DATE)) >= 0
  ORDER BY days_until_16 ASC;
$$;