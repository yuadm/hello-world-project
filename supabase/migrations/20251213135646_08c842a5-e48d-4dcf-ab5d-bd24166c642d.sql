-- Add address_history column to employees table
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS address_history jsonb;

-- Backfill existing employee record with missing address history
UPDATE employees 
SET address_history = (
  SELECT address_history 
  FROM childminder_applications 
  WHERE id = employees.application_id
)
WHERE application_id IS NOT NULL 
  AND address_history IS NULL;