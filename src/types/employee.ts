export type EmploymentStatus = 'active' | 'on_leave' | 'terminated';
export type MemberType = 'adult' | 'child';
export type DBSStatus = 'not_requested' | 'requested' | 'received' | 'expired';

export interface Employee {
  id: string;
  application_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  ni_number: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  town_city: string | null;
  county: string | null;
  postcode: string | null;
  employment_status: EmploymentStatus;
  employment_start_date: string | null;
  position: string | null;
  local_authority: string | null;
  local_authority_other: string | null;
  premises_type: string | null;
  premises_postcode: string | null;
  age_groups_cared_for: any;
  max_capacity: number | null;
  service_type: string | null;
  first_aid_qualification: string | null;
  first_aid_expiry_date: string | null;
  safeguarding_training: string | null;
  safeguarding_completion_date: string | null;
  eyfs_training: string | null;
  eyfs_completion_date: string | null;
  level_2_qualification: string | null;
  level_2_completion_date: string | null;
  dbs_certificate_number: string | null;
  dbs_certificate_date: string | null;
  dbs_certificate_expiry_date: string | null;
  dbs_status: DBSStatus;
  created_at: string;
  updated_at: string;
}

export interface EmployeeHouseholdMember {
  id: string;
  employee_id: string;
  member_type: MemberType;
  full_name: string;
  date_of_birth: string;
  relationship: string | null;
  email: string | null;
  dbs_status: DBSStatus;
  dbs_certificate_number: string | null;
  dbs_certificate_date: string | null;
  dbs_certificate_expiry_date: string | null;
  age_group_changed_at: string | null;
  created_at: string;
  updated_at: string;
}
