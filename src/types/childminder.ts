export interface PreviousName {
  fullName: string;
  dateFrom: string;
  dateTo: string;
}

export interface Address {
  line1: string;
  line2?: string;
  town: string;
  postcode: string;
}

export interface AddressHistory {
  address: Address;
  moveIn: string;
  moveOut: string;
}

export interface TrainingEntry {
  completed: "Yes" | "No";
  provider?: string;
  completionDate?: string;
  certificateNumber?: string;
  courseTitle?: string;
}

export interface EmploymentEntry {
  employer: string;
  role: string;
  startDate: string;
  endDate: string;
  reasonForLeaving: string;
}

export interface PersonEntry {
  fullName: string;
  relationship: string;
  dob: string;
  email?: string;
  phone?: string;
}

export interface AssistantEntry {
  firstName: string;
  lastName: string;
  dob: string;
  email: string;
  phone: string;
}

export interface CochildminderEntry {
  firstName: string;
  lastName: string;
  dob: string;
  email: string;
  phone: string;
}

export interface ChildEntry {
  fullName: string;
  dob: string;
}

export interface RegistrationEntry {
  regulator: string;
  registrationNumber: string;
  startDate: string;
  endDate?: string;
}

export interface OffenceEntry {
  date: string;
  details: string;
}

export interface ChildminderApplication {
  // Section 1: Personal Details
  title: string;
  firstName: string;
  middleNames?: string;
  lastName: string;
  gender: "Male" | "Female";
  otherNames: "Yes" | "No";
  previousNames: PreviousName[];
  dob: string;
  rightToWork: string;
  email: string;
  phone: string;
  niNumber: string;

  // Section 2: Address History
  homePostcode: string;
  homeAddress: Address;
  homeMoveIn: string;
  addressHistory: AddressHistory[];
  addressGaps?: string;
  livedOutsideUK: "Yes" | "No";
  militaryBase: "Yes" | "No";

  // Section 3: Premises
  localAuthority: string;
  premisesType: "Domestic" | "Non-domestic";
  sameAddress?: "Yes" | "No";
  childcareAddress?: Address;
  useAdditionalPremises: "Yes" | "No";
  additionalPremises?: Array<{ address: string; reason: string }>;
  outdoorSpace: "Yes" | "No";
  pets: "Yes" | "No";
  petsDetails?: string;

  // Section 4: Service
  ageGroups: string[];
  workWithAssistants: "Yes" | "No";
  numberOfAssistants?: number;
  workWithCochildminders: "Yes" | "No";
  numberOfCochildminders?: number;
  cochildminders?: CochildminderEntry[];
  childcareTimes?: string[];
  overnightCare?: "Yes" | "No";
  proposedUnder1?: number;
  proposedUnder5?: number;
  proposed5to8?: number;
  proposed8plus?: number;
  // Legacy field for backwards compatibility
  workWithOthers?: "Yes" | "No";

  // Section 5: Qualifications
  firstAid: TrainingEntry;
  safeguarding?: TrainingEntry;
  foodHygiene?: TrainingEntry;
  eyfsChildminding?: TrainingEntry;
  level2Qual?: TrainingEntry;
  otherTraining?: string;

  // Section 6: Employment
  employmentHistory: EmploymentEntry[];
  employmentGaps?: string;
  workedWithChildren?: "Yes" | "No";
  childVolunteered: "Yes" | "No";
  childVolunteeredConsent?: boolean;
  reference1Name: string;
  reference1Relationship: string;
  reference1Contact: string;
  reference1Phone?: string;
  reference1ChildcareRole?: "Yes" | "No";
  reference2Name: string;
  reference2Relationship: string;
  reference2Contact: string;
  reference2Phone?: string;
  reference2ChildcareRole?: "Yes" | "No";

  // Section 7: People Connected
  assistants?: AssistantEntry[];
  adultsInHome: "Yes" | "No";
  adults?: PersonEntry[];
  childrenInHome: "Yes" | "No";
  children?: ChildEntry[];

  // Section 8: Suitability
  prevRegOfsted: "Yes" | "No";
  prevRegOfstedDetails?: RegistrationEntry[];
  prevRegAgency: "Yes" | "No";
  prevRegAgencyDetails?: RegistrationEntry[];
  prevRegOtherUK: "Yes" | "No";
  prevRegOtherUKDetails?: RegistrationEntry[];
  prevRegEU: "Yes" | "No";
  prevRegEUDetails?: RegistrationEntry[];
  healthCondition: "Yes" | "No";
  healthConditionDetails?: string;
  smoker: "Yes" | "No";
  disqualified: "Yes" | "No";
  socialServices: "Yes" | "No";
  socialServicesDetails?: string;
  otherCircumstances: "Yes" | "No";
  otherCircumstancesDetails?: string;
  hasDBS: "Yes" | "No";
  dbsNumber?: string;
  dbsEnhanced?: "Yes" | "No";
  dbsUpdate?: "Yes" | "No";
  offenceHistory: "Yes" | "No";
  offenceDetails?: OffenceEntry[];

  // Section 9: Consent & Declaration
  // A. Consent to Background Checks
  consentDBSChecks: boolean;
  consentLAContact: boolean;
  consentLAShare: boolean;
  // B. Data Sharing & Use
  consentOfstedSharing: boolean;
  consentDataUse: boolean;
  consentDataProtection: boolean;
  // C. Declarations
  declarationTruth: boolean;
  declarationNotify: boolean;
  // Signature
  signatureFullName: string;
  signatureDate: string;
}
