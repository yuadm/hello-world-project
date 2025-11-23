-- Clean up duplicate records for Joseph in application a18b9790-0204-4966-af8d-474ea8fc3c14
-- Keep only the most recent DOB (2009-11-24)
DELETE FROM household_member_dbs_tracking
WHERE application_id = 'a18b9790-0204-4966-af8d-474ea8fc3c14'
  AND full_name = 'Joseph'
  AND date_of_birth IN ('2007-11-24', '2008-11-24');

-- Add unique constraint to prevent future duplicates
-- This ensures only one record per person per application
CREATE UNIQUE INDEX IF NOT EXISTS household_member_unique_per_application 
ON household_member_dbs_tracking (application_id, full_name, member_type);