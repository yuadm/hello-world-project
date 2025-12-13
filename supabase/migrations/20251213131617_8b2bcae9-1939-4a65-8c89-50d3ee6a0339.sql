-- Update the premises_address for Yussuf Mohamed application to use current_address data
UPDATE childminder_applications 
SET premises_address = current_address
WHERE id = 'a2769b71-a879-488b-973b-ff0f202e7747' 
AND (premises_address IS NULL OR premises_address = '{"line1": "", "line2": "", "postcode": "", "town": ""}'::jsonb);