import { ChildminderApplication } from "@/types/childminder";
import { calculateAddressHistoryCoverage } from "./addressHistoryCalculator";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate Section 1: Personal Details
 */
export function validateSection1(data: Partial<ChildminderApplication>): ValidationResult {
  const errors: string[] = [];

  if (!data.title) errors.push("Title is required");
  if (!data.firstName) errors.push("First name is required");
  if (!data.lastName) errors.push("Last name is required");
  if (!data.dob) errors.push("Date of birth is required");
  if (!data.gender) errors.push("Gender is required");
  if (!data.rightToWork) errors.push("Right to work status is required");
  if (!data.email) errors.push("Email is required");
  if (!data.phone) errors.push("Phone number is required");
  if (!data.niNumber) errors.push("National Insurance number is required");

  // Age validation
  if (data.dob) {
    const age = calculateAge(data.dob);
    if (age < 18) {
      errors.push("You must be at least 18 years old to apply");
    }
  }

  // Previous names validation
  if (data.otherNames === "Yes") {
    if (!data.previousNames || data.previousNames.length === 0) {
      errors.push("Please add at least one previous name");
    } else {
      data.previousNames.forEach((name, index) => {
        if (!name.fullName) {
          errors.push(`Previous name ${index + 1}: Full name is required`);
        }
        if (!name.dateFrom) {
          errors.push(`Previous name ${index + 1}: Date from is required`);
        }
        if (!name.dateTo) {
          errors.push(`Previous name ${index + 1}: Date to is required`);
        }
      });
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate Section 2: Address History
 */
export function validateSection2(data: Partial<ChildminderApplication>): ValidationResult {
  const errors: string[] = [];

  // Current address
  if (!data.homePostcode) errors.push("Home postcode is required");
  if (!data.homeAddress?.line1) errors.push("Home address line 1 is required");
  if (!data.homeAddress?.town) errors.push("Home town is required");
  if (!data.homeMoveIn) errors.push("Move-in date for current address is required");

  // Sanity check: home move-in date should not be in the future
  if (data.homeMoveIn && new Date(data.homeMoveIn) > new Date()) {
    errors.push("Move-in date for current address cannot be in the future");
  }

  // Address history coverage
  if (data.homeMoveIn) {
    const coverage = calculateAddressHistoryCoverage(
      { moveIn: data.homeMoveIn },
      data.addressHistory || []
    );
    
    const hasExplanation = !!data.addressGaps?.trim();

    if (coverage.hasGaps && !hasExplanation) {
      errors.push("Your address history has gaps. Please add previous addresses to cover them, or explain the gaps in the 'Explain any gaps' section.");
    }
  }

  // Validate each previous address
  if (data.addressHistory && data.addressHistory.length > 0) {
    const today = new Date();
    data.addressHistory.forEach((addr, index) => {
      if (!addr.address?.line1) errors.push(`Previous address ${index + 1}: Address line 1 is required`);
      if (!addr.address?.town) errors.push(`Previous address ${index + 1}: Town is required`);
      if (!addr.moveIn) errors.push(`Previous address ${index + 1}: Move-in date is required`);
      if (!addr.moveOut) errors.push(`Previous address ${index + 1}: Move-out date is required`);
      
      // Sanity checks for future dates
      if (addr.moveIn && new Date(addr.moveIn) > today) {
        errors.push(`Previous address ${index + 1}: Move-in date cannot be in the future`);
      }
      if (addr.moveOut && new Date(addr.moveOut) > today) {
        errors.push(`Previous address ${index + 1}: Move-out date cannot be in the future`);
      }
      
      // Validate date order
      if (addr.moveIn && addr.moveOut && new Date(addr.moveIn) >= new Date(addr.moveOut)) {
        errors.push(`Previous address ${index + 1}: Move-out date must be after move-in date`);
      }
    });
  }

  if (!data.livedOutsideUK) errors.push("Please indicate if you've lived outside the UK");
  if (!data.militaryBase) errors.push("Please indicate if you've lived on a military base");

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate Section 3: Premises
 */
export function validateSection3(data: Partial<ChildminderApplication>): ValidationResult {
  const errors: string[] = [];

  if (!data.localAuthority) errors.push("Local authority is required");
  if (!data.premisesType) errors.push("Premises type is required");
  
  if (data.sameAddress === "No") {
    if (!data.childcareAddress?.line1) errors.push("Childcare address line 1 is required");
    if (!data.childcareAddress?.town) errors.push("Childcare town is required");
    if (!data.childcareAddress?.postcode) errors.push("Childcare postcode is required");
  }

  if (data.useAdditionalPremises === "Yes") {
    if (!data.additionalPremises || data.additionalPremises.length === 0) {
      errors.push("Please add at least one additional premises");
    } else {
      data.additionalPremises.forEach((premises, index) => {
        if (!premises.address) errors.push(`Additional premises ${index + 1}: Address is required`);
        if (!premises.reason) errors.push(`Additional premises ${index + 1}: Reason is required`);
      });
    }
  }

  if (!data.outdoorSpace) errors.push("Please indicate if you have outdoor space");
  if (!data.pets) errors.push("Please indicate if you have pets");

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate Section 4: Service
 */
export function validateSection4(data: Partial<ChildminderApplication>): ValidationResult {
  const errors: string[] = [];

  if (!data.ageGroups || data.ageGroups.length === 0) {
    errors.push("Please select at least one age group");
  }

  if (!data.childcareTimes || data.childcareTimes.length === 0) {
    errors.push("Please select at least one childcare time");
  }

  if (!data.workWithOthers) errors.push("Please indicate if you'll work with others");
  if (!data.overnightCare) errors.push("Please indicate if you'll provide overnight care");

  // Validate assistants if working with others
  if (data.workWithOthers === "Yes" && data.numberOfAssistants && data.numberOfAssistants > 0) {
    if (!data.assistants || data.assistants.length === 0) {
      errors.push("Please add assistant details");
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate Section 5: Qualifications
 */
export function validateSection5(data: Partial<ChildminderApplication>): ValidationResult {
  const errors: string[] = [];
  const ageGroups = data.ageGroups || [];

  // First Aid - always required
  if (!data.firstAid?.completed) {
    errors.push("Please indicate if you have completed first aid training");
  } else if (data.firstAid.completed === "Yes") {
    if (!data.firstAid.provider) errors.push("First aid training provider is required");
    if (!data.firstAid.completionDate) errors.push("First aid completion date is required");
    
    // Check if expired (3+ years old)
    if (data.firstAid.completionDate) {
      const completionDate = new Date(data.firstAid.completionDate);
      const threeYearsAgo = new Date();
      threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
      if (completionDate < threeYearsAgo) {
        errors.push("Your first aid certificate is expired (more than 3 years old). Please renew it.");
      }
    }
  }

  // Safeguarding - required for 0-5 or 5-7
  if (ageGroups.includes("0-5") || ageGroups.includes("5-7")) {
    if (!data.safeguarding?.completed) {
      errors.push("Safeguarding training is required for your selected age groups");
    } else if (data.safeguarding.completed === "Yes") {
      if (!data.safeguarding.provider) errors.push("Safeguarding training provider is required");
      if (!data.safeguarding.completionDate) errors.push("Safeguarding completion date is required");
    }
  }

  // EYFS - required for 5-7
  if (ageGroups.includes("5-7")) {
    if (!data.eyfsChildminding?.completed) {
      errors.push("EYFS/Childminding course is required for age group 5-7");
    } else if (data.eyfsChildminding.completed === "Yes") {
      if (!data.eyfsChildminding.provider) errors.push("EYFS course provider is required");
      if (!data.eyfsChildminding.completionDate) errors.push("EYFS course completion date is required");
    }
  }

  // Level 2 - required for 8+
  if (ageGroups.includes("8+")) {
    if (!data.level2Qual?.completed) {
      errors.push("Level 2 qualification is required for age group 8+");
    } else if (data.level2Qual.completed === "Yes") {
      if (!data.level2Qual.provider) errors.push("Level 2 qualification name is required");
      if (!data.level2Qual.completionDate) errors.push("Level 2 qualification completion date is required");
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate Section 6: Employment
 */
export function validateSection6(data: Partial<ChildminderApplication>): ValidationResult {
  const errors: string[] = [];

  if (!data.employmentHistory || data.employmentHistory.length === 0) {
    errors.push("Please add at least one employment entry");
  } else {
    data.employmentHistory.forEach((emp, index) => {
      if (!emp.employer) errors.push(`Employment ${index + 1}: Employer name is required`);
      if (!emp.role) errors.push(`Employment ${index + 1}: Role is required`);
      if (!emp.startDate) errors.push(`Employment ${index + 1}: Start date is required`);
      
      // Validate date order
      if (emp.startDate && emp.endDate && new Date(emp.startDate) >= new Date(emp.endDate)) {
        errors.push(`Employment ${index + 1}: End date must be after start date`);
      }
    });
  }

  if (!data.childVolunteered) errors.push("Please indicate if you've volunteered with children");

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate Section 7: People
 */
export function validateSection7(data: Partial<ChildminderApplication>): ValidationResult {
  const errors: string[] = [];
  const isDomestic = data.premisesType === "Domestic" || !data.premisesType;

  if (!data.workWithOthers) errors.push("Please indicate if you'll work with others");

  // Assistants validation
  if (data.workWithOthers === "Yes") {
    if (!data.assistants || data.assistants.length === 0) {
      errors.push("Please add at least one assistant");
    } else {
      data.assistants.forEach((asst, index) => {
        if (!asst.firstName) errors.push(`Assistant ${index + 1}: First name is required`);
        if (!asst.lastName) errors.push(`Assistant ${index + 1}: Last name is required`);
        if (!asst.dob) errors.push(`Assistant ${index + 1}: Date of birth is required`);
        
        // Age validation - must be 18+
        if (asst.dob) {
          const age = calculateAge(asst.dob);
          if (age < 18) {
            errors.push(`Assistant ${index + 1}: Must be at least 18 years old`);
          }
        }
        
        if (!asst.role || !asst.role.trim()) {
          errors.push(`Assistant ${index + 1}: Role is required`);
        }
        
        if (!asst.email) {
          errors.push(`Assistant ${index + 1}: Email address is required`);
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(asst.email)) {
          errors.push(`Assistant ${index + 1}: Invalid email address format`);
        }
        
        if (!asst.phone) {
          errors.push(`Assistant ${index + 1}: Mobile number is required`);
        } else if (!/^[\d\s+()-]{10,}$/.test(asst.phone)) {
          errors.push(`Assistant ${index + 1}: Invalid phone number format`);
        }
      });
    }
  }

  // Only validate household members for domestic premises
  if (isDomestic) {
    if (!data.adultsInHome) errors.push("Please indicate if adults live at your premises");
    if (!data.childrenInHome) errors.push("Please indicate if children live at your premises");

    // Adults validation
    if (data.adultsInHome === "Yes") {
      if (!data.adults || data.adults.length === 0) {
        errors.push("Please add at least one adult household member");
      } else {
        data.adults.forEach((adult, index) => {
          if (!adult.fullName) errors.push(`Adult ${index + 1}: Full name is required`);
          if (!adult.relationship) errors.push(`Adult ${index + 1}: Relationship is required`);
          if (!adult.dob) errors.push(`Adult ${index + 1}: Date of birth is required`);
        });
      }
    }

    // Children validation
    if (data.childrenInHome === "Yes") {
      if (!data.children || data.children.length === 0) {
        errors.push("Please add at least one child");
      } else {
        data.children.forEach((child, index) => {
          if (!child.fullName) errors.push(`Child ${index + 1}: Full name is required`);
          if (!child.dob) errors.push(`Child ${index + 1}: Date of birth is required`);
        });
      }
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate Section 8: Suitability
 */
export function validateSection8(data: Partial<ChildminderApplication>): ValidationResult {
  const errors: string[] = [];

  if (!data.healthCondition) errors.push("Please indicate if you have any health conditions");
  if (!data.smoker) errors.push("Please indicate if you are a smoker");
  if (!data.disqualified) errors.push("Please indicate if you've been disqualified");
  if (!data.socialServices) errors.push("Please indicate social services involvement");
  if (!data.otherCircumstances) errors.push("Please indicate any other circumstances");
  if (!data.hasDBS) errors.push("Please indicate if you have a DBS certificate");
  if (!data.offenceHistory) errors.push("Please indicate if you have any offences");

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate Section 9: Declaration
 */
export function validateSection9(data: Partial<ChildminderApplication>): ValidationResult {
  const errors: string[] = [];

  // A. Consent to Background Checks
  if (!data.consentDBSChecks) errors.push("You must consent to background checks");
  if (!data.consentLAContact) errors.push("You must authorise contact with local authority children's services");
  if (!data.consentLAShare) errors.push("You must authorise local authorities to share information");
  // B. Data Sharing & Use
  if (!data.consentOfstedSharing) errors.push("You must acknowledge data sharing with Ofsted");
  if (!data.consentDataUse) errors.push("You must acknowledge how your data will be used");
  if (!data.consentDataProtection) errors.push("You must acknowledge data protection handling");
  // C. Declarations
  if (!data.declarationTruth) errors.push("You must confirm information is true and accurate");
  if (!data.declarationNotify) errors.push("You must agree to notify of changes");

  if (!data.signatureFullName) {
    errors.push("Signature is required");
  } else {
    // Validate signature matches full name
    const expectedSignature = `${data.title} ${data.firstName} ${data.lastName}`;
    if (data.signatureFullName !== expectedSignature) {
      errors.push(`Signature must match your full legal name: "${expectedSignature}"`);
    }
  }

  if (!data.signatureDate) errors.push("Signature date is required");

  return { isValid: errors.length === 0, errors };
}

/**
 * Helper function to calculate age from date of birth
 */
function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * Get validator function for a specific section
 */
export function getValidatorForSection(section: number): (data: Partial<ChildminderApplication>) => ValidationResult {
  switch (section) {
    case 1: return validateSection1;
    case 2: return validateSection2;
    case 3: return validateSection3;
    case 4: return validateSection4;
    case 5: return validateSection5;
    case 6: return validateSection6;
    case 7: return validateSection7;
    case 8: return validateSection8;
    case 9: return validateSection9;
    default: return () => ({ isValid: true, errors: [] });
  }
}
