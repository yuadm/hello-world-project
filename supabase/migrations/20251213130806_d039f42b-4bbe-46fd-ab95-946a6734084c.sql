-- Add unique constraint on form_token for ON CONFLICT to work
ALTER TABLE cochildminder_applications
ADD CONSTRAINT cochildminder_applications_form_token_key UNIQUE (form_token);