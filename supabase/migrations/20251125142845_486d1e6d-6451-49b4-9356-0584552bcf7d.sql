-- Add compliance tracking columns to employees table
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS compliance_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS risk_level TEXT DEFAULT 'low',
ADD COLUMN IF NOT EXISTS last_contact_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reminder_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_reminder_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reminder_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS dbs_request_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS follow_up_due_date DATE,
ADD COLUMN IF NOT EXISTS expiry_reminder_sent BOOLEAN DEFAULT false;

-- Create index for compliance queries
CREATE INDEX IF NOT EXISTS idx_employees_compliance_status ON public.employees(compliance_status);
CREATE INDEX IF NOT EXISTS idx_employees_risk_level ON public.employees(risk_level);

-- Set up cron job to run compliance check daily at 2 AM
SELECT cron.schedule(
  'daily-compliance-check',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://pnslbftwceqremqsfylk.supabase.co/functions/v1/check-compliance-status',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuc2xiZnR3Y2VxcmVtcXNmeWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MTI2NDcsImV4cCI6MjA3OTI4ODY0N30.mvuOOlnSo7xA_GOuQ_kP9pG8VwUBzQ9QSe3yuJvvXOc"}'::jsonb
  ) AS request_id;
  $$
);