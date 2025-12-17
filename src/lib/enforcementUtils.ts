export const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export const formatShortDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const addDays = (date: Date | string, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addWorkingDays = (date: Date | string, days: number): Date => {
  let result = new Date(date);
  let count = 0;
  while (count < days) {
    result.setDate(result.getDate() + 1);
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      count++;
    }
  }
  return result;
};

export const generateReferenceNumber = (
  type: 'SUS' | 'WRN' | 'CANC-INT' | 'DEC-CANC' | 'SUS-LIFT' | 'SUS-EXT',
  providerId: string
): string => {
  return `${type}/${providerId}/${new Date().getFullYear()}`;
};

export const getSupervisorName = (supervisorId: string): string => {
  const supervisors: Record<string, string> = {
    'sup1': 'Jane Director (Head of Safeguarding)',
    'sup2': 'Robert Chief (Agency Manager)',
  };
  return supervisors[supervisorId] || 'Unknown Supervisor';
};

export const SUPERVISORS = [
  { id: 'sup1', name: 'Jane Director (Head of Safeguarding)' },
  { id: 'sup2', name: 'Robert Chief (Agency Manager)' },
];

export const RISK_CATEGORIES = [
  'Direct physical risk',
  'Safeguarding concern',
  'Environmental hazard',
  'Supervision inadequacy',
  'Health/hygiene risk',
  'Compliance / EYFS Failure'
];

export const CANCELLATION_GROUNDS = [
  { id: 'mandatory_dq', label: 'Mandatory: Disqualification', sub: 'Provider is disqualified from registration (e.g. conviction, order, etc.) under Section 76 Childcare Act 2006.' },
  { id: 'requirements', label: 'Requirements Not Met', sub: 'Prescribed requirements for registration are not satisfied (Reg 3(a)).' },
  { id: 'conditions', label: 'Breach of Conditions', sub: 'Failed to comply with a condition imposed on the registration (Reg 3(b)).' },
  { id: 'fees', label: 'Non-Payment of Fees', sub: 'Failed to pay a prescribed fee (Reg 3(d)).' },
  { id: 'suitability', label: 'Suitability Concerns', sub: 'Agency no longer considers the provider suitable.' },
];

export const NOTIFICATION_AGENCIES = [
  { id: 'LA', name: 'Local Authority', detail: 'Safeguarding Lead', email: 'daryelcare72@gmail.com', required: true },
  { id: 'HMRC', name: 'HMRC', detail: 'Tax-Free Childcare Team', email: 'daryelcare72@gmail.com', required: true },
  { id: 'DWP', name: 'Universal Credit (DWP)', detail: 'Verification Team', email: 'daryelcare72@gmail.com', required: true },
  { id: 'Ofsted', name: 'Ofsted', detail: 'Information Sharing', email: 'daryelcare72@gmail.com', required: true },
];

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'active': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'suspended': 'bg-rose-100 text-rose-800 border-rose-200',
    'cancellation_pending': 'bg-orange-100 text-orange-800 border-orange-200',
    'terminated': 'bg-slate-100 text-slate-800 border-slate-200',
    'pending': 'bg-amber-100 text-amber-800 border-amber-200',
    'in_effect': 'bg-rose-100 text-rose-800 border-rose-200',
    'representations_received': 'bg-blue-100 text-blue-800 border-blue-200',
    'decision_pending': 'bg-purple-100 text-purple-800 border-purple-200',
    'lifted': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'cancelled': 'bg-slate-100 text-slate-800 border-slate-200',
    'closed': 'bg-slate-100 text-slate-800 border-slate-200',
  };
  return colors[status] || 'bg-slate-100 text-slate-800 border-slate-200';
};

export const getRiskLevelColor = (level: string): string => {
  const colors: Record<string, string> = {
    'low': 'bg-emerald-100 text-emerald-800',
    'medium': 'bg-amber-100 text-amber-800',
    'high': 'bg-orange-100 text-orange-800',
    'critical': 'bg-rose-100 text-rose-800',
  };
  return colors[level] || 'bg-slate-100 text-slate-800';
};

export const getCaseTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    'suspension': 'bg-rose-600',
    'warning': 'bg-amber-600',
    'cancellation': 'bg-orange-600',
  };
  return colors[type] || 'bg-slate-600';
};
