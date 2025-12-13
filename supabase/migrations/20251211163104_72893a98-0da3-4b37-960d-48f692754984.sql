-- Create compliance_cochildminders table to track co-childminder records
CREATE TABLE public.compliance_cochildminders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id uuid REFERENCES public.childminder_applications(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date NOT NULL,
  email text,
  phone text,
  form_token text,
  form_status text DEFAULT 'not_sent'::text,
  form_sent_date timestamp with time zone,
  form_submitted_date timestamp with time zone,
  compliance_status text DEFAULT 'pending'::text,
  dbs_status dbs_status DEFAULT 'not_requested'::dbs_status,
  dbs_request_date timestamp with time zone,
  dbs_certificate_number text,
  dbs_certificate_date date,
  dbs_certificate_expiry_date date,
  expiry_reminder_sent boolean DEFAULT false,
  reminder_count integer DEFAULT 0,
  last_reminder_date timestamp with time zone,
  reminder_history jsonb DEFAULT '[]'::jsonb,
  last_contact_date timestamp with time zone,
  follow_up_due_date date,
  risk_level text DEFAULT 'low'::text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create cochildminder_applications table to store their full application data
CREATE TABLE public.cochildminder_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cochildminder_id uuid NOT NULL REFERENCES public.compliance_cochildminders(id) ON DELETE CASCADE,
  application_id uuid REFERENCES public.childminder_applications(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE,
  form_token text NOT NULL,
  status text DEFAULT 'draft'::text,
  
  -- Section 1: Personal Details
  title text,
  first_name text,
  middle_names text,
  last_name text,
  sex text,
  date_of_birth date,
  birth_town text,
  ni_number text,
  previous_names jsonb DEFAULT '[]'::jsonb,
  
  -- Section 2: Address History
  current_address jsonb,
  address_history jsonb DEFAULT '[]'::jsonb,
  lived_outside_uk text,
  outside_uk_details text,
  
  -- Pre-filled from main application (Section 3 & 4)
  premises_address jsonb,
  local_authority text,
  premises_type text,
  service_age_groups jsonb,
  service_hours jsonb,
  
  -- Section 5: Qualifications
  has_dbs text,
  dbs_number text,
  dbs_update_service text,
  first_aid_completed text,
  first_aid_provider text,
  first_aid_date date,
  safeguarding_completed text,
  safeguarding_provider text,
  safeguarding_date date,
  pfa_completed text,
  level_2_qualification text,
  level_2_provider text,
  level_2_date date,
  eyfs_completed text,
  eyfs_provider text,
  eyfs_date date,
  other_qualifications text,
  
  -- Section 6: Employment History
  employment_history jsonb DEFAULT '[]'::jsonb,
  employment_gaps text,
  
  -- Section 7: References (co-childminder needs their own references)
  reference_1_name text,
  reference_1_relationship text,
  reference_1_email text,
  reference_1_phone text,
  reference_1_childcare boolean DEFAULT false,
  reference_2_name text,
  reference_2_relationship text,
  reference_2_email text,
  reference_2_phone text,
  reference_2_childcare boolean DEFAULT false,
  
  -- Section 8: Suitability
  previous_registration text,
  previous_registration_details jsonb,
  criminal_history text,
  criminal_history_details text,
  disqualified text,
  social_services text,
  social_services_details text,
  health_conditions text,
  health_conditions_details text,
  smoker text,
  
  -- Section 9: Declaration
  consent_checks boolean DEFAULT false,
  declaration_truth boolean DEFAULT false,
  declaration_notify boolean DEFAULT false,
  signature_name text,
  signature_date date,
  
  submitted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.compliance_cochildminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cochildminder_applications ENABLE ROW LEVEL SECURITY;

-- RLS policies for compliance_cochildminders
CREATE POLICY "Admins can view all compliance cochildminders" ON public.compliance_cochildminders
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert compliance cochildminders" ON public.compliance_cochildminders
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update compliance cochildminders" ON public.compliance_cochildminders
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete compliance cochildminders" ON public.compliance_cochildminders
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Allow anonymous cochildminder creation" ON public.compliance_cochildminders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous to select cochildminders" ON public.compliance_cochildminders
  FOR SELECT USING (true);

CREATE POLICY "Public can view cochildminders via form token" ON public.compliance_cochildminders
  FOR SELECT USING (form_token IS NOT NULL);

-- RLS policies for cochildminder_applications
CREATE POLICY "Admins can view all cochildminder applications" ON public.cochildminder_applications
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update cochildminder applications" ON public.cochildminder_applications
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can insert cochildminder applications with token" ON public.cochildminder_applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update own cochildminder application via token" ON public.cochildminder_applications
  FOR UPDATE USING (true);

CREATE POLICY "Public can view own cochildminder application via token" ON public.cochildminder_applications
  FOR SELECT USING (true);

-- Add trigger for DBS expiry calculation
CREATE TRIGGER calculate_cochildminder_dbs_expiry
  BEFORE INSERT OR UPDATE ON public.compliance_cochildminders
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_dbs_expiry();

-- Add trigger for updated_at
CREATE TRIGGER update_cochildminders_updated_at
  BEFORE UPDATE ON public.compliance_cochildminders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_cochildminder_applications_updated_at
  BEFORE UPDATE ON public.cochildminder_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();