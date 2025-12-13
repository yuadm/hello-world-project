export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      childminder_applications: {
        Row: {
          additional_premises: Json | null
          address_gaps: string | null
          address_history: Json | null
          adults_in_home: string | null
          applicant_references: Json | null
          child_volunteered: string | null
          child_volunteered_consent: boolean | null
          children_in_home: string | null
          cochildminders: Json | null
          convictions_details: string | null
          created_at: string
          criminal_convictions: string | null
          current_address: Json | null
          current_employment: string | null
          date_of_birth: string | null
          dbs_enhanced: string | null
          dbs_number: string | null
          dbs_update: string | null
          declaration_change_notification: boolean | null
          declaration_confirmed: boolean | null
          declaration_data_processing: boolean | null
          declaration_date: string | null
          declaration_information_sharing: boolean | null
          declaration_inspection_cooperation: boolean | null
          declaration_signature: string | null
          disqualified: string | null
          email: string | null
          employment_gaps: string | null
          employment_history: Json | null
          first_name: string | null
          gender: string | null
          has_dbs: string | null
          health_conditions: string | null
          health_details: string | null
          home_move_in: string | null
          home_postcode: string | null
          id: string
          last_name: string | null
          lived_outside_uk: string | null
          middle_names: string | null
          military_base: string | null
          national_insurance_number: string | null
          number_of_assistants: number | null
          number_of_cochildminders: number | null
          other_circumstances: string | null
          other_circumstances_details: string | null
          outdoor_space: string | null
          overnight_care: string | null
          payment_method: string | null
          people_in_household: Json | null
          people_regular_contact: Json | null
          phone_home: string | null
          phone_mobile: string | null
          place_of_birth: string | null
          premises_address: Json | null
          premises_animal_details: string | null
          premises_animals: string | null
          premises_landlord_details: Json | null
          premises_other_residents: Json | null
          premises_ownership: string | null
          prev_reg_agency: string | null
          prev_reg_eu: string | null
          prev_reg_other_uk: string | null
          previous_names: Json | null
          previous_registration: string | null
          qualifications: Json | null
          registration_details: Json | null
          right_to_work: string | null
          safeguarding_concerns: string | null
          safeguarding_details: string | null
          same_address: string | null
          service_age_range: Json | null
          service_capacity: Json | null
          service_hours: Json | null
          service_local_authority: string | null
          service_ofsted_number: string | null
          service_ofsted_registered: string | null
          service_type: string | null
          smoker: string | null
          status: string
          title: string | null
          training_courses: Json | null
          updated_at: string
          use_additional_premises: string | null
          user_id: string | null
          work_with_cochildminders: string | null
          work_with_others: string | null
        }
        Insert: {
          additional_premises?: Json | null
          address_gaps?: string | null
          address_history?: Json | null
          adults_in_home?: string | null
          applicant_references?: Json | null
          child_volunteered?: string | null
          child_volunteered_consent?: boolean | null
          children_in_home?: string | null
          cochildminders?: Json | null
          convictions_details?: string | null
          created_at?: string
          criminal_convictions?: string | null
          current_address?: Json | null
          current_employment?: string | null
          date_of_birth?: string | null
          dbs_enhanced?: string | null
          dbs_number?: string | null
          dbs_update?: string | null
          declaration_change_notification?: boolean | null
          declaration_confirmed?: boolean | null
          declaration_data_processing?: boolean | null
          declaration_date?: string | null
          declaration_information_sharing?: boolean | null
          declaration_inspection_cooperation?: boolean | null
          declaration_signature?: string | null
          disqualified?: string | null
          email?: string | null
          employment_gaps?: string | null
          employment_history?: Json | null
          first_name?: string | null
          gender?: string | null
          has_dbs?: string | null
          health_conditions?: string | null
          health_details?: string | null
          home_move_in?: string | null
          home_postcode?: string | null
          id?: string
          last_name?: string | null
          lived_outside_uk?: string | null
          middle_names?: string | null
          military_base?: string | null
          national_insurance_number?: string | null
          number_of_assistants?: number | null
          number_of_cochildminders?: number | null
          other_circumstances?: string | null
          other_circumstances_details?: string | null
          outdoor_space?: string | null
          overnight_care?: string | null
          payment_method?: string | null
          people_in_household?: Json | null
          people_regular_contact?: Json | null
          phone_home?: string | null
          phone_mobile?: string | null
          place_of_birth?: string | null
          premises_address?: Json | null
          premises_animal_details?: string | null
          premises_animals?: string | null
          premises_landlord_details?: Json | null
          premises_other_residents?: Json | null
          premises_ownership?: string | null
          prev_reg_agency?: string | null
          prev_reg_eu?: string | null
          prev_reg_other_uk?: string | null
          previous_names?: Json | null
          previous_registration?: string | null
          qualifications?: Json | null
          registration_details?: Json | null
          right_to_work?: string | null
          safeguarding_concerns?: string | null
          safeguarding_details?: string | null
          same_address?: string | null
          service_age_range?: Json | null
          service_capacity?: Json | null
          service_hours?: Json | null
          service_local_authority?: string | null
          service_ofsted_number?: string | null
          service_ofsted_registered?: string | null
          service_type?: string | null
          smoker?: string | null
          status?: string
          title?: string | null
          training_courses?: Json | null
          updated_at?: string
          use_additional_premises?: string | null
          user_id?: string | null
          work_with_cochildminders?: string | null
          work_with_others?: string | null
        }
        Update: {
          additional_premises?: Json | null
          address_gaps?: string | null
          address_history?: Json | null
          adults_in_home?: string | null
          applicant_references?: Json | null
          child_volunteered?: string | null
          child_volunteered_consent?: boolean | null
          children_in_home?: string | null
          cochildminders?: Json | null
          convictions_details?: string | null
          created_at?: string
          criminal_convictions?: string | null
          current_address?: Json | null
          current_employment?: string | null
          date_of_birth?: string | null
          dbs_enhanced?: string | null
          dbs_number?: string | null
          dbs_update?: string | null
          declaration_change_notification?: boolean | null
          declaration_confirmed?: boolean | null
          declaration_data_processing?: boolean | null
          declaration_date?: string | null
          declaration_information_sharing?: boolean | null
          declaration_inspection_cooperation?: boolean | null
          declaration_signature?: string | null
          disqualified?: string | null
          email?: string | null
          employment_gaps?: string | null
          employment_history?: Json | null
          first_name?: string | null
          gender?: string | null
          has_dbs?: string | null
          health_conditions?: string | null
          health_details?: string | null
          home_move_in?: string | null
          home_postcode?: string | null
          id?: string
          last_name?: string | null
          lived_outside_uk?: string | null
          middle_names?: string | null
          military_base?: string | null
          national_insurance_number?: string | null
          number_of_assistants?: number | null
          number_of_cochildminders?: number | null
          other_circumstances?: string | null
          other_circumstances_details?: string | null
          outdoor_space?: string | null
          overnight_care?: string | null
          payment_method?: string | null
          people_in_household?: Json | null
          people_regular_contact?: Json | null
          phone_home?: string | null
          phone_mobile?: string | null
          place_of_birth?: string | null
          premises_address?: Json | null
          premises_animal_details?: string | null
          premises_animals?: string | null
          premises_landlord_details?: Json | null
          premises_other_residents?: Json | null
          premises_ownership?: string | null
          prev_reg_agency?: string | null
          prev_reg_eu?: string | null
          prev_reg_other_uk?: string | null
          previous_names?: Json | null
          previous_registration?: string | null
          qualifications?: Json | null
          registration_details?: Json | null
          right_to_work?: string | null
          safeguarding_concerns?: string | null
          safeguarding_details?: string | null
          same_address?: string | null
          service_age_range?: Json | null
          service_capacity?: Json | null
          service_hours?: Json | null
          service_local_authority?: string | null
          service_ofsted_number?: string | null
          service_ofsted_registered?: string | null
          service_type?: string | null
          smoker?: string | null
          status?: string
          title?: string | null
          training_courses?: Json | null
          updated_at?: string
          use_additional_premises?: string | null
          user_id?: string | null
          work_with_cochildminders?: string | null
          work_with_others?: string | null
        }
        Relationships: []
      }
      cochildminder_applications: {
        Row: {
          address_history: Json | null
          application_id: string | null
          birth_town: string | null
          cochildminder_id: string
          consent_checks: boolean | null
          created_at: string | null
          criminal_history: string | null
          criminal_history_details: string | null
          current_address: Json | null
          date_of_birth: string | null
          dbs_number: string | null
          dbs_update_service: string | null
          declaration_notify: boolean | null
          declaration_truth: boolean | null
          disqualified: string | null
          employee_id: string | null
          employment_gaps: string | null
          employment_history: Json | null
          eyfs_completed: string | null
          eyfs_date: string | null
          eyfs_provider: string | null
          first_aid_completed: string | null
          first_aid_date: string | null
          first_aid_provider: string | null
          first_name: string | null
          form_token: string
          has_dbs: string | null
          health_conditions: string | null
          health_conditions_details: string | null
          id: string
          last_name: string | null
          level_2_date: string | null
          level_2_provider: string | null
          level_2_qualification: string | null
          lived_outside_uk: string | null
          local_authority: string | null
          middle_names: string | null
          ni_number: string | null
          other_qualifications: string | null
          outside_uk_details: string | null
          pfa_completed: string | null
          premises_address: Json | null
          premises_type: string | null
          previous_names: Json | null
          previous_registration: string | null
          previous_registration_details: Json | null
          reference_1_childcare: boolean | null
          reference_1_email: string | null
          reference_1_name: string | null
          reference_1_phone: string | null
          reference_1_relationship: string | null
          reference_2_childcare: boolean | null
          reference_2_email: string | null
          reference_2_name: string | null
          reference_2_phone: string | null
          reference_2_relationship: string | null
          safeguarding_completed: string | null
          safeguarding_date: string | null
          safeguarding_provider: string | null
          service_age_groups: Json | null
          service_hours: Json | null
          sex: string | null
          signature_date: string | null
          signature_name: string | null
          smoker: string | null
          social_services: string | null
          social_services_details: string | null
          status: string | null
          submitted_at: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          address_history?: Json | null
          application_id?: string | null
          birth_town?: string | null
          cochildminder_id: string
          consent_checks?: boolean | null
          created_at?: string | null
          criminal_history?: string | null
          criminal_history_details?: string | null
          current_address?: Json | null
          date_of_birth?: string | null
          dbs_number?: string | null
          dbs_update_service?: string | null
          declaration_notify?: boolean | null
          declaration_truth?: boolean | null
          disqualified?: string | null
          employee_id?: string | null
          employment_gaps?: string | null
          employment_history?: Json | null
          eyfs_completed?: string | null
          eyfs_date?: string | null
          eyfs_provider?: string | null
          first_aid_completed?: string | null
          first_aid_date?: string | null
          first_aid_provider?: string | null
          first_name?: string | null
          form_token: string
          has_dbs?: string | null
          health_conditions?: string | null
          health_conditions_details?: string | null
          id?: string
          last_name?: string | null
          level_2_date?: string | null
          level_2_provider?: string | null
          level_2_qualification?: string | null
          lived_outside_uk?: string | null
          local_authority?: string | null
          middle_names?: string | null
          ni_number?: string | null
          other_qualifications?: string | null
          outside_uk_details?: string | null
          pfa_completed?: string | null
          premises_address?: Json | null
          premises_type?: string | null
          previous_names?: Json | null
          previous_registration?: string | null
          previous_registration_details?: Json | null
          reference_1_childcare?: boolean | null
          reference_1_email?: string | null
          reference_1_name?: string | null
          reference_1_phone?: string | null
          reference_1_relationship?: string | null
          reference_2_childcare?: boolean | null
          reference_2_email?: string | null
          reference_2_name?: string | null
          reference_2_phone?: string | null
          reference_2_relationship?: string | null
          safeguarding_completed?: string | null
          safeguarding_date?: string | null
          safeguarding_provider?: string | null
          service_age_groups?: Json | null
          service_hours?: Json | null
          sex?: string | null
          signature_date?: string | null
          signature_name?: string | null
          smoker?: string | null
          social_services?: string | null
          social_services_details?: string | null
          status?: string | null
          submitted_at?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          address_history?: Json | null
          application_id?: string | null
          birth_town?: string | null
          cochildminder_id?: string
          consent_checks?: boolean | null
          created_at?: string | null
          criminal_history?: string | null
          criminal_history_details?: string | null
          current_address?: Json | null
          date_of_birth?: string | null
          dbs_number?: string | null
          dbs_update_service?: string | null
          declaration_notify?: boolean | null
          declaration_truth?: boolean | null
          disqualified?: string | null
          employee_id?: string | null
          employment_gaps?: string | null
          employment_history?: Json | null
          eyfs_completed?: string | null
          eyfs_date?: string | null
          eyfs_provider?: string | null
          first_aid_completed?: string | null
          first_aid_date?: string | null
          first_aid_provider?: string | null
          first_name?: string | null
          form_token?: string
          has_dbs?: string | null
          health_conditions?: string | null
          health_conditions_details?: string | null
          id?: string
          last_name?: string | null
          level_2_date?: string | null
          level_2_provider?: string | null
          level_2_qualification?: string | null
          lived_outside_uk?: string | null
          local_authority?: string | null
          middle_names?: string | null
          ni_number?: string | null
          other_qualifications?: string | null
          outside_uk_details?: string | null
          pfa_completed?: string | null
          premises_address?: Json | null
          premises_type?: string | null
          previous_names?: Json | null
          previous_registration?: string | null
          previous_registration_details?: Json | null
          reference_1_childcare?: boolean | null
          reference_1_email?: string | null
          reference_1_name?: string | null
          reference_1_phone?: string | null
          reference_1_relationship?: string | null
          reference_2_childcare?: boolean | null
          reference_2_email?: string | null
          reference_2_name?: string | null
          reference_2_phone?: string | null
          reference_2_relationship?: string | null
          safeguarding_completed?: string | null
          safeguarding_date?: string | null
          safeguarding_provider?: string | null
          service_age_groups?: Json | null
          service_hours?: Json | null
          sex?: string | null
          signature_date?: string | null
          signature_name?: string | null
          smoker?: string | null
          social_services?: string | null
          social_services_details?: string | null
          status?: string | null
          submitted_at?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cochildminder_applications_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "childminder_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cochildminder_applications_cochildminder_id_fkey"
            columns: ["cochildminder_id"]
            isOneToOne: false
            referencedRelation: "compliance_cochildminders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cochildminder_applications_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_assistant_forms: {
        Row: {
          address_history: Json | null
          application_id: string | null
          assistant_id: string
          birth_town: string | null
          consent_checks: boolean | null
          created_at: string | null
          criminal_history: string | null
          criminal_history_details: string | null
          current_address: Json | null
          date_of_birth: string | null
          dbs_number: string | null
          dbs_update_service: string | null
          declaration_notify: boolean | null
          declaration_truth: boolean | null
          disqualified: string | null
          employee_id: string | null
          employment_gaps: string | null
          employment_history: Json | null
          first_name: string | null
          form_token: string
          has_dbs: string | null
          health_conditions: string | null
          health_conditions_details: string | null
          id: string
          last_name: string | null
          lived_outside_uk: string | null
          middle_names: string | null
          ni_number: string | null
          pfa_completed: string | null
          previous_names: Json | null
          previous_registration: string | null
          previous_registration_details: Json | null
          safeguarding_completed: string | null
          sex: string | null
          signature_date: string | null
          signature_name: string | null
          smoker: string | null
          social_services: string | null
          social_services_details: string | null
          status: string | null
          submitted_at: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          address_history?: Json | null
          application_id?: string | null
          assistant_id: string
          birth_town?: string | null
          consent_checks?: boolean | null
          created_at?: string | null
          criminal_history?: string | null
          criminal_history_details?: string | null
          current_address?: Json | null
          date_of_birth?: string | null
          dbs_number?: string | null
          dbs_update_service?: string | null
          declaration_notify?: boolean | null
          declaration_truth?: boolean | null
          disqualified?: string | null
          employee_id?: string | null
          employment_gaps?: string | null
          employment_history?: Json | null
          first_name?: string | null
          form_token: string
          has_dbs?: string | null
          health_conditions?: string | null
          health_conditions_details?: string | null
          id?: string
          last_name?: string | null
          lived_outside_uk?: string | null
          middle_names?: string | null
          ni_number?: string | null
          pfa_completed?: string | null
          previous_names?: Json | null
          previous_registration?: string | null
          previous_registration_details?: Json | null
          safeguarding_completed?: string | null
          sex?: string | null
          signature_date?: string | null
          signature_name?: string | null
          smoker?: string | null
          social_services?: string | null
          social_services_details?: string | null
          status?: string | null
          submitted_at?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          address_history?: Json | null
          application_id?: string | null
          assistant_id?: string
          birth_town?: string | null
          consent_checks?: boolean | null
          created_at?: string | null
          criminal_history?: string | null
          criminal_history_details?: string | null
          current_address?: Json | null
          date_of_birth?: string | null
          dbs_number?: string | null
          dbs_update_service?: string | null
          declaration_notify?: boolean | null
          declaration_truth?: boolean | null
          disqualified?: string | null
          employee_id?: string | null
          employment_gaps?: string | null
          employment_history?: Json | null
          first_name?: string | null
          form_token?: string
          has_dbs?: string | null
          health_conditions?: string | null
          health_conditions_details?: string | null
          id?: string
          last_name?: string | null
          lived_outside_uk?: string | null
          middle_names?: string | null
          ni_number?: string | null
          pfa_completed?: string | null
          previous_names?: Json | null
          previous_registration?: string | null
          previous_registration_details?: Json | null
          safeguarding_completed?: string | null
          sex?: string | null
          signature_date?: string | null
          signature_name?: string | null
          smoker?: string | null
          social_services?: string | null
          social_services_details?: string | null
          status?: string | null
          submitted_at?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_assistant_forms_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "childminder_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_assistant_forms_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "compliance_assistants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_assistant_forms_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_assistants: {
        Row: {
          application_id: string | null
          compliance_status: string | null
          created_at: string | null
          date_of_birth: string
          dbs_certificate_date: string | null
          dbs_certificate_expiry_date: string | null
          dbs_certificate_number: string | null
          dbs_request_date: string | null
          dbs_status: Database["public"]["Enums"]["dbs_status"] | null
          email: string | null
          employee_id: string | null
          expiry_reminder_sent: boolean | null
          first_name: string
          follow_up_due_date: string | null
          form_sent_date: string | null
          form_status: string | null
          form_submitted_date: string | null
          form_token: string | null
          id: string
          last_contact_date: string | null
          last_name: string
          last_reminder_date: string | null
          notes: string | null
          phone: string | null
          reminder_count: number | null
          reminder_history: Json | null
          risk_level: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          application_id?: string | null
          compliance_status?: string | null
          created_at?: string | null
          date_of_birth: string
          dbs_certificate_date?: string | null
          dbs_certificate_expiry_date?: string | null
          dbs_certificate_number?: string | null
          dbs_request_date?: string | null
          dbs_status?: Database["public"]["Enums"]["dbs_status"] | null
          email?: string | null
          employee_id?: string | null
          expiry_reminder_sent?: boolean | null
          first_name: string
          follow_up_due_date?: string | null
          form_sent_date?: string | null
          form_status?: string | null
          form_submitted_date?: string | null
          form_token?: string | null
          id?: string
          last_contact_date?: string | null
          last_name: string
          last_reminder_date?: string | null
          notes?: string | null
          phone?: string | null
          reminder_count?: number | null
          reminder_history?: Json | null
          risk_level?: string | null
          role: string
          updated_at?: string | null
        }
        Update: {
          application_id?: string | null
          compliance_status?: string | null
          created_at?: string | null
          date_of_birth?: string
          dbs_certificate_date?: string | null
          dbs_certificate_expiry_date?: string | null
          dbs_certificate_number?: string | null
          dbs_request_date?: string | null
          dbs_status?: Database["public"]["Enums"]["dbs_status"] | null
          email?: string | null
          employee_id?: string | null
          expiry_reminder_sent?: boolean | null
          first_name?: string
          follow_up_due_date?: string | null
          form_sent_date?: string | null
          form_status?: string | null
          form_submitted_date?: string | null
          form_token?: string | null
          id?: string
          last_contact_date?: string | null
          last_name?: string
          last_reminder_date?: string | null
          notes?: string | null
          phone?: string | null
          reminder_count?: number | null
          reminder_history?: Json | null
          risk_level?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_assistants_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "childminder_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_assistants_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_cochildminders: {
        Row: {
          application_id: string | null
          compliance_status: string | null
          created_at: string | null
          date_of_birth: string
          dbs_certificate_date: string | null
          dbs_certificate_expiry_date: string | null
          dbs_certificate_number: string | null
          dbs_request_date: string | null
          dbs_status: Database["public"]["Enums"]["dbs_status"] | null
          email: string | null
          employee_id: string | null
          expiry_reminder_sent: boolean | null
          first_name: string
          follow_up_due_date: string | null
          form_sent_date: string | null
          form_status: string | null
          form_submitted_date: string | null
          form_token: string | null
          id: string
          last_contact_date: string | null
          last_name: string
          last_reminder_date: string | null
          notes: string | null
          phone: string | null
          reminder_count: number | null
          reminder_history: Json | null
          risk_level: string | null
          updated_at: string | null
        }
        Insert: {
          application_id?: string | null
          compliance_status?: string | null
          created_at?: string | null
          date_of_birth: string
          dbs_certificate_date?: string | null
          dbs_certificate_expiry_date?: string | null
          dbs_certificate_number?: string | null
          dbs_request_date?: string | null
          dbs_status?: Database["public"]["Enums"]["dbs_status"] | null
          email?: string | null
          employee_id?: string | null
          expiry_reminder_sent?: boolean | null
          first_name: string
          follow_up_due_date?: string | null
          form_sent_date?: string | null
          form_status?: string | null
          form_submitted_date?: string | null
          form_token?: string | null
          id?: string
          last_contact_date?: string | null
          last_name: string
          last_reminder_date?: string | null
          notes?: string | null
          phone?: string | null
          reminder_count?: number | null
          reminder_history?: Json | null
          risk_level?: string | null
          updated_at?: string | null
        }
        Update: {
          application_id?: string | null
          compliance_status?: string | null
          created_at?: string | null
          date_of_birth?: string
          dbs_certificate_date?: string | null
          dbs_certificate_expiry_date?: string | null
          dbs_certificate_number?: string | null
          dbs_request_date?: string | null
          dbs_status?: Database["public"]["Enums"]["dbs_status"] | null
          email?: string | null
          employee_id?: string | null
          expiry_reminder_sent?: boolean | null
          first_name?: string
          follow_up_due_date?: string | null
          form_sent_date?: string | null
          form_status?: string | null
          form_submitted_date?: string | null
          form_token?: string | null
          id?: string
          last_contact_date?: string | null
          last_name?: string
          last_reminder_date?: string | null
          notes?: string | null
          phone?: string | null
          reminder_count?: number | null
          reminder_history?: Json | null
          risk_level?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_cochildminders_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "childminder_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_cochildminders_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_household_forms: {
        Row: {
          address_history: Json | null
          application_id: string | null
          birth_town: string | null
          consent_checks: boolean | null
          created_at: string | null
          criminal_history: string | null
          criminal_history_details: string | null
          current_address: Json | null
          date_of_birth: string | null
          dbs_number: string | null
          dbs_update_service: string | null
          declaration_notify: boolean | null
          declaration_truth: boolean | null
          disqualified: string | null
          employee_id: string | null
          first_name: string | null
          form_token: string
          has_dbs: string | null
          health_conditions: string | null
          health_conditions_details: string | null
          id: string
          last_name: string | null
          lived_outside_uk: string | null
          member_id: string
          middle_names: string | null
          ni_number: string | null
          outside_uk_details: string | null
          previous_names: Json | null
          previous_registration: string | null
          previous_registration_details: Json | null
          sex: string | null
          signature_date: string | null
          signature_name: string | null
          smoker: string | null
          social_services: string | null
          social_services_details: string | null
          status: string | null
          submitted_at: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          address_history?: Json | null
          application_id?: string | null
          birth_town?: string | null
          consent_checks?: boolean | null
          created_at?: string | null
          criminal_history?: string | null
          criminal_history_details?: string | null
          current_address?: Json | null
          date_of_birth?: string | null
          dbs_number?: string | null
          dbs_update_service?: string | null
          declaration_notify?: boolean | null
          declaration_truth?: boolean | null
          disqualified?: string | null
          employee_id?: string | null
          first_name?: string | null
          form_token: string
          has_dbs?: string | null
          health_conditions?: string | null
          health_conditions_details?: string | null
          id?: string
          last_name?: string | null
          lived_outside_uk?: string | null
          member_id: string
          middle_names?: string | null
          ni_number?: string | null
          outside_uk_details?: string | null
          previous_names?: Json | null
          previous_registration?: string | null
          previous_registration_details?: Json | null
          sex?: string | null
          signature_date?: string | null
          signature_name?: string | null
          smoker?: string | null
          social_services?: string | null
          social_services_details?: string | null
          status?: string | null
          submitted_at?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          address_history?: Json | null
          application_id?: string | null
          birth_town?: string | null
          consent_checks?: boolean | null
          created_at?: string | null
          criminal_history?: string | null
          criminal_history_details?: string | null
          current_address?: Json | null
          date_of_birth?: string | null
          dbs_number?: string | null
          dbs_update_service?: string | null
          declaration_notify?: boolean | null
          declaration_truth?: boolean | null
          disqualified?: string | null
          employee_id?: string | null
          first_name?: string | null
          form_token?: string
          has_dbs?: string | null
          health_conditions?: string | null
          health_conditions_details?: string | null
          id?: string
          last_name?: string | null
          lived_outside_uk?: string | null
          member_id?: string
          middle_names?: string | null
          ni_number?: string | null
          outside_uk_details?: string | null
          previous_names?: Json | null
          previous_registration?: string | null
          previous_registration_details?: Json | null
          sex?: string | null
          signature_date?: string | null
          signature_name?: string | null
          smoker?: string | null
          social_services?: string | null
          social_services_details?: string | null
          status?: string | null
          submitted_at?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_household_forms_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "childminder_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_household_forms_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_household_forms_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "compliance_household_members"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_household_members: {
        Row: {
          age_group_changed_at: string | null
          application_id: string | null
          application_reference: string | null
          application_submitted: boolean | null
          compliance_status: string | null
          created_at: string | null
          date_of_birth: string
          dbs_certificate_date: string | null
          dbs_certificate_expiry_date: string | null
          dbs_certificate_number: string | null
          dbs_request_date: string | null
          dbs_status: Database["public"]["Enums"]["dbs_status"] | null
          email: string | null
          employee_id: string | null
          expiry_reminder_sent: boolean | null
          follow_up_due_date: string | null
          form_token: string | null
          full_name: string
          id: string
          last_contact_date: string | null
          last_reminder_date: string | null
          member_type: Database["public"]["Enums"]["member_type"]
          notes: string | null
          relationship: string | null
          reminder_count: number | null
          reminder_history: Json | null
          response_date: string | null
          response_received: boolean | null
          risk_level: string | null
          turning_16_notification_sent: boolean | null
          updated_at: string | null
        }
        Insert: {
          age_group_changed_at?: string | null
          application_id?: string | null
          application_reference?: string | null
          application_submitted?: boolean | null
          compliance_status?: string | null
          created_at?: string | null
          date_of_birth: string
          dbs_certificate_date?: string | null
          dbs_certificate_expiry_date?: string | null
          dbs_certificate_number?: string | null
          dbs_request_date?: string | null
          dbs_status?: Database["public"]["Enums"]["dbs_status"] | null
          email?: string | null
          employee_id?: string | null
          expiry_reminder_sent?: boolean | null
          follow_up_due_date?: string | null
          form_token?: string | null
          full_name: string
          id?: string
          last_contact_date?: string | null
          last_reminder_date?: string | null
          member_type: Database["public"]["Enums"]["member_type"]
          notes?: string | null
          relationship?: string | null
          reminder_count?: number | null
          reminder_history?: Json | null
          response_date?: string | null
          response_received?: boolean | null
          risk_level?: string | null
          turning_16_notification_sent?: boolean | null
          updated_at?: string | null
        }
        Update: {
          age_group_changed_at?: string | null
          application_id?: string | null
          application_reference?: string | null
          application_submitted?: boolean | null
          compliance_status?: string | null
          created_at?: string | null
          date_of_birth?: string
          dbs_certificate_date?: string | null
          dbs_certificate_expiry_date?: string | null
          dbs_certificate_number?: string | null
          dbs_request_date?: string | null
          dbs_status?: Database["public"]["Enums"]["dbs_status"] | null
          email?: string | null
          employee_id?: string | null
          expiry_reminder_sent?: boolean | null
          follow_up_due_date?: string | null
          form_token?: string | null
          full_name?: string
          id?: string
          last_contact_date?: string | null
          last_reminder_date?: string | null
          member_type?: Database["public"]["Enums"]["member_type"]
          notes?: string | null
          relationship?: string | null
          reminder_count?: number | null
          reminder_history?: Json | null
          response_date?: string | null
          response_received?: boolean | null
          risk_level?: string | null
          turning_16_notification_sent?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_household_members_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "childminder_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_household_members_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          address_history: Json | null
          address_line_1: string | null
          address_line_2: string | null
          age_groups_cared_for: Json | null
          applicant_references: Json | null
          application_id: string | null
          compliance_status: string | null
          county: string | null
          created_at: string | null
          date_of_birth: string | null
          dbs_certificate_date: string | null
          dbs_certificate_expiry_date: string | null
          dbs_certificate_number: string | null
          dbs_request_date: string | null
          dbs_status: Database["public"]["Enums"]["dbs_status"] | null
          email: string
          employment_start_date: string | null
          employment_status:
            | Database["public"]["Enums"]["employment_status"]
            | null
          expiry_reminder_sent: boolean | null
          eyfs_completion_date: string | null
          eyfs_training: string | null
          first_aid_expiry_date: string | null
          first_aid_qualification: string | null
          first_name: string
          follow_up_due_date: string | null
          id: string
          last_contact_date: string | null
          last_name: string
          last_reminder_date: string | null
          level_2_completion_date: string | null
          level_2_qualification: string | null
          local_authority: string | null
          local_authority_other: string | null
          max_capacity: number | null
          ni_number: string | null
          phone: string | null
          position: string | null
          postcode: string | null
          premises_postcode: string | null
          premises_type: string | null
          reminder_count: number | null
          reminder_history: Json | null
          risk_level: string | null
          safeguarding_completion_date: string | null
          safeguarding_training: string | null
          service_type: string | null
          town_city: string | null
          updated_at: string | null
        }
        Insert: {
          address_history?: Json | null
          address_line_1?: string | null
          address_line_2?: string | null
          age_groups_cared_for?: Json | null
          applicant_references?: Json | null
          application_id?: string | null
          compliance_status?: string | null
          county?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          dbs_certificate_date?: string | null
          dbs_certificate_expiry_date?: string | null
          dbs_certificate_number?: string | null
          dbs_request_date?: string | null
          dbs_status?: Database["public"]["Enums"]["dbs_status"] | null
          email: string
          employment_start_date?: string | null
          employment_status?:
            | Database["public"]["Enums"]["employment_status"]
            | null
          expiry_reminder_sent?: boolean | null
          eyfs_completion_date?: string | null
          eyfs_training?: string | null
          first_aid_expiry_date?: string | null
          first_aid_qualification?: string | null
          first_name: string
          follow_up_due_date?: string | null
          id?: string
          last_contact_date?: string | null
          last_name: string
          last_reminder_date?: string | null
          level_2_completion_date?: string | null
          level_2_qualification?: string | null
          local_authority?: string | null
          local_authority_other?: string | null
          max_capacity?: number | null
          ni_number?: string | null
          phone?: string | null
          position?: string | null
          postcode?: string | null
          premises_postcode?: string | null
          premises_type?: string | null
          reminder_count?: number | null
          reminder_history?: Json | null
          risk_level?: string | null
          safeguarding_completion_date?: string | null
          safeguarding_training?: string | null
          service_type?: string | null
          town_city?: string | null
          updated_at?: string | null
        }
        Update: {
          address_history?: Json | null
          address_line_1?: string | null
          address_line_2?: string | null
          age_groups_cared_for?: Json | null
          applicant_references?: Json | null
          application_id?: string | null
          compliance_status?: string | null
          county?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          dbs_certificate_date?: string | null
          dbs_certificate_expiry_date?: string | null
          dbs_certificate_number?: string | null
          dbs_request_date?: string | null
          dbs_status?: Database["public"]["Enums"]["dbs_status"] | null
          email?: string
          employment_start_date?: string | null
          employment_status?:
            | Database["public"]["Enums"]["employment_status"]
            | null
          expiry_reminder_sent?: boolean | null
          eyfs_completion_date?: string | null
          eyfs_training?: string | null
          first_aid_expiry_date?: string | null
          first_aid_qualification?: string | null
          first_name?: string
          follow_up_due_date?: string | null
          id?: string
          last_contact_date?: string | null
          last_name?: string
          last_reminder_date?: string | null
          level_2_completion_date?: string | null
          level_2_qualification?: string | null
          local_authority?: string | null
          local_authority_other?: string | null
          max_capacity?: number | null
          ni_number?: string | null
          phone?: string | null
          position?: string | null
          postcode?: string | null
          premises_postcode?: string | null
          premises_type?: string | null
          reminder_count?: number | null
          reminder_history?: Json | null
          risk_level?: string | null
          safeguarding_completion_date?: string | null
          safeguarding_training?: string | null
          service_type?: string | null
          town_city?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "childminder_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      la_form_submissions: {
        Row: {
          applicant_name: string
          application_id: string | null
          completed_at: string | null
          created_at: string | null
          date_of_birth: string | null
          employee_id: string | null
          form_token: string
          id: string
          la_email: string
          local_authority: string
          reference_id: string
          request_data: Json | null
          requester_name: string
          requester_role: string
          response_data: Json | null
          role: string
          sent_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          applicant_name: string
          application_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          employee_id?: string | null
          form_token: string
          id?: string
          la_email: string
          local_authority: string
          reference_id: string
          request_data?: Json | null
          requester_name: string
          requester_role: string
          response_data?: Json | null
          role: string
          sent_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          applicant_name?: string
          application_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          employee_id?: string | null
          form_token?: string
          id?: string
          la_email?: string
          local_authority?: string
          reference_id?: string
          request_data?: Json | null
          requester_name?: string
          requester_role?: string
          response_data?: Json | null
          role?: string
          sent_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "la_form_submissions_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "childminder_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "la_form_submissions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      ofsted_form_submissions: {
        Row: {
          applicant_name: string
          application_id: string | null
          completed_at: string | null
          created_at: string | null
          date_of_birth: string | null
          employee_id: string | null
          form_token: string
          id: string
          ofsted_email: string
          reference_id: string
          request_data: Json | null
          requester_name: string
          requester_role: string
          require_child_info: boolean | null
          response_data: Json | null
          role: string
          sent_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          applicant_name: string
          application_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          employee_id?: string | null
          form_token: string
          id?: string
          ofsted_email: string
          reference_id: string
          request_data?: Json | null
          requester_name: string
          requester_role: string
          require_child_info?: boolean | null
          response_data?: Json | null
          role: string
          sent_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          applicant_name?: string
          application_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          employee_id?: string | null
          form_token?: string
          id?: string
          ofsted_email?: string
          reference_id?: string
          request_data?: Json | null
          requester_name?: string
          requester_role?: string
          require_child_info?: boolean | null
          response_data?: Json | null
          role?: string
          sent_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ofsted_form_submissions_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "childminder_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ofsted_form_submissions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      reference_requests: {
        Row: {
          application_id: string | null
          created_at: string | null
          employee_id: string | null
          form_token: string | null
          id: string
          is_childcare_reference: boolean | null
          last_reminder_date: string | null
          referee_contact: string
          referee_email: string | null
          referee_name: string
          referee_relationship: string | null
          reference_number: number
          reminder_count: number | null
          request_sent_date: string | null
          request_status: string | null
          response_data: Json | null
          response_received_date: string | null
          updated_at: string | null
        }
        Insert: {
          application_id?: string | null
          created_at?: string | null
          employee_id?: string | null
          form_token?: string | null
          id?: string
          is_childcare_reference?: boolean | null
          last_reminder_date?: string | null
          referee_contact: string
          referee_email?: string | null
          referee_name: string
          referee_relationship?: string | null
          reference_number: number
          reminder_count?: number | null
          request_sent_date?: string | null
          request_status?: string | null
          response_data?: Json | null
          response_received_date?: string | null
          updated_at?: string | null
        }
        Update: {
          application_id?: string | null
          created_at?: string | null
          employee_id?: string | null
          form_token?: string | null
          id?: string
          is_childcare_reference?: boolean | null
          last_reminder_date?: string | null
          referee_contact?: string
          referee_email?: string | null
          referee_name?: string
          referee_relationship?: string | null
          reference_number?: number
          reminder_count?: number | null
          request_sent_date?: string | null
          request_status?: string | null
          response_data?: Json | null
          response_received_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reference_requests_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "childminder_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reference_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      cron_job_status: {
        Row: {
          active: boolean | null
          command: string | null
          database: string | null
          jobid: number | null
          jobname: string | null
          nodename: string | null
          nodeport: number | null
          schedule: string | null
          username: string | null
        }
        Insert: {
          active?: boolean | null
          command?: string | null
          database?: string | null
          jobid?: number | null
          jobname?: string | null
          nodename?: string | null
          nodeport?: number | null
          schedule?: string | null
          username?: string | null
        }
        Update: {
          active?: boolean | null
          command?: string | null
          database?: string | null
          jobid?: number | null
          jobname?: string | null
          nodename?: string | null
          nodeport?: number | null
          schedule?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_age: { Args: { dob: string }; Returns: number }
      days_until_16th_birthday: { Args: { dob: string }; Returns: number }
      get_applicant_children_turning_16_soon: {
        Args: { days_ahead?: number }
        Returns: {
          application_id: string
          current_age: number
          date_of_birth: string
          days_until_16: number
          dbs_status: string
          email: string
          full_name: string
          id: string
          relationship: string
          turning_16_notification_sent: boolean
          turns_16_on: string
        }[]
      }
      get_children_turning_16_soon: {
        Args: { days_ahead?: number }
        Returns: {
          application_id: string
          current_age: number
          date_of_birth: string
          days_until_16: number
          dbs_status: string
          email: string
          employee_id: string
          full_name: string
          id: string
          relationship: string
          source_type: string
          turning_16_notification_sent: boolean
          turns_16_on: string
        }[]
      }
      get_expiring_dbs_certificates: {
        Args: { days_ahead?: number }
        Returns: {
          certificate_date: string
          certificate_number: string
          days_until_expiry: number
          email: string
          expiry_date: string
          member_id: string
          member_name: string
          member_type: string
          source_table: string
        }[]
      }
      get_members_approaching_16: {
        Args: { days_ahead?: number }
        Returns: {
          application_id: string
          date_of_birth: string
          days_until_16: number
          full_name: string
          id: string
          relationship: string
          turning_16_notification_sent: boolean
        }[]
      }
      get_overdue_dbs_requests: {
        Args: never
        Returns: {
          days_overdue: number
          email: string
          last_reminder_date: string
          member_id: string
          member_name: string
          member_type: string
          reminder_count: number
          source_table: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      update_all_children_now_adults: { Args: never; Returns: number }
    }
    Enums: {
      app_role: "admin" | "user"
      dbs_status: "not_requested" | "requested" | "received" | "expired"
      employment_status: "active" | "on_leave" | "terminated"
      member_type: "adult" | "child"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      dbs_status: ["not_requested", "requested", "received", "expired"],
      employment_status: ["active", "on_leave", "terminated"],
      member_type: ["adult", "child"],
    },
  },
} as const
