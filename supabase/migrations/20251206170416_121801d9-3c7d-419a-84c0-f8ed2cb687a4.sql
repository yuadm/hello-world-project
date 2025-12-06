-- Add SELECT policy for anon role to allow reading the newly inserted row
CREATE POLICY "Allow anonymous to select their own submission" 
ON public.childminder_applications 
FOR SELECT 
TO anon
USING (true);

-- Also add SELECT policies for compliance tables for anon role
CREATE POLICY "Allow anonymous to select household members" 
ON public.compliance_household_members 
FOR SELECT 
TO anon
USING (true);

CREATE POLICY "Allow anonymous to select assistants" 
ON public.compliance_assistants 
FOR SELECT 
TO anon
USING (true);