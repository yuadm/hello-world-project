import { DBSStatus, EmploymentStatus } from "@/types/employee";

export function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

export function daysUntil16thBirthday(dob: string): number {
  const birthDate = new Date(dob);
  const sixteenthBirthday = new Date(
    birthDate.getFullYear() + 16,
    birthDate.getMonth(),
    birthDate.getDate()
  );
  const today = new Date();
  const diffTime = sixteenthBirthday.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

export function isTurning16Soon(dob: string, thresholdDays: number = 90): boolean {
  const days = daysUntil16thBirthday(dob);
  return days >= 0 && days <= thresholdDays;
}

export function formatMemberType(type: string): string {
  return type === 'adult' ? 'Adult (16+)' : 'Child (Under 16)';
}

export function getDBSStatusConfig(status: DBSStatus): { variant: "default" | "secondary" | "destructive"; label: string } {
  const variants: Record<DBSStatus, { variant: "default" | "secondary" | "destructive"; label: string }> = {
    not_requested: { variant: "secondary", label: "Not Requested" },
    requested: { variant: "secondary", label: "Requested" },
    received: { variant: "default", label: "Received" },
    expired: { variant: "destructive", label: "Expired" },
  };
  
  return variants[status] || variants.not_requested;
}

export function getEmploymentStatusConfig(status: EmploymentStatus): { variant: "default" | "secondary" | "destructive"; label: string } {
  const variants: Record<EmploymentStatus, { variant: "default" | "secondary" | "destructive"; label: string }> = {
    active: { variant: "default", label: "Active" },
    on_leave: { variant: "secondary", label: "On Leave" },
    terminated: { variant: "destructive", label: "Terminated" },
  };
  
  return variants[status] || variants.active;
}

export function get16thBirthdayDate(dob: string): Date {
  const birthDate = new Date(dob);
  return new Date(
    birthDate.getFullYear() + 16,
    birthDate.getMonth(),
    birthDate.getDate()
  );
}
