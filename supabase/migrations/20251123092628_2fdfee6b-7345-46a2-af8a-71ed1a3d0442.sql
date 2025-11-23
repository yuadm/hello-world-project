-- Add all missing fields to childminder_applications table

-- Personal & Address fields
ALTER TABLE childminder_applications
ADD COLUMN IF NOT EXISTS right_to_work text,
ADD COLUMN IF NOT EXISTS home_postcode text,
ADD COLUMN IF NOT EXISTS home_move_in date,
ADD COLUMN IF NOT EXISTS address_gaps text,
ADD COLUMN IF NOT EXISTS lived_outside_uk text,
ADD COLUMN IF NOT EXISTS military_base text;

-- Premises fields
ALTER TABLE childminder_applications
ADD COLUMN IF NOT EXISTS same_address text,
ADD COLUMN IF NOT EXISTS use_additional_premises text,
ADD COLUMN IF NOT EXISTS additional_premises jsonb,
ADD COLUMN IF NOT EXISTS outdoor_space text;

-- Service fields
ALTER TABLE childminder_applications
ADD COLUMN IF NOT EXISTS work_with_others text,
ADD COLUMN IF NOT EXISTS number_of_assistants integer,
ADD COLUMN IF NOT EXISTS overnight_care text;

-- Employment fields
ALTER TABLE childminder_applications
ADD COLUMN IF NOT EXISTS employment_gaps text,
ADD COLUMN IF NOT EXISTS child_volunteered text,
ADD COLUMN IF NOT EXISTS child_volunteered_consent boolean;

-- Applicant references (renamed from 'references' which is a reserved keyword)
ALTER TABLE childminder_applications
ADD COLUMN IF NOT EXISTS applicant_references jsonb;

-- People fields
ALTER TABLE childminder_applications
ADD COLUMN IF NOT EXISTS adults_in_home text,
ADD COLUMN IF NOT EXISTS children_in_home text;

-- Suitability fields
ALTER TABLE childminder_applications
ADD COLUMN IF NOT EXISTS prev_reg_agency text,
ADD COLUMN IF NOT EXISTS prev_reg_other_uk text,
ADD COLUMN IF NOT EXISTS prev_reg_eu text,
ADD COLUMN IF NOT EXISTS smoker text,
ADD COLUMN IF NOT EXISTS disqualified text,
ADD COLUMN IF NOT EXISTS other_circumstances text,
ADD COLUMN IF NOT EXISTS other_circumstances_details text,
ADD COLUMN IF NOT EXISTS has_dbs text,
ADD COLUMN IF NOT EXISTS dbs_number text,
ADD COLUMN IF NOT EXISTS dbs_enhanced text,
ADD COLUMN IF NOT EXISTS dbs_update text;

-- Declaration fields
ALTER TABLE childminder_applications
ADD COLUMN IF NOT EXISTS declaration_change_notification boolean,
ADD COLUMN IF NOT EXISTS declaration_inspection_cooperation boolean,
ADD COLUMN IF NOT EXISTS declaration_information_sharing boolean,
ADD COLUMN IF NOT EXISTS declaration_data_processing boolean,
ADD COLUMN IF NOT EXISTS payment_method text;