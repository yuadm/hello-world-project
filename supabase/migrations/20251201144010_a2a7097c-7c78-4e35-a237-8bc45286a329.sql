-- Add applicant_references column to employees table
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS applicant_references jsonb;