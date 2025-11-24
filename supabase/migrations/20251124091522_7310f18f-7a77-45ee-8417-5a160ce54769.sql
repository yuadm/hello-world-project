-- Fix security warnings from previous migration

-- Fix function search path for calculate_dbs_expiry
CREATE OR REPLACE FUNCTION public.calculate_dbs_expiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.dbs_certificate_date IS NOT NULL THEN
    NEW.dbs_certificate_expiry_date := NEW.dbs_certificate_date + INTERVAL '3 years';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate view without SECURITY DEFINER (use regular view)
DROP VIEW IF EXISTS public.dbs_compliance_metrics;
CREATE VIEW public.dbs_compliance_metrics AS
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