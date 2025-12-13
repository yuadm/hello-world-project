import { ChildminderApplication } from "@/types/childminder";

interface DBApplication {
  id: string;
  title: string;
  first_name: string;
  middle_names: string;
  last_name: string;
  email: string;
  phone_mobile: string;
  date_of_birth: string;
  gender: string;
  national_insurance_number: string;
  status: string;
  current_address: any;
  service_type: string;
  service_age_range: any;
  service_capacity: any;
  service_local_authority: string;
  work_with_others: string;
  number_of_assistants: number;
  work_with_cochildminders: string;
  number_of_cochildminders: number;
  cochildminders: any;
  qualifications: any;
  people_in_household: any;
  people_regular_contact: any;
  home_move_in: string;
  premises_ownership: string;
  outdoor_space: string;
  premises_animals: string;
  premises_animal_details: string;
  has_dbs: string;
  dbs_number: string;
  dbs_enhanced: string;
  dbs_update: string;
  criminal_convictions: string;
  applicant_references: any;
  address_history: any;
  employment_gaps: string;
  right_to_work: string;
  previous_names: any;
  place_of_birth: string;
  service_hours: any;
  overnight_care: string;
  address_gaps: string;
  lived_outside_uk: string;
  military_base: string;
  same_address: string;
  premises_address: any;
  use_additional_premises: string;
  additional_premises: any;
  employment_history: any;
  current_employment: string;
  previous_registration: string;
  registration_details: any;
  health_conditions: string;
  health_details: string;
  smoker: string;
  disqualified: string;
  safeguarding_concerns: string;
  safeguarding_details: string;
  other_circumstances: string;
  other_circumstances_details: string;
  convictions_details: string;
  child_volunteered: string;
  child_volunteered_consent: boolean;
  declaration_confirmed: boolean;
  declaration_change_notification: boolean;
  declaration_inspection_cooperation: boolean;
  declaration_information_sharing: boolean;
  declaration_data_processing: boolean;
  declaration_signature: string;
  
  declaration_date: string;
  payment_method: string;
  home_postcode: string;
  prev_reg_agency: string;
  prev_reg_other_uk: string;
  prev_reg_eu: string;
  adults_in_home: string;
  children_in_home: string;
}

/**
 * Convert database application to form format
 */
export function dbToFormData(dbApp: DBApplication): Partial<ChildminderApplication> {
  const qualifications = dbApp.qualifications || {};
  const serviceCapacity = dbApp.service_capacity || {};
  const peopleInHousehold = dbApp.people_in_household || {};
  const references = dbApp.applicant_references || {};
  const registrationDetails = dbApp.registration_details || {};

  let offenceDetails = [];
  try {
    if (dbApp.convictions_details) {
      offenceDetails = typeof dbApp.convictions_details === 'string' 
        ? JSON.parse(dbApp.convictions_details) 
        : dbApp.convictions_details;
    }
  } catch (e) {
    console.error("Failed to parse offence details", e);
  }

  return {
    // Section 1: Personal Details
    title: dbApp.title,
    firstName: dbApp.first_name,
    middleNames: dbApp.middle_names,
    lastName: dbApp.last_name,
    gender: dbApp.gender as "Male" | "Female",
    otherNames: dbApp.previous_names?.length > 0 ? "Yes" : "No",
    previousNames: dbApp.previous_names || [],
    dob: dbApp.date_of_birth,
    rightToWork: dbApp.right_to_work,
    email: dbApp.email,
    phone: dbApp.phone_mobile,
    niNumber: dbApp.national_insurance_number,

    // Section 2: Address History
    homePostcode: dbApp.home_postcode,
    homeAddress: dbApp.current_address,
    homeMoveIn: dbApp.home_move_in,
    addressHistory: dbApp.address_history || [],
    addressGaps: dbApp.address_gaps,
    livedOutsideUK: dbApp.lived_outside_uk as "Yes" | "No",
    militaryBase: dbApp.military_base as "Yes" | "No",

    // Section 3: Premises
    localAuthority: dbApp.service_local_authority,
    premisesType: dbApp.service_type as "Domestic" | "Non-domestic",
    sameAddress: dbApp.same_address as "Yes" | "No",
    childcareAddress: dbApp.premises_address,
    useAdditionalPremises: dbApp.use_additional_premises as "Yes" | "No",
    additionalPremises: dbApp.additional_premises || [],
    outdoorSpace: dbApp.outdoor_space as "Yes" | "No",
    pets: dbApp.premises_animals as "Yes" | "No",
    petsDetails: dbApp.premises_animal_details,

    // Section 4: Service
    ageGroups: dbApp.service_age_range || [],
    workWithOthers: dbApp.work_with_others as "Yes" | "No",
    workWithAssistants: dbApp.work_with_others as "Yes" | "No",
    numberOfAssistants: dbApp.number_of_assistants,
    workWithCochildminders: dbApp.work_with_cochildminders as "Yes" | "No",
    numberOfCochildminders: dbApp.number_of_cochildminders,
    cochildminders: dbApp.cochildminders || [],
    childcareTimes: dbApp.service_hours || [],
    overnightCare: dbApp.overnight_care as "Yes" | "No",
    proposedUnder1: serviceCapacity.under1,
    proposedUnder5: serviceCapacity.under5,
    proposed5to8: serviceCapacity.ages5to8,
    proposed8plus: serviceCapacity.ages8plus,

    // Section 5: Qualifications
    firstAid: qualifications.firstAid,
    safeguarding: qualifications.safeguarding,
    eyfsChildminding: qualifications.eyfsChildminding,
    level2Qual: qualifications.level2Qual,
    foodHygiene: qualifications.foodHygiene,
    otherTraining: qualifications.otherTraining,

    // Section 6: Employment
    employmentHistory: dbApp.employment_history || [],
    employmentGaps: dbApp.employment_gaps,
    childVolunteered: dbApp.child_volunteered as "Yes" | "No",
    childVolunteeredConsent: dbApp.child_volunteered_consent,
    reference1Name: references.reference1?.name,
    reference1Relationship: references.reference1?.relationship,
    reference1Contact: references.reference1?.contact,
    reference1Phone: references.reference1?.phone,
    reference1ChildcareRole: references.reference1?.childcare,
    reference2Name: references.reference2?.name,
    reference2Relationship: references.reference2?.relationship,
    reference2Contact: references.reference2?.contact,
    reference2Phone: references.reference2?.phone,
    reference2ChildcareRole: references.reference2?.childcare,

    // Section 7: People Connected
    assistants: dbApp.people_regular_contact || [],
    adultsInHome: dbApp.adults_in_home as "Yes" | "No",
    adults: peopleInHousehold.adults || [],
    childrenInHome: dbApp.children_in_home as "Yes" | "No",
    children: peopleInHousehold.children || [],

    // Section 8: Suitability
    prevRegOfsted: dbApp.previous_registration as "Yes" | "No",
    prevRegOfstedDetails: registrationDetails.ofsted || [],
    prevRegAgency: dbApp.prev_reg_agency as "Yes" | "No",
    prevRegAgencyDetails: registrationDetails.agency || [],
    prevRegOtherUK: dbApp.prev_reg_other_uk as "Yes" | "No",
    prevRegOtherUKDetails: registrationDetails.otherUK || [],
    prevRegEU: dbApp.prev_reg_eu as "Yes" | "No",
    prevRegEUDetails: registrationDetails.eu || [],
    healthCondition: dbApp.health_conditions as "Yes" | "No",
    healthConditionDetails: dbApp.health_details,
    smoker: dbApp.smoker as "Yes" | "No",
    disqualified: dbApp.disqualified as "Yes" | "No",
    socialServices: dbApp.safeguarding_concerns as "Yes" | "No",
    socialServicesDetails: dbApp.safeguarding_details,
    otherCircumstances: dbApp.other_circumstances as "Yes" | "No",
    otherCircumstancesDetails: dbApp.other_circumstances_details,
    hasDBS: dbApp.has_dbs as "Yes" | "No",
    dbsNumber: dbApp.dbs_number,
    dbsEnhanced: dbApp.dbs_enhanced as "Yes" | "No",
    dbsUpdate: dbApp.dbs_update as "Yes" | "No",
    offenceHistory: dbApp.criminal_convictions as "Yes" | "No",
    offenceDetails: offenceDetails,

    // Section 9: Consent & Declaration
    consentDBSChecks: dbApp.declaration_inspection_cooperation,
    consentLAContact: dbApp.declaration_confirmed,
    consentLAShare: dbApp.declaration_information_sharing,
    consentOfstedSharing: dbApp.declaration_change_notification,
    consentDataUse: dbApp.declaration_data_processing,
    consentDataProtection: dbApp.declaration_data_processing,
    declarationTruth: dbApp.declaration_confirmed,
    declarationNotify: dbApp.declaration_change_notification,
    signatureFullName: dbApp.declaration_signature,
    signatureDate: dbApp.declaration_date,
  };
}

/**
 * Convert form data to database format
 */
export function formToDbData(formData: Partial<ChildminderApplication>) {
  return {
    // Personal Details
    title: formData.title,
    first_name: formData.firstName,
    middle_names: formData.middleNames,
    last_name: formData.lastName,
    gender: formData.gender,
    date_of_birth: formData.dob,
    previous_names: formData.previousNames,
    national_insurance_number: formData.niNumber,
    email: formData.email,
    phone_mobile: formData.phone,
    right_to_work: formData.rightToWork,

    // Address
    home_postcode: formData.homePostcode,
    current_address: formData.homeAddress,
    home_move_in: formData.homeMoveIn,
    address_history: formData.addressHistory,
    address_gaps: formData.addressGaps,
    lived_outside_uk: formData.livedOutsideUK,
    military_base: formData.militaryBase,

    // Premises
    same_address: formData.sameAddress,
    premises_address: formData.childcareAddress || formData.homeAddress,
    premises_ownership: formData.premisesType,
    use_additional_premises: formData.useAdditionalPremises,
    additional_premises: formData.additionalPremises,
    outdoor_space: formData.outdoorSpace,
    premises_animals: formData.pets,
    premises_animal_details: formData.petsDetails,

    // Service Details
    service_type: formData.premisesType,
    service_age_range: formData.ageGroups,
    work_with_others: formData.workWithAssistants || formData.workWithOthers,
    number_of_assistants: formData.numberOfAssistants,
    work_with_cochildminders: formData.workWithCochildminders,
    number_of_cochildminders: formData.numberOfCochildminders,
    cochildminders: formData.cochildminders,
    // Note: cochildminders are stored in compliance_cochildminders table, not here
    service_capacity: {
      under1: formData.proposedUnder1,
      under5: formData.proposedUnder5,
      ages5to8: formData.proposed5to8,
      ages8plus: formData.proposed8plus,
    },
    service_hours: formData.childcareTimes,
    overnight_care: formData.overnightCare,
    service_local_authority: formData.localAuthority,

    // Qualifications & Employment
    qualifications: {
      firstAid: formData.firstAid,
      safeguarding: formData.safeguarding,
      eyfsChildminding: formData.eyfsChildminding,
      level2Qual: formData.level2Qual,
      foodHygiene: formData.foodHygiene,
      otherTraining: formData.otherTraining,
    },
    employment_history: formData.employmentHistory,
    employment_gaps: formData.employmentGaps,
    child_volunteered: formData.childVolunteered,
    child_volunteered_consent: formData.childVolunteeredConsent,
    applicant_references: {
      reference1: {
        name: formData.reference1Name,
        relationship: formData.reference1Relationship,
        contact: formData.reference1Contact,
        phone: formData.reference1Phone,
        childcare: formData.reference1ChildcareRole,
      },
      reference2: {
        name: formData.reference2Name,
        relationship: formData.reference2Relationship,
        contact: formData.reference2Contact,
        phone: formData.reference2Phone,
        childcare: formData.reference2ChildcareRole,
      },
    },

    // People
    adults_in_home: formData.adultsInHome,
    children_in_home: formData.childrenInHome,
    people_in_household: {
      adults: formData.adults,
      children: formData.children,
    },
    people_regular_contact: formData.assistants,

    // Suitability
    previous_registration: formData.prevRegOfsted,
    prev_reg_agency: formData.prevRegAgency,
    prev_reg_other_uk: formData.prevRegOtherUK,
    prev_reg_eu: formData.prevRegEU,
    registration_details: {
      ofsted: formData.prevRegOfstedDetails,
      agency: formData.prevRegAgencyDetails,
      otherUK: formData.prevRegOtherUKDetails,
      eu: formData.prevRegEUDetails,
    },
    health_conditions: formData.healthCondition,
    health_details: formData.healthConditionDetails,
    smoker: formData.smoker,
    disqualified: formData.disqualified,
    other_circumstances: formData.otherCircumstances,
    other_circumstances_details: formData.otherCircumstancesDetails,
    has_dbs: formData.hasDBS,
    dbs_number: formData.dbsNumber,
    dbs_enhanced: formData.dbsEnhanced,
    dbs_update: formData.dbsUpdate,
    criminal_convictions: formData.offenceHistory,
    convictions_details: formData.offenceDetails ? JSON.stringify(formData.offenceDetails) : null,
    safeguarding_concerns: formData.socialServices,
    safeguarding_details: formData.socialServicesDetails,

    // Declaration
    declaration_confirmed: formData.declarationTruth,
    declaration_change_notification: formData.declarationNotify,
    declaration_inspection_cooperation: formData.consentDBSChecks,
    declaration_information_sharing: formData.consentLAShare,
    declaration_data_processing: formData.consentDataProtection,
    declaration_signature: formData.signatureFullName,
    declaration_date: formData.signatureDate,
    payment_method: null,
  };
}
