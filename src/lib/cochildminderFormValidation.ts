import { CochildminderFormData } from "@/types/cochildminder";

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateCochildminderSection1(formData: CochildminderFormData): ValidationResult {
  const errors: Record<string, string> = {};

  if (!formData.title) errors.title = "Please select a title";
  if (!formData.firstName?.trim()) errors.firstName = "Please enter your first name";
  if (!formData.lastName?.trim()) errors.lastName = "Please enter your last name";
  if (!formData.dateOfBirth) errors.dateOfBirth = "Please enter your date of birth";
  if (!formData.birthTown?.trim()) errors.birthTown = "Please enter your town of birth";
  if (!formData.sex) errors.sex = "Please select your sex";
  if (!formData.niNumber?.trim()) errors.niNumber = "Please enter your National Insurance number";

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateCochildminderSection2(formData: CochildminderFormData): ValidationResult {
  const errors: Record<string, string> = {};

  if (!formData.currentAddress?.line1?.trim()) errors.currentAddressLine1 = "Please enter address line 1";
  if (!formData.currentAddress?.town?.trim()) errors.currentAddressTown = "Please enter town/city";
  if (!formData.currentAddress?.postcode?.trim()) errors.currentAddressPostcode = "Please enter postcode";
  if (!formData.currentAddress?.moveIn) errors.currentAddressMoveIn = "Please enter when you moved in";

  if (!formData.livedOutsideUK) errors.livedOutsideUK = "Please select an option";

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateCochildminderSection3(_formData: CochildminderFormData): ValidationResult {
  // Pre-filled section - no validation needed
  return { isValid: true, errors: {} };
}

export function validateCochildminderSection4(_formData: CochildminderFormData): ValidationResult {
  // Pre-filled section - no validation needed
  return { isValid: true, errors: {} };
}

export function validateCochildminderSection5(formData: CochildminderFormData): ValidationResult {
  const errors: Record<string, string> = {};

  if (!formData.hasDbs) errors.hasDbs = "Please select an option";
  if (formData.hasDbs === "Yes" && !formData.dbsNumber?.trim()) {
    errors.dbsNumber = "Please enter your DBS certificate number";
  }
  if (!formData.firstAidCompleted) errors.firstAidCompleted = "Please select an option";
  if (!formData.safeguardingCompleted) errors.safeguardingCompleted = "Please select an option";

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateCochildminderSection6(formData: CochildminderFormData): ValidationResult {
  const errors: Record<string, string> = {};

  if (!formData.reference1Name?.trim()) errors.reference1Name = "Please enter referee 1 name";
  if (!formData.reference1Email?.trim()) errors.reference1Email = "Please enter referee 1 email";
  if (!formData.reference1Relationship?.trim()) errors.reference1Relationship = "Please enter relationship";
  if (!formData.reference2Name?.trim()) errors.reference2Name = "Please enter referee 2 name";
  if (!formData.reference2Email?.trim()) errors.reference2Email = "Please enter referee 2 email";
  if (!formData.reference2Relationship?.trim()) errors.reference2Relationship = "Please enter relationship";

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateCochildminderSection7(formData: CochildminderFormData): ValidationResult {
  const errors: Record<string, string> = {};

  if (!formData.previousRegistration) errors.previousRegistration = "Please select an option";
  if (!formData.criminalHistory) errors.criminalHistory = "Please select an option";
  if (formData.criminalHistory === "Yes" && !formData.criminalHistoryDetails?.trim()) {
    errors.criminalHistoryDetails = "Please provide details";
  }
  if (!formData.disqualified) errors.disqualified = "Please select an option";
  if (!formData.socialServices) errors.socialServices = "Please select an option";
  if (formData.socialServices === "Yes" && !formData.socialServicesDetails?.trim()) {
    errors.socialServicesDetails = "Please provide details";
  }
  if (!formData.healthConditions) errors.healthConditions = "Please select an option";
  if (!formData.smoker) errors.smoker = "Please select an option";

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateCochildminderSection8(formData: CochildminderFormData): ValidationResult {
  const errors: Record<string, string> = {};

  if (!formData.consentChecks) errors.consentChecks = "You must consent to background checks";
  if (!formData.declarationTruth) errors.declarationTruth = "You must confirm the declaration";
  if (!formData.declarationNotify) errors.declarationNotify = "You must confirm you will notify of changes";
  if (!formData.signatureName?.trim()) errors.signatureName = "Please sign the form";
  if (!formData.signatureDate) errors.signatureDate = "Please enter the date";

  return { isValid: Object.keys(errors).length === 0, errors };
}
