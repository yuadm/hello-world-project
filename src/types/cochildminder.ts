export interface CochildminderFormData {
  // Section 1: Personal Details
  title: string;
  firstName: string;
  middleNames: string;
  lastName: string;
  sex: string;
  dateOfBirth: string;
  birthTown: string;
  niNumber: string;
  previousNames: Array<{
    fullName: string;
    dateFrom: string;
    dateTo: string;
  }>;

  // Section 2: Address History
  currentAddress: {
    line1: string;
    line2?: string;
    town: string;
    postcode: string;
    moveIn: string;
  };
  addressHistory: Array<{
    line1: string;
    line2?: string;
    town: string;
    postcode: string;
    moveIn: string;
    moveOut: string;
  }>;
  livedOutsideUK: string;
  outsideUKDetails: string;

  // Section 3: Premises (pre-filled, readonly display)
  premisesAddress: {
    line1: string;
    line2?: string;
    town: string;
    postcode: string;
  };
  localAuthority: string;
  premisesType: string;

  // Section 4: Service (pre-filled, readonly display)
  serviceAgeGroups: string[];
  serviceHours: string[];

  // Section 5: Qualifications
  hasDbs: string;
  dbsNumber: string;
  dbsUpdateService: string;
  firstAidCompleted: string;
  firstAidProvider: string;
  firstAidDate: string;
  safeguardingCompleted: string;
  safeguardingProvider: string;
  safeguardingDate: string;
  pfaCompleted: string;
  level2Qualification: string;
  level2Provider: string;
  level2Date: string;
  eyfsCompleted: string;
  eyfsProvider: string;
  eyfsDate: string;
  otherQualifications: string;

  // Section 6: Employment History
  employmentHistory: Array<{
    employer: string;
    role: string;
    startDate: string;
    endDate: string;
    reasonForLeaving: string;
  }>;
  employmentGaps: string;

  // Section 7: References
  reference1Name: string;
  reference1Relationship: string;
  reference1Email: string;
  reference1Phone: string;
  reference1Childcare: boolean;
  reference2Name: string;
  reference2Relationship: string;
  reference2Email: string;
  reference2Phone: string;
  reference2Childcare: boolean;

  // Section 8: Suitability
  previousRegistration: string;
  previousRegistrationDetails: Array<{
    regulator: string;
    registrationNumber: string;
    startDate: string;
    endDate: string;
  }>;
  criminalHistory: string;
  criminalHistoryDetails: string;
  disqualified: string;
  socialServices: string;
  socialServicesDetails: string;
  healthConditions: string;
  healthConditionsDetails: string;
  smoker: string;

  // Section 9: Declaration
  consentChecks: boolean;
  declarationTruth: boolean;
  declarationNotify: boolean;
  signatureName: string;
  signatureDate: string;
}