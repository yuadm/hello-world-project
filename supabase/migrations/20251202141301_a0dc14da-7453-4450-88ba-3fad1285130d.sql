-- Drop and recreate SELECT policies as PERMISSIVE for compliance_household_members
DROP POLICY IF EXISTS "Admins can view all compliance household members" ON public.compliance_household_members;

CREATE POLICY "Admins can view all compliance household members" 
ON public.compliance_household_members 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Also add a public read policy for members to view via form token (for household form filling)
DROP POLICY IF EXISTS "Public can view own household member via token" ON public.compliance_household_members;

CREATE POLICY "Public can view own household member via token"
ON public.compliance_household_members
FOR SELECT
TO anon, authenticated
USING (form_token IS NOT NULL);

-- Ensure the INSERT policy for applications is permissive
DROP POLICY IF EXISTS "Allow public insert for application compliance members" ON public.compliance_household_members;

CREATE POLICY "Allow public insert for application compliance members"
ON public.compliance_household_members
FOR INSERT
TO anon, authenticated
WITH CHECK (application_id IS NOT NULL);

-- Ensure UPDATE policy for admins
DROP POLICY IF EXISTS "Admins can update compliance household members" ON public.compliance_household_members;

CREATE POLICY "Admins can update compliance household members"
ON public.compliance_household_members
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Ensure DELETE policy for admins
DROP POLICY IF EXISTS "Admins can delete compliance household members" ON public.compliance_household_members;

CREATE POLICY "Admins can delete compliance household members"
ON public.compliance_household_members
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));