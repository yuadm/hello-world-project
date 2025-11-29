-- Phase 1: Create Unified Compliance Tables with Polymorphic References
-- =============================================================================

-- 1. Create compliance_household_members table (unified from household_member_dbs_tracking + employee_household_members)
CREATE TABLE IF NOT EXISTS public.compliance_household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Polymorphic reference (exactly one must be set)
  application_id UUID REFERENCES public.childminder_applications(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  
  -- Basic info
  member_type public.member_type NOT NULL,
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  relationship TEXT,
  email TEXT,
  
  -- DBS tracking
  dbs_status public.dbs_status DEFAULT 'not_requested'::dbs_status,
  dbs_certificate_number TEXT,
  dbs_certificate_date DATE,
  dbs_certificate_expiry_date DATE,
  dbs_request_date TIMESTAMPTZ,
  
  -- Compliance tracking
  compliance_status TEXT DEFAULT 'pending',
  risk_level TEXT DEFAULT 'low',
  notes TEXT,
  
  -- Form tracking
  form_token TEXT,
  application_reference TEXT,
  application_submitted BOOLEAN DEFAULT false,
  response_received BOOLEAN DEFAULT false,
  response_date TIMESTAMPTZ,
  
  -- Follow-up tracking
  last_contact_date TIMESTAMPTZ,
  follow_up_due_date DATE,
  reminder_count INTEGER DEFAULT 0,
  last_reminder_date TIMESTAMPTZ,
  reminder_history JSONB DEFAULT '[]'::jsonb,
  
  -- Notification flags
  expiry_reminder_sent BOOLEAN DEFAULT false,
  turning_16_notification_sent BOOLEAN DEFAULT false,
  age_group_changed_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraint: exactly one parent must be set
  CONSTRAINT compliance_household_members_parent_check 
    CHECK (
      (application_id IS NOT NULL AND employee_id IS NULL) OR
      (application_id IS NULL AND employee_id IS NOT NULL)
    )
);

-- 2. Create compliance_assistants table (unified from assistant_dbs_tracking + employee_assistants)
CREATE TABLE IF NOT EXISTS public.compliance_assistants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Polymorphic reference (exactly one must be set)
  application_id UUID REFERENCES public.childminder_applications(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  
  -- Basic info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  
  -- DBS tracking
  dbs_status public.dbs_status DEFAULT 'not_requested'::dbs_status,
  dbs_certificate_number TEXT,
  dbs_certificate_date DATE,
  dbs_certificate_expiry_date DATE,
  dbs_request_date TIMESTAMPTZ,
  
  -- Form tracking
  form_token TEXT,
  form_status TEXT DEFAULT 'not_sent',
  form_sent_date TIMESTAMPTZ,
  form_submitted_date TIMESTAMPTZ,
  
  -- Compliance tracking
  compliance_status TEXT DEFAULT 'pending',
  risk_level TEXT DEFAULT 'low',
  notes TEXT,
  
  -- Follow-up tracking
  last_contact_date TIMESTAMPTZ,
  follow_up_due_date DATE,
  reminder_count INTEGER DEFAULT 0,
  last_reminder_date TIMESTAMPTZ,
  reminder_history JSONB DEFAULT '[]'::jsonb,
  
  -- Notification flags
  expiry_reminder_sent BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraint: exactly one parent must be set
  CONSTRAINT compliance_assistants_parent_check 
    CHECK (
      (application_id IS NOT NULL AND employee_id IS NULL) OR
      (application_id IS NULL AND employee_id IS NOT NULL)
    )
);

-- 3. Create compliance_household_forms table (unified from household_member_forms)
CREATE TABLE IF NOT EXISTS public.compliance_household_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Polymorphic reference (exactly one must be set)
  application_id UUID REFERENCES public.childminder_applications(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  
  -- Link to member
  member_id UUID REFERENCES public.compliance_household_members(id) ON DELETE CASCADE NOT NULL,
  
  -- Form token
  form_token TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'draft',
  
  -- Personal details
  title TEXT,
  first_name TEXT,
  middle_names TEXT,
  last_name TEXT,
  sex TEXT,
  date_of_birth DATE,
  birth_town TEXT,
  ni_number TEXT,
  
  -- Previous names
  previous_names JSONB DEFAULT '[]'::jsonb,
  
  -- Address info
  current_address JSONB,
  address_history JSONB DEFAULT '[]'::jsonb,
  lived_outside_uk TEXT,
  outside_uk_details TEXT,
  
  -- DBS info
  has_dbs TEXT,
  dbs_number TEXT,
  dbs_update_service TEXT,
  
  -- Background checks
  previous_registration TEXT,
  previous_registration_details JSONB,
  criminal_history TEXT,
  criminal_history_details TEXT,
  disqualified TEXT,
  social_services TEXT,
  social_services_details TEXT,
  
  -- Health
  health_conditions TEXT,
  health_conditions_details TEXT,
  smoker TEXT,
  
  -- Declarations
  consent_checks BOOLEAN DEFAULT false,
  declaration_truth BOOLEAN DEFAULT false,
  declaration_notify BOOLEAN DEFAULT false,
  signature_name TEXT,
  signature_date DATE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  
  -- Constraint: exactly one parent must be set
  CONSTRAINT compliance_household_forms_parent_check 
    CHECK (
      (application_id IS NOT NULL AND employee_id IS NULL) OR
      (application_id IS NULL AND employee_id IS NOT NULL)
    )
);

-- 4. Create compliance_assistant_forms table (unified from assistant_forms + employee_assistant_forms)
CREATE TABLE IF NOT EXISTS public.compliance_assistant_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Polymorphic reference (exactly one must be set)
  application_id UUID REFERENCES public.childminder_applications(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  
  -- Link to assistant
  assistant_id UUID REFERENCES public.compliance_assistants(id) ON DELETE CASCADE NOT NULL,
  
  -- Form token
  form_token TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'draft',
  
  -- Personal details
  title TEXT,
  first_name TEXT,
  middle_names TEXT,
  last_name TEXT,
  sex TEXT,
  date_of_birth DATE,
  birth_town TEXT,
  ni_number TEXT,
  
  -- Previous names
  previous_names JSONB DEFAULT '[]'::jsonb,
  
  -- Address info
  current_address JSONB,
  address_history JSONB DEFAULT '[]'::jsonb,
  lived_outside_uk TEXT,
  
  -- Employment info
  employment_history JSONB DEFAULT '[]'::jsonb,
  employment_gaps TEXT,
  
  -- Training
  pfa_completed TEXT,
  safeguarding_completed TEXT,
  
  -- DBS info
  has_dbs TEXT,
  dbs_number TEXT,
  dbs_update_service TEXT,
  
  -- Background checks
  previous_registration TEXT,
  previous_registration_details JSONB,
  criminal_history TEXT,
  criminal_history_details TEXT,
  disqualified TEXT,
  social_services TEXT,
  social_services_details TEXT,
  
  -- Health
  health_conditions TEXT,
  health_conditions_details TEXT,
  smoker TEXT,
  
  -- Declarations
  consent_checks BOOLEAN DEFAULT false,
  declaration_truth BOOLEAN DEFAULT false,
  declaration_notify BOOLEAN DEFAULT false,
  signature_name TEXT,
  signature_date DATE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  
  -- Constraint: exactly one parent must be set
  CONSTRAINT compliance_assistant_forms_parent_check 
    CHECK (
      (application_id IS NOT NULL AND employee_id IS NULL) OR
      (application_id IS NULL AND employee_id IS NOT NULL)
    )
);

-- =============================================================================
-- Data Migration: Copy existing data from old tables to new unified tables
-- =============================================================================

-- Migrate household_member_dbs_tracking (application-based) to compliance_household_members
INSERT INTO public.compliance_household_members (
  id, application_id, employee_id, member_type, full_name, date_of_birth, relationship, email,
  dbs_status, dbs_certificate_number, dbs_certificate_date, dbs_certificate_expiry_date, dbs_request_date,
  compliance_status, risk_level, notes, form_token, application_reference, application_submitted,
  response_received, response_date, last_contact_date, follow_up_due_date, reminder_count,
  last_reminder_date, reminder_history, expiry_reminder_sent, turning_16_notification_sent,
  created_at, updated_at
)
SELECT 
  id, application_id, NULL::uuid, member_type::member_type, full_name, date_of_birth, relationship, email,
  dbs_status::dbs_status, dbs_certificate_number, dbs_certificate_date, dbs_certificate_expiry_date, dbs_request_date,
  compliance_status, risk_level, notes, form_token, application_reference, application_submitted,
  response_received, response_date, last_contact_date, follow_up_due_date, reminder_count,
  last_reminder_date, reminder_history, expiry_reminder_sent, turning_16_notification_sent,
  created_at, updated_at
FROM public.household_member_dbs_tracking;

-- Migrate employee_household_members to compliance_household_members
INSERT INTO public.compliance_household_members (
  id, application_id, employee_id, member_type, full_name, date_of_birth, relationship, email,
  dbs_status, dbs_certificate_number, dbs_certificate_date, dbs_certificate_expiry_date, dbs_request_date,
  compliance_status, risk_level, notes, form_token, application_reference, application_submitted,
  response_received, response_date, last_contact_date, follow_up_due_date, reminder_count,
  last_reminder_date, reminder_history, expiry_reminder_sent, turning_16_notification_sent,
  age_group_changed_at, created_at, updated_at
)
SELECT 
  id, NULL::uuid, employee_id, member_type, full_name, date_of_birth, relationship, email,
  dbs_status, dbs_certificate_number, dbs_certificate_date, dbs_certificate_expiry_date, dbs_request_date,
  compliance_status, risk_level, notes, form_token, application_reference, application_submitted,
  response_received, response_date, last_contact_date, follow_up_due_date, reminder_count,
  last_reminder_date, reminder_history, expiry_reminder_sent, turning_16_notification_sent,
  age_group_changed_at, created_at, updated_at
FROM public.employee_household_members;

-- Migrate assistant_dbs_tracking (application-based) to compliance_assistants
INSERT INTO public.compliance_assistants (
  id, application_id, employee_id, first_name, last_name, email, phone, role, date_of_birth,
  dbs_status, dbs_certificate_number, dbs_certificate_date, dbs_certificate_expiry_date, dbs_request_date,
  form_token, form_status, form_sent_date, form_submitted_date, compliance_status, risk_level, notes,
  last_contact_date, follow_up_due_date, reminder_count, last_reminder_date, reminder_history,
  expiry_reminder_sent, created_at, updated_at
)
SELECT 
  id, application_id, NULL::uuid, first_name, last_name, email, phone, role, date_of_birth,
  dbs_status, dbs_certificate_number, dbs_certificate_date, dbs_certificate_expiry_date, dbs_request_date,
  form_token, form_status, form_sent_date, form_submitted_date, compliance_status, risk_level, notes,
  last_contact_date, follow_up_due_date, reminder_count, last_reminder_date, reminder_history,
  expiry_reminder_sent, created_at, updated_at
FROM public.assistant_dbs_tracking;

-- Migrate employee_assistants to compliance_assistants
INSERT INTO public.compliance_assistants (
  id, application_id, employee_id, first_name, last_name, email, phone, role, date_of_birth,
  dbs_status, dbs_certificate_number, dbs_certificate_date, dbs_certificate_expiry_date, dbs_request_date,
  form_token, form_status, form_sent_date, form_submitted_date, compliance_status, risk_level, notes,
  last_contact_date, follow_up_due_date, reminder_count, last_reminder_date, reminder_history,
  expiry_reminder_sent, created_at, updated_at
)
SELECT 
  id, NULL::uuid, employee_id, first_name, last_name, email, phone, role, date_of_birth,
  dbs_status, dbs_certificate_number, dbs_certificate_date, dbs_certificate_expiry_date, dbs_request_date,
  form_token, form_status, form_sent_date, form_submitted_date, compliance_status, risk_level, notes,
  last_contact_date, follow_up_due_date, reminder_count, last_reminder_date, reminder_history,
  expiry_reminder_sent, created_at, updated_at
FROM public.employee_assistants;

-- Migrate household_member_forms to compliance_household_forms
INSERT INTO public.compliance_household_forms (
  id, application_id, employee_id, member_id, form_token, status, title, first_name, middle_names, last_name,
  sex, date_of_birth, birth_town, ni_number, previous_names, current_address, address_history,
  lived_outside_uk, outside_uk_details, has_dbs, dbs_number, dbs_update_service, previous_registration,
  previous_registration_details, criminal_history, criminal_history_details, disqualified, social_services,
  social_services_details, health_conditions, health_conditions_details, smoker, consent_checks,
  declaration_truth, declaration_notify, signature_name, signature_date, created_at, updated_at, submitted_at
)
SELECT 
  id, application_id, NULL::uuid, member_id, form_token, status, title, first_name, middle_names, last_name,
  sex, date_of_birth, birth_town, ni_number, previous_names, current_address, address_history,
  lived_outside_uk, outside_uk_details, has_dbs, dbs_number, dbs_update_service, previous_registration,
  previous_registration_details, criminal_history, criminal_history_details, disqualified, social_services,
  social_services_details, health_conditions, health_conditions_details, smoker, consent_checks,
  declaration_truth, declaration_notify, signature_name, signature_date, created_at, updated_at, submitted_at
FROM public.household_member_forms;

-- Migrate assistant_forms (application-based) to compliance_assistant_forms
INSERT INTO public.compliance_assistant_forms (
  id, application_id, employee_id, assistant_id, form_token, status, title, first_name, middle_names, last_name,
  sex, date_of_birth, birth_town, ni_number, previous_names, current_address, address_history, lived_outside_uk,
  employment_history, employment_gaps, pfa_completed, safeguarding_completed, has_dbs, dbs_number, dbs_update_service,
  previous_registration, previous_registration_details, criminal_history, criminal_history_details, disqualified,
  social_services, social_services_details, health_conditions, health_conditions_details, smoker, consent_checks,
  declaration_truth, declaration_notify, signature_name, signature_date, created_at, updated_at, submitted_at
)
SELECT 
  id, application_id, NULL::uuid, assistant_id, form_token, status, title, first_name, middle_names, last_name,
  sex, date_of_birth, birth_town, ni_number, previous_names, current_address, address_history, lived_outside_uk,
  employment_history, employment_gaps, pfa_completed, safeguarding_completed, has_dbs, dbs_number, dbs_update_service,
  previous_registration, previous_registration_details, criminal_history, criminal_history_details, disqualified,
  social_services, social_services_details, health_conditions, health_conditions_details, smoker, consent_checks,
  declaration_truth, declaration_notify, signature_name, signature_date, created_at, updated_at, submitted_at
FROM public.assistant_forms;

-- Migrate employee_assistant_forms to compliance_assistant_forms
INSERT INTO public.compliance_assistant_forms (
  id, application_id, employee_id, assistant_id, form_token, status, title, first_name, middle_names, last_name,
  sex, date_of_birth, birth_town, ni_number, previous_names, current_address, address_history, lived_outside_uk,
  employment_history, employment_gaps, pfa_completed, safeguarding_completed, has_dbs, dbs_number, dbs_update_service,
  previous_registration, previous_registration_details, criminal_history, criminal_history_details, disqualified,
  social_services, social_services_details, health_conditions, health_conditions_details, smoker, consent_checks,
  declaration_truth, declaration_notify, signature_name, signature_date, created_at, updated_at, submitted_at
)
SELECT 
  id, NULL::uuid, employee_id, employee_assistant_id, form_token, status, title, first_name, middle_names, last_name,
  sex, date_of_birth, birth_town, ni_number, previous_names, current_address, address_history, lived_outside_uk,
  employment_history, employment_gaps, pfa_completed, safeguarding_completed, has_dbs, dbs_number, dbs_update_service,
  previous_registration, previous_registration_details, criminal_history, criminal_history_details, disqualified,
  social_services, social_services_details, health_conditions, health_conditions_details, smoker, consent_checks,
  declaration_truth, declaration_notify, signature_name, signature_date, created_at, updated_at, submitted_at
FROM public.employee_assistant_forms;

-- =============================================================================
-- Indexes for Performance
-- =============================================================================

CREATE INDEX idx_compliance_household_members_application ON public.compliance_household_members(application_id) WHERE application_id IS NOT NULL;
CREATE INDEX idx_compliance_household_members_employee ON public.compliance_household_members(employee_id) WHERE employee_id IS NOT NULL;
CREATE INDEX idx_compliance_household_members_dob ON public.compliance_household_members(date_of_birth);
CREATE INDEX idx_compliance_household_members_dbs_status ON public.compliance_household_members(dbs_status);

CREATE INDEX idx_compliance_assistants_application ON public.compliance_assistants(application_id) WHERE application_id IS NOT NULL;
CREATE INDEX idx_compliance_assistants_employee ON public.compliance_assistants(employee_id) WHERE employee_id IS NOT NULL;
CREATE INDEX idx_compliance_assistants_dbs_status ON public.compliance_assistants(dbs_status);

CREATE INDEX idx_compliance_household_forms_member ON public.compliance_household_forms(member_id);
CREATE INDEX idx_compliance_household_forms_token ON public.compliance_household_forms(form_token);

CREATE INDEX idx_compliance_assistant_forms_assistant ON public.compliance_assistant_forms(assistant_id);
CREATE INDEX idx_compliance_assistant_forms_token ON public.compliance_assistant_forms(form_token);

-- =============================================================================
-- Triggers for updated_at
-- =============================================================================

CREATE TRIGGER update_compliance_household_members_updated_at
  BEFORE UPDATE ON public.compliance_household_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compliance_assistants_updated_at
  BEFORE UPDATE ON public.compliance_assistants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compliance_household_forms_updated_at
  BEFORE UPDATE ON public.compliance_household_forms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compliance_assistant_forms_updated_at
  BEFORE UPDATE ON public.compliance_assistant_forms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- Row Level Security Policies
-- =============================================================================

-- Enable RLS
ALTER TABLE public.compliance_household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_household_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_assistant_forms ENABLE ROW LEVEL SECURITY;

-- Policies for compliance_household_members
CREATE POLICY "Admins can view all compliance household members"
  ON public.compliance_household_members FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert compliance household members"
  ON public.compliance_household_members FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update compliance household members"
  ON public.compliance_household_members FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete compliance household members"
  ON public.compliance_household_members FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Policies for compliance_assistants
CREATE POLICY "Admins can view all compliance assistants"
  ON public.compliance_assistants FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert compliance assistants"
  ON public.compliance_assistants FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update compliance assistants"
  ON public.compliance_assistants FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete compliance assistants"
  ON public.compliance_assistants FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view compliance assistants via form token"
  ON public.compliance_assistants FOR SELECT
  USING (form_token IS NOT NULL);

-- Policies for compliance_household_forms
CREATE POLICY "Admins can view all compliance household forms"
  ON public.compliance_household_forms FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update compliance household forms"
  ON public.compliance_household_forms FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view own household form via token"
  ON public.compliance_household_forms FOR SELECT
  USING (true);

CREATE POLICY "Public can insert household forms with token"
  ON public.compliance_household_forms FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update own household form via token"
  ON public.compliance_household_forms FOR UPDATE
  USING (true);

-- Policies for compliance_assistant_forms
CREATE POLICY "Admins can view all compliance assistant forms"
  ON public.compliance_assistant_forms FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update compliance assistant forms"
  ON public.compliance_assistant_forms FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view own assistant form via token"
  ON public.compliance_assistant_forms FOR SELECT
  USING (true);

CREATE POLICY "Public can insert assistant forms with token"
  ON public.compliance_assistant_forms FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update own assistant form via token"
  ON public.compliance_assistant_forms FOR UPDATE
  USING (true);