export type EnforcementCaseType = 'suspension' | 'warning' | 'cancellation';
export type EnforcementCaseStatus = 
  | 'pending' 
  | 'in_effect' 
  | 'representations_received' 
  | 'decision_pending' 
  | 'lifted' 
  | 'cancelled' 
  | 'closed';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type TimelineEventType = 'completed' | 'pending' | 'urgent';
export type NotificationStatus = 'pending' | 'sent' | 'failed';
export type NotificationAgency = 'LA' | 'HMRC' | 'DWP' | 'Ofsted';

export interface EnforcementCase {
  id: string;
  employee_id: string;
  type: EnforcementCaseType;
  status: EnforcementCaseStatus;
  risk_level: RiskLevel;
  concern: string | null;
  risk_detail: string | null;
  risk_categories: string[] | null;
  deadline: string | null;
  date_created: string;
  date_closed: string | null;
  supervisor_id: string | null;
  supervisor_name: string | null;
  form_data: SuspensionFormData | CancellationFormData | WarningFormData | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  employee_name?: string;
  employee_email?: string;
  employee_local_authority?: string;
  employee_service_type?: string;
}

export interface EnforcementTimeline {
  id: string;
  case_id: string;
  event: string;
  date: string;
  type: TimelineEventType;
  created_by: string | null;
  created_at: string;
}

export interface EnforcementNotification {
  id: string;
  case_id: string;
  agency: NotificationAgency;
  agency_name: string;
  agency_detail: string;
  agency_email: string;
  status: NotificationStatus;
  sent_at: string | null;
  sent_by: string | null;
  created_at: string;
}

export interface EnforcementNotice {
  id: string;
  case_id: string;
  notice_type: string;
  reference_number: string;
  generated_at: string;
  pdf_url: string | null;
}

// Form data types
export interface SuspensionFormData {
  concern: string;
  riskDetail: string;
  riskCategories: string[];
  reasonableness: 'no' | 'yes'; // 'no' = suspend, 'yes' = warning
  evidenceAttached: boolean;
  confirmBelief: boolean;
  confirmImmediate: boolean;
  confirmAppeal: boolean;
  confirmReview: boolean;
  confirmNotify: boolean;
  supervisor: string;
}

export interface WarningFormData extends SuspensionFormData {
  warningType: 'warning' | 'welfare';
  breachDetails: string;
  requiredActions: string;
  complianceDeadline: string;
  monitoringMethod: 'visit' | 'documentary';
  impactDetails?: string;
}

export interface CancellationFormData {
  grounds: string[];
  evidenceSummary: string;
  hasEvidence: boolean;
  repPeriod: string;
  confirmReps: boolean;
  confirmDelay: boolean;
  supervisor: string;
}

export interface SuspensionReviewFormData {
  investigationStatus: string;
  reviewOutcome: 'extend' | 'lift';
  extensionWeeks?: string;
  liftConditions?: string;
  supervisor: string;
}

export interface DecisionFormData {
  repsReceived: 'yes' | 'no';
  repsSummary?: string;
  repsOutcome?: 'rejected' | 'varied' | 'upheld';
  decision: 'cancel' | 'withdraw';
  supervisor: string;
  confirmReview: boolean;
}

// Address type for providers
export interface ProviderAddress {
  addressLine1?: string | null;
  addressLine2?: string | null;
  townCity?: string | null;
  county?: string | null;
  postcode?: string | null;
}

// Provider type for the portal
export interface EnforcementProvider {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'suspended' | 'cancellation_pending' | 'terminated';
  agencyId: string;
  la: string;
  email: string;
  address?: ProviderAddress;
}

// Stats for dashboard
export interface EnforcementStats {
  activeSuspensions: number;
  pendingDecisions: number;
  representationsReceived: number;
  appeals: number;
}
