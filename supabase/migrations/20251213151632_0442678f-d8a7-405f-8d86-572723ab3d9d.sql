-- Add service_capacity column to employees table
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS service_capacity jsonb DEFAULT NULL;