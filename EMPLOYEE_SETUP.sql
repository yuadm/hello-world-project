-- ===================================
-- EMPLOYEE MANAGEMENT SYSTEM SETUP
-- Run this SQL in your Supabase SQL Editor
-- ===================================

-- Step 1: Create enums
CREATE TYPE public.employment_status AS ENUM ('active', 'on_leave', 'terminated');
CREATE TYPE public.member_type AS ENUM ('adult', 'child');
CREATE TYPE public.dbs_status AS ENUM ('not_requested', 'requested', 'received', 'expired');

-- Step 2: Create employees table
CREATE TABLE public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES public.childminder_applications(id) ON DELETE SET NULL,
  
  -- Personal Information
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  date_of_birth date,
  ni_number text,
  
  -- Address
  address_line_1 text,
  address_line_2 text,
  town_city text,
  county text,
  postcode text,
  
  -- Employment Details
  employment_status employment_status DEFAULT 'active',
  employment_start_date date DEFAULT CURRENT_DATE,
  position text,
  
  -- Service Information
  local_authority text,
  local_authority_other text,
  premises_type text,
  premises_postcode text,
  age_groups_cared_for jsonb,
  max_capacity integer,
  service_type text,
  
  -- Qualifications
  first_aid_qualification text,
  first_aid_expiry_date date,
  safeguarding_training text,
  safeguarding_completion_date date,
  eyfs_training text,
  eyfs_completion_date date,
  level_2_qualification text,
  level_2_completion_date date,
  
  -- DBS Information
  dbs_certificate_number text,
  dbs_certificate_date date,
  dbs_certificate_expiry_date date,
  dbs_status dbs_status DEFAULT 'not_requested',
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(application_id)
);

-- Step 3: Create employee household members table
CREATE TABLE public.employee_household_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  
  member_type member_type NOT NULL,
  full_name text NOT NULL,
  date_of_birth date NOT NULL,
  relationship text,
  email text,
  
  -- DBS Information
  dbs_status dbs_status DEFAULT 'not_requested',
  dbs_certificate_number text,
  dbs_certificate_date date,
  dbs_certificate_expiry_date date,
  
  -- Age tracking
  age_group_changed_at timestamptz,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Step 4: Enable RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_household_members ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies for employees
CREATE POLICY "Admins can view all employees"
  ON public.employees FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert employees"
  ON public.employees FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update employees"
  ON public.employees FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete employees"
  ON public.employees FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Step 6: Create RLS policies for employee household members
CREATE POLICY "Admins can view all employee household members"
  ON public.employee_household_members FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert employee household members"
  ON public.employee_household_members FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update employee household members"
  ON public.employee_household_members FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete employee household members"
  ON public.employee_household_members FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Step 7: Create indexes
CREATE INDEX employees_application_id_idx ON public.employees(application_id);
CREATE INDEX employees_employment_status_idx ON public.employees(employment_status);
CREATE INDEX employee_household_members_employee_id_idx ON public.employee_household_members(employee_id);
CREATE INDEX employee_household_members_member_type_idx ON public.employee_household_members(member_type);
CREATE INDEX employee_household_members_dob_idx ON public.employee_household_members(date_of_birth);

-- Step 8: Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Add updated_at triggers
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_household_members_updated_at BEFORE UPDATE ON public.employee_household_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===================================
-- AGE TRACKING FUNCTIONS
-- ===================================

-- Function to calculate age from date of birth
CREATE OR REPLACE FUNCTION public.calculate_age(dob date)
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT EXTRACT(YEAR FROM age(CURRENT_DATE, dob))::integer;
$$;

-- Function to get days until 16th birthday
CREATE OR REPLACE FUNCTION public.days_until_16th_birthday(dob date)
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT (date(dob + INTERVAL '16 years') - CURRENT_DATE)::integer;
$$;

-- Function to automatically update member type when age changes
CREATE OR REPLACE FUNCTION public.update_member_age_group()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_age integer;
BEGIN
  -- Calculate current age
  current_age := public.calculate_age(new.date_of_birth);
  
  -- If age is 16 or older and member_type is 'child', update to 'adult'
  IF current_age >= 16 AND new.member_type = 'child' THEN
    new.member_type := 'adult';
    new.age_group_changed_at := now();
  END IF;
  
  -- If age is under 16 and member_type is 'adult', update to 'child'
  -- (This handles manual corrections)
  IF current_age < 16 AND new.member_type = 'adult' THEN
    new.member_type := 'child';
    new.age_group_changed_at := now();
  END IF;
  
  RETURN new;
END;
$$;

-- Create trigger to automatically update age group
CREATE TRIGGER update_member_age_group_trigger
  BEFORE INSERT OR UPDATE OF date_of_birth
  ON public.employee_household_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_member_age_group();

-- Function to get children turning 16 soon
CREATE OR REPLACE FUNCTION public.get_children_turning_16_soon(days_ahead integer DEFAULT 90)
RETURNS TABLE (
  id uuid,
  employee_id uuid,
  full_name text,
  date_of_birth date,
  current_age integer,
  days_until_16 integer,
  turns_16_on date
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ehm.id,
    ehm.employee_id,
    ehm.full_name,
    ehm.date_of_birth,
    public.calculate_age(ehm.date_of_birth) AS current_age,
    public.days_until_16th_birthday(ehm.date_of_birth) AS days_until_16,
    date(ehm.date_of_birth + INTERVAL '16 years') AS turns_16_on
  FROM public.employee_household_members ehm
  WHERE ehm.member_type = 'child'
    AND public.days_until_16th_birthday(ehm.date_of_birth) BETWEEN 0 AND days_ahead
  ORDER BY public.days_until_16th_birthday(ehm.date_of_birth) ASC;
$$;

-- ===================================
-- SETUP COMPLETE
-- ===================================
-- Run the edge functions check-16th-birthdays daily using Supabase cron
-- You can set this up in the Supabase dashboard or using SQL:
-- 
-- SELECT cron.schedule(
--   'check-16th-birthdays-daily',
--   '0 9 * * *',
--   $$
--   SELECT net.http_post(
--     url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/check-16th-birthdays',
--     headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
--   ) AS request_id;
--   $$
-- );
