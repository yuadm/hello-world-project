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
          work_with_others?: string | null
        }
        Relationships: []
      }
      employee_household_members: {
        Row: {
          age_group_changed_at: string | null
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
          employee_id: string
          expiry_reminder_sent: boolean | null
          follow_up_due_date: string | null
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
          employee_id: string
          expiry_reminder_sent?: boolean | null
          follow_up_due_date?: string | null
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
          employee_id?: string
          expiry_reminder_sent?: boolean | null
          follow_up_due_date?: string | null
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
            foreignKeyName: "employee_household_members_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          address_line_1: string | null
          address_line_2: string | null
          age_groups_cared_for: Json | null
          application_id: string | null
          county: string | null
          created_at: string | null
          date_of_birth: string | null
          dbs_certificate_date: string | null
          dbs_certificate_expiry_date: string | null
          dbs_certificate_number: string | null
          dbs_status: Database["public"]["Enums"]["dbs_status"] | null
          email: string
          employment_start_date: string | null
          employment_status:
            | Database["public"]["Enums"]["employment_status"]
            | null
          eyfs_completion_date: string | null
          eyfs_training: string | null
          first_aid_expiry_date: string | null
          first_aid_qualification: string | null
          first_name: string
          id: string
          last_name: string
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
          safeguarding_completion_date: string | null
          safeguarding_training: string | null
          service_type: string | null
          town_city: string | null
          updated_at: string | null
        }
        Insert: {
          address_line_1?: string | null
          address_line_2?: string | null
          age_groups_cared_for?: Json | null
          application_id?: string | null
          county?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          dbs_certificate_date?: string | null
          dbs_certificate_expiry_date?: string | null
          dbs_certificate_number?: string | null
          dbs_status?: Database["public"]["Enums"]["dbs_status"] | null
          email: string
          employment_start_date?: string | null
          employment_status?:
            | Database["public"]["Enums"]["employment_status"]
            | null
          eyfs_completion_date?: string | null
          eyfs_training?: string | null
          first_aid_expiry_date?: string | null
          first_aid_qualification?: string | null
          first_name: string
          id?: string
          last_name: string
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
          safeguarding_completion_date?: string | null
          safeguarding_training?: string | null
          service_type?: string | null
          town_city?: string | null
          updated_at?: string | null
        }
        Update: {
          address_line_1?: string | null
          address_line_2?: string | null
          age_groups_cared_for?: Json | null
          application_id?: string | null
          county?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          dbs_certificate_date?: string | null
          dbs_certificate_expiry_date?: string | null
          dbs_certificate_number?: string | null
          dbs_status?: Database["public"]["Enums"]["dbs_status"] | null
          email?: string
          employment_start_date?: string | null
          employment_status?:
            | Database["public"]["Enums"]["employment_status"]
            | null
          eyfs_completion_date?: string | null
          eyfs_training?: string | null
          first_aid_expiry_date?: string | null
          first_aid_qualification?: string | null
          first_name?: string
          id?: string
          last_name?: string
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
      household_member_dbs_tracking: {
        Row: {
          application_id: string
          application_reference: string | null
          application_submitted: boolean | null
          compliance_status: string | null
          created_at: string
          date_of_birth: string
          dbs_certificate_date: string | null
          dbs_certificate_expiry_date: string | null
          dbs_certificate_number: string | null
          dbs_request_date: string | null
          dbs_status: string
          email: string | null
          expiry_reminder_sent: boolean | null
          follow_up_due_date: string | null
          full_name: string
          id: string
          last_contact_date: string | null
          last_reminder_date: string | null
          member_type: string
          notes: string | null
          relationship: string | null
          reminder_count: number | null
          reminder_history: Json | null
          response_date: string | null
          response_received: boolean | null
          risk_level: string | null
          turning_16_notification_sent: boolean | null
          updated_at: string
        }
        Insert: {
          application_id: string
          application_reference?: string | null
          application_submitted?: boolean | null
          compliance_status?: string | null
          created_at?: string
          date_of_birth: string
          dbs_certificate_date?: string | null
          dbs_certificate_expiry_date?: string | null
          dbs_certificate_number?: string | null
          dbs_request_date?: string | null
          dbs_status?: string
          email?: string | null
          expiry_reminder_sent?: boolean | null
          follow_up_due_date?: string | null
          full_name: string
          id?: string
          last_contact_date?: string | null
          last_reminder_date?: string | null
          member_type: string
          notes?: string | null
          relationship?: string | null
          reminder_count?: number | null
          reminder_history?: Json | null
          response_date?: string | null
          response_received?: boolean | null
          risk_level?: string | null
          turning_16_notification_sent?: boolean | null
          updated_at?: string
        }
        Update: {
          application_id?: string
          application_reference?: string | null
          application_submitted?: boolean | null
          compliance_status?: string | null
          created_at?: string
          date_of_birth?: string
          dbs_certificate_date?: string | null
          dbs_certificate_expiry_date?: string | null
          dbs_certificate_number?: string | null
          dbs_request_date?: string | null
          dbs_status?: string
          email?: string | null
          expiry_reminder_sent?: boolean | null
          follow_up_due_date?: string | null
          full_name?: string
          id?: string
          last_contact_date?: string | null
          last_reminder_date?: string | null
          member_type?: string
          notes?: string | null
          relationship?: string | null
          reminder_count?: number | null
          reminder_history?: Json | null
          response_date?: string | null
          response_received?: boolean | null
          risk_level?: string | null
          turning_16_notification_sent?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_member_dbs_tracking_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "childminder_applications"
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
      dbs_compliance_metrics: {
        Row: {
          application_id: string | null
          at_risk_count: number | null
          compliant_count: number | null
          critical_risk_count: number | null
          expired_count: number | null
          expiring_soon_count: number | null
          high_risk_count: number | null
          medium_risk_count: number | null
          overdue_count: number | null
          pending_count: number | null
          total_members: number | null
          turning_16_soon_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "household_member_dbs_tracking_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "childminder_applications"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_age: { Args: { dob: string }; Returns: number }
      calculate_compliance_status: {
        Args: {
          member_row: Database["public"]["Tables"]["household_member_dbs_tracking"]["Row"]
        }
        Returns: {
          calculated_compliance_status: string
          calculated_risk_level: string
          days_overdue: number
        }[]
      }
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
          current_age: number
          date_of_birth: string
          days_until_16: number
          employee_id: string
          full_name: string
          id: string
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
