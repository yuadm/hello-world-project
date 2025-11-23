-- Phase 1 & 2: Enhanced DBS Compliance Tracking Schema

-- Add new columns for email tracking and compliance monitoring
ALTER TABLE public.household_member_dbs_tracking
ADD COLUMN IF NOT EXISTS reminder_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_reminder_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS reminder_history jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS last_contact_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS dbs_certificate_expiry_date date,
ADD COLUMN IF NOT EXISTS expiry_reminder_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS compliance_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS risk_level text DEFAULT 'low',
ADD COLUMN IF NOT EXISTS follow_up_due_date date,
ADD COLUMN IF NOT EXISTS response_received boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS response_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS application_submitted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS application_reference text;

-- Create function to calculate certificate expiry date (3 years from issue)
CREATE OR REPLACE FUNCTION public.calculate_dbs_expiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.dbs_certificate_date IS NOT NULL THEN
    NEW.dbs_certificate_expiry_date := NEW.dbs_certificate_date + INTERVAL '3 years';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate expiry date
DROP TRIGGER IF EXISTS set_dbs_expiry_date ON public.household_member_dbs_tracking;
CREATE TRIGGER set_dbs_expiry_date
  BEFORE INSERT OR UPDATE OF dbs_certificate_date
  ON public.household_member_dbs_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_dbs_expiry();

-- Create function to calculate risk level and compliance status
CREATE OR REPLACE FUNCTION public.calculate_compliance_status(
  member_row public.household_member_dbs_tracking
)
RETURNS TABLE (
  calculated_compliance_status text,
  calculated_risk_level text,
  days_overdue integer
) AS $$
DECLARE
  v_age integer;
  v_days_until_16 integer;
  v_days_since_request integer;
  v_days_until_expiry integer;
  v_compliance_status text;
  v_risk_level text;
  v_days_overdue integer := 0;
BEGIN
  -- Calculate age
  v_age := calculate_age(member_row.date_of_birth);
  
  -- Calculate days until 16th birthday
  v_days_until_16 := EXTRACT(DAY FROM (member_row.date_of_birth + INTERVAL '16 years' - CURRENT_DATE))::integer;
  
  -- Calculate days since DBS request
  IF member_row.dbs_request_date IS NOT NULL THEN
    v_days_since_request := EXTRACT(DAY FROM (CURRENT_DATE - member_row.dbs_request_date))::integer;
  END IF;
  
  -- Calculate days until certificate expiry
  IF member_row.dbs_certificate_expiry_date IS NOT NULL THEN
    v_days_until_expiry := EXTRACT(DAY FROM (member_row.dbs_certificate_expiry_date - CURRENT_DATE))::integer;
  END IF;
  
  -- Determine compliance status and risk level
  
  -- CRITICAL: Expired certificate or 16+ without DBS or overdue 30+ days
  IF (member_row.dbs_certificate_expiry_date IS NOT NULL AND v_days_until_expiry < 0) THEN
    v_compliance_status := 'expired';
    v_risk_level := 'critical';
    v_days_overdue := ABS(v_days_until_expiry);
  ELSIF (v_age >= 16 AND member_row.dbs_status != 'received') THEN
    v_compliance_status := 'overdue';
    v_risk_level := 'critical';
    IF member_row.dbs_request_date IS NOT NULL THEN
      v_days_overdue := GREATEST(0, v_days_since_request - 28);
    END IF;
  ELSIF (member_row.dbs_status = 'requested' AND v_days_since_request > 30) THEN
    v_compliance_status := 'overdue';
    v_risk_level := 'critical';
    v_days_overdue := v_days_since_request - 30;
    
  -- HIGH: Overdue 14-29 days or 3+ reminders or turning 16 in 7 days
  ELSIF (member_row.dbs_status = 'requested' AND v_days_since_request BETWEEN 14 AND 30) THEN
    v_compliance_status := 'at_risk';
    v_risk_level := 'high';
  ELSIF (member_row.reminder_count >= 3 AND member_row.dbs_status != 'received') THEN
    v_compliance_status := 'at_risk';
    v_risk_level := 'high';
  ELSIF (v_age < 16 AND v_days_until_16 BETWEEN 0 AND 7) THEN
    v_compliance_status := 'at_risk';
    v_risk_level := 'high';
    
  -- MEDIUM: Overdue 7-13 days or 2 reminders or certificate expiring in 30 days
  ELSIF (member_row.dbs_status = 'requested' AND v_days_since_request BETWEEN 7 AND 13) THEN
    v_compliance_status := 'pending';
    v_risk_level := 'medium';
  ELSIF (member_row.reminder_count >= 2 AND member_row.dbs_status != 'received') THEN
    v_compliance_status := 'pending';
    v_risk_level := 'medium';
  ELSIF (v_days_until_expiry IS NOT NULL AND v_days_until_expiry BETWEEN 0 AND 30) THEN
    v_compliance_status := 'at_risk';
    v_risk_level := 'medium';
    
  -- COMPLIANT: Certificate received and valid
  ELSIF (member_row.dbs_status = 'received' AND (v_days_until_expiry IS NULL OR v_days_until_expiry > 30)) THEN
    v_compliance_status := 'compliant';
    v_risk_level := 'low';
    
  -- LOW: Pending < 7 days
  ELSE
    v_compliance_status := 'pending';
    v_risk_level := 'low';
  END IF;
  
  RETURN QUERY SELECT v_compliance_status, v_risk_level, v_days_overdue;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Create view for enhanced compliance metrics
CREATE OR REPLACE VIEW public.dbs_compliance_metrics AS
SELECT 
  application_id,
  COUNT(*) as total_members,
  COUNT(*) FILTER (WHERE compliance_status = 'compliant') as compliant_count,
  COUNT(*) FILTER (WHERE compliance_status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE compliance_status = 'overdue') as overdue_count,
  COUNT(*) FILTER (WHERE compliance_status = 'at_risk') as at_risk_count,
  COUNT(*) FILTER (WHERE compliance_status = 'expired') as expired_count,
  COUNT(*) FILTER (WHERE risk_level = 'critical') as critical_risk_count,
  COUNT(*) FILTER (WHERE risk_level = 'high') as high_risk_count,
  COUNT(*) FILTER (WHERE risk_level = 'medium') as medium_risk_count,
  COUNT(*) FILTER (WHERE dbs_certificate_expiry_date IS NOT NULL AND 
    dbs_certificate_expiry_date - CURRENT_DATE <= 90) as expiring_soon_count,
  COUNT(*) FILTER (WHERE member_type = 'child' AND 
    calculate_age(date_of_birth) < 16 AND
    EXTRACT(DAY FROM (date_of_birth + INTERVAL '16 years' - CURRENT_DATE)) <= 90) as turning_16_soon_count
FROM public.household_member_dbs_tracking
GROUP BY application_id;

-- Grant access to the view
GRANT SELECT ON public.dbs_compliance_metrics TO authenticated;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_household_dbs_compliance_status 
ON public.household_member_dbs_tracking(compliance_status);

CREATE INDEX IF NOT EXISTS idx_household_dbs_risk_level 
ON public.household_member_dbs_tracking(risk_level);

CREATE INDEX IF NOT EXISTS idx_household_dbs_expiry_date 
ON public.household_member_dbs_tracking(dbs_certificate_expiry_date);

CREATE INDEX IF NOT EXISTS idx_household_dbs_follow_up 
ON public.household_member_dbs_tracking(follow_up_due_date);