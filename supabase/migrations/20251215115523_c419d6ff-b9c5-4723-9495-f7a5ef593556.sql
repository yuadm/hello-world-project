-- Create enforcement case type enum
CREATE TYPE public.enforcement_case_type AS ENUM ('suspension', 'warning', 'cancellation');

-- Create enforcement case status enum
CREATE TYPE public.enforcement_case_status AS ENUM (
  'pending', 
  'in_effect', 
  'representations_received', 
  'decision_pending', 
  'lifted', 
  'cancelled', 
  'closed'
);

-- Create risk level enum
CREATE TYPE public.risk_level AS ENUM ('low', 'medium', 'high', 'critical');

-- Create timeline event type enum
CREATE TYPE public.timeline_event_type AS ENUM ('completed', 'pending', 'urgent');

-- Create notification status enum
CREATE TYPE public.notification_status AS ENUM ('pending', 'sent', 'failed');

-- Create enforcement_cases table
CREATE TABLE public.enforcement_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  type enforcement_case_type NOT NULL,
  status enforcement_case_status NOT NULL DEFAULT 'pending',
  risk_level risk_level NOT NULL DEFAULT 'medium',
  concern TEXT,
  risk_detail TEXT,
  risk_categories JSONB DEFAULT '[]'::jsonb,
  deadline DATE,
  date_created DATE NOT NULL DEFAULT CURRENT_DATE,
  date_closed DATE,
  supervisor_id UUID,
  supervisor_name TEXT,
  form_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create enforcement_timeline table
CREATE TABLE public.enforcement_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.enforcement_cases(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type timeline_event_type NOT NULL DEFAULT 'completed',
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create enforcement_notifications table
CREATE TABLE public.enforcement_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.enforcement_cases(id) ON DELETE CASCADE,
  agency TEXT NOT NULL,
  agency_name TEXT NOT NULL,
  agency_detail TEXT,
  agency_email TEXT NOT NULL,
  status notification_status NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  sent_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create enforcement_notices table
CREATE TABLE public.enforcement_notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.enforcement_cases(id) ON DELETE CASCADE,
  notice_type TEXT NOT NULL,
  reference_number TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  pdf_url TEXT
);

-- Enable RLS on all tables
ALTER TABLE public.enforcement_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enforcement_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enforcement_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enforcement_notices ENABLE ROW LEVEL SECURITY;

-- RLS policies for enforcement_cases
CREATE POLICY "Admins can view all enforcement cases"
ON public.enforcement_cases FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert enforcement cases"
ON public.enforcement_cases FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update enforcement cases"
ON public.enforcement_cases FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete enforcement cases"
ON public.enforcement_cases FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for enforcement_timeline
CREATE POLICY "Admins can view all enforcement timeline"
ON public.enforcement_timeline FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert enforcement timeline"
ON public.enforcement_timeline FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update enforcement timeline"
ON public.enforcement_timeline FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete enforcement timeline"
ON public.enforcement_timeline FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for enforcement_notifications
CREATE POLICY "Admins can view all enforcement notifications"
ON public.enforcement_notifications FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert enforcement notifications"
ON public.enforcement_notifications FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update enforcement notifications"
ON public.enforcement_notifications FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete enforcement notifications"
ON public.enforcement_notifications FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for enforcement_notices
CREATE POLICY "Admins can view all enforcement notices"
ON public.enforcement_notices FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert enforcement notices"
ON public.enforcement_notices FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update enforcement notices"
ON public.enforcement_notices FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete enforcement notices"
ON public.enforcement_notices FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger for enforcement_cases
CREATE TRIGGER update_enforcement_cases_updated_at
BEFORE UPDATE ON public.enforcement_cases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_enforcement_cases_employee_id ON public.enforcement_cases(employee_id);
CREATE INDEX idx_enforcement_cases_status ON public.enforcement_cases(status);
CREATE INDEX idx_enforcement_cases_type ON public.enforcement_cases(type);
CREATE INDEX idx_enforcement_timeline_case_id ON public.enforcement_timeline(case_id);
CREATE INDEX idx_enforcement_notifications_case_id ON public.enforcement_notifications(case_id);
CREATE INDEX idx_enforcement_notices_case_id ON public.enforcement_notices(case_id);