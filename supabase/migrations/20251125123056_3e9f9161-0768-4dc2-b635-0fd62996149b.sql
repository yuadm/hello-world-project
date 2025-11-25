-- Add form_token column to employee_household_members for tracking household forms
ALTER TABLE employee_household_members 
ADD COLUMN IF NOT EXISTS form_token TEXT;

-- Add index for quick lookups by form token
CREATE INDEX IF NOT EXISTS idx_employee_household_members_form_token 
ON employee_household_members(form_token);