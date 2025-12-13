-- Add missing cochildminder columns to childminder_applications table
ALTER TABLE public.childminder_applications 
ADD COLUMN IF NOT EXISTS work_with_cochildminders text,
ADD COLUMN IF NOT EXISTS number_of_cochildminders integer,
ADD COLUMN IF NOT EXISTS cochildminders jsonb;