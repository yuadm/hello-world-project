-- Allow public to view active employees (childminders) for the finder feature
CREATE POLICY "Public can view active employees for finder"
ON public.employees
FOR SELECT
USING (employment_status = 'active');