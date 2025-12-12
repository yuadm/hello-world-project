import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ChildminderApplication } from "@/types/childminder";
import { RKProgressCard, RKSectionNav, RKFormHeader, RKButton, RKApplyFooter } from "@/components/apply/rk";
import { Section1PersonalDetails } from "@/components/apply/Section1PersonalDetails";
import { Section2AddressHistory } from "@/components/apply/Section2AddressHistory";
import { Section3Premises } from "@/components/apply/Section3Premises";
import { Section4Service } from "@/components/apply/Section4Service";
import { Section5Qualifications } from "@/components/apply/Section5Qualifications";
import { Section6Employment } from "@/components/apply/Section6Employment";
import { Section7People } from "@/components/apply/Section7People";
import { Section8Suitability } from "@/components/apply/Section8Suitability";
import { Section9Declaration } from "@/components/apply/Section9Declaration";
import { ArrowLeft, ArrowRight, AlertCircle, LogOut, Heart } from "lucide-react";
import { getValidatorForSection } from "@/lib/formValidation";
import { Link } from "react-router-dom";

const SECTIONS = [
  { id: 1, label: "Personal Details" },
  { id: 2, label: "Address History" },
  { id: 3, label: "Premises" },
  { id: 4, label: "Service" },
  { id: 5, label: "Qualifications" },
  { id: 6, label: "Employment" },
  { id: 7, label: "Household" },
  { id: 8, label: "Suitability" },
  { id: 9, label: "Declaration" },
];

const Apply = () => {
  const [currentSection, setCurrentSection] = useState(1);
  const [errors, setErrors] = useState<string[]>([]);
  const totalSections = 9;

  const form = useForm<Partial<ChildminderApplication>>({
    defaultValues: {
      previousNames: [],
      addressHistory: [],
      additionalPremises: [],
      ageGroups: [],
      childcareTimes: [],
      employmentHistory: [],
      assistants: [],
      adults: [],
      children: [],
      prevRegOfstedDetails: [],
      prevRegAgencyDetails: [],
      prevRegOtherUKDetails: [],
      prevRegEUDetails: [],
      offenceDetails: [],
      otherNames: "No",
      livedOutsideUK: "No",
      militaryBase: "No",
      premisesType: "Domestic",
      sameAddress: "Yes",
      useAdditionalPremises: "No",
      outdoorSpace: "No",
      pets: "No",
      workWithOthers: "No",
      overnightCare: "No",
      childVolunteered: "No",
      adultsInHome: "No",
      childrenInHome: "No",
      prevRegOfsted: "No",
      prevRegAgency: "No",
      prevRegOtherUK: "No",
      prevRegEU: "No",
      healthCondition: "No",
      smoker: "No",
      disqualified: "No",
      socialServices: "No",
      otherCircumstances: "No",
      hasDBS: "No",
      offenceHistory: "No",
      consentDBSChecks: false,
      consentLAContact: false,
      consentLAShare: false,
      consentOfstedSharing: false,
      consentDataUse: false,
      consentDataProtection: false,
      declarationTruth: false,
      declarationNotify: false,
    },
  });

  // Load saved progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("childminder-application");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        form.reset(data);
        toast.info("Your progress has been restored");
      } catch (e) {
        console.error("Failed to restore progress", e);
      }
    }
  }, []);

  // Auto-save progress
  useEffect(() => {
    const subscription = form.watch((data) => {
      localStorage.setItem("childminder-application", JSON.stringify(data));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const nextSection = () => {
    const validator = getValidatorForSection(currentSection);
    const validation = validator(form.getValues());
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    
    setErrors([]);
    if (currentSection < totalSections) {
      setCurrentSection(currentSection + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevSection = () => {
    setErrors([]);
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToSection = (section: number) => {
    setErrors([]);
    setCurrentSection(section);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = form.getValues();
    
    // Final validation of all sections
    const allErrors: string[] = [];
    for (let section = 1; section <= totalSections; section++) {
      const validator = getValidatorForSection(section);
      const validation = validator(data);
      if (!validation.isValid) {
        allErrors.push(...validation.errors.map(err => `Section ${section}: ${err}`));
      }
    }

    if (allErrors.length > 0) {
      setErrors(allErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      const { data: applicationData, error } = await supabase
        .from('childminder_applications')
        .insert({
          title: data.title,
          first_name: data.firstName,
          middle_names: data.middleNames,
          last_name: data.lastName,
          gender: data.gender,
          date_of_birth: data.dob,
          previous_names: data.previousNames,
          national_insurance_number: data.niNumber,
          email: data.email,
          phone_mobile: data.phone,
          right_to_work: data.rightToWork,
          home_postcode: data.homePostcode,
          current_address: data.homeAddress,
          home_move_in: data.homeMoveIn,
          address_history: data.addressHistory,
          address_gaps: data.addressGaps,
          lived_outside_uk: data.livedOutsideUK,
          military_base: data.militaryBase,
          same_address: data.sameAddress,
          premises_address: data.childcareAddress || data.homeAddress,
          premises_ownership: data.premisesType,
          use_additional_premises: data.useAdditionalPremises,
          additional_premises: data.additionalPremises,
          outdoor_space: data.outdoorSpace,
          premises_animals: data.pets,
          premises_animal_details: data.petsDetails,
          service_type: data.premisesType,
          service_age_range: data.ageGroups,
          work_with_others: data.workWithOthers,
          number_of_assistants: data.numberOfAssistants,
          service_capacity: {
            under1: data.proposedUnder1,
            under5: data.proposedUnder5,
            ages5to8: data.proposed5to8,
            ages8plus: data.proposed8plus
          },
          service_hours: data.childcareTimes,
          overnight_care: data.overnightCare,
          service_local_authority: data.localAuthority,
          qualifications: {
            firstAid: data.firstAid,
            safeguarding: data.safeguarding,
            eyfsChildminding: data.eyfsChildminding,
            level2Qual: data.level2Qual
          },
          employment_history: data.employmentHistory,
          employment_gaps: data.employmentGaps,
          child_volunteered: data.childVolunteered,
          child_volunteered_consent: data.childVolunteeredConsent,
          applicant_references: {
            reference1: {
              name: data.reference1Name,
              relationship: data.reference1Relationship,
              contact: data.reference1Contact,
              childcare: data.reference1ChildcareRole
            },
            reference2: {
              name: data.reference2Name,
              relationship: data.reference2Relationship,
              contact: data.reference2Contact,
              childcare: data.reference2ChildcareRole
            }
          },
          adults_in_home: data.adultsInHome,
          children_in_home: data.childrenInHome,
          people_in_household: {
            adults: data.adults,
            children: data.children
          },
          people_regular_contact: data.assistants,
          previous_registration: data.prevRegOfsted,
          prev_reg_agency: data.prevRegAgency,
          prev_reg_other_uk: data.prevRegOtherUK,
          prev_reg_eu: data.prevRegEU,
          registration_details: {
            ofsted: data.prevRegOfstedDetails,
            agency: data.prevRegAgencyDetails,
            otherUK: data.prevRegOtherUKDetails,
            eu: data.prevRegEUDetails
          },
          health_conditions: data.healthCondition,
          health_details: data.healthConditionDetails,
          smoker: data.smoker,
          disqualified: data.disqualified,
          other_circumstances: data.otherCircumstances,
          other_circumstances_details: data.otherCircumstancesDetails,
          has_dbs: data.hasDBS,
          dbs_number: data.dbsNumber,
          dbs_enhanced: data.dbsEnhanced,
          dbs_update: data.dbsUpdate,
          criminal_convictions: data.offenceHistory,
          convictions_details: data.offenceDetails ? JSON.stringify(data.offenceDetails) : null,
          safeguarding_concerns: data.socialServices,
          safeguarding_details: data.socialServicesDetails,
          declaration_confirmed: data.declarationTruth,
          declaration_change_notification: data.declarationNotify,
          declaration_inspection_cooperation: data.consentDBSChecks,
          declaration_information_sharing: data.consentLAShare,
          declaration_data_processing: data.consentDataProtection,
          declaration_signature: data.signatureFullName,
          declaration_date: data.signatureDate,
          payment_method: null,
          user_id: null,
          status: 'pending'
        } as any)
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      // Create compliance records
      if (applicationData?.id) {
        const applicationId = applicationData.id;
        
        const calculateAge = (dob: string): number => {
          const birthDate = new Date(dob);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          return age;
        };

        const householdMemberRecords = [];
        
        if (data.adults && Array.isArray(data.adults)) {
          for (const adult of data.adults) {
            householdMemberRecords.push({
              application_id: applicationId,
              full_name: adult.fullName,
              date_of_birth: adult.dob,
              relationship: adult.relationship,
              member_type: 'adult',
              dbs_status: 'not_requested' as const
            });
          }
        }

        if (data.children && Array.isArray(data.children)) {
          for (const child of data.children) {
            const age = child.dob ? calculateAge(child.dob) : 0;
            householdMemberRecords.push({
              application_id: applicationId,
              full_name: child.fullName,
              date_of_birth: child.dob,
              relationship: 'Child',
              member_type: age >= 16 ? 'adult' : 'child',
              dbs_status: age >= 16 ? ('not_requested' as const) : ('not_requested' as const)
            });
          }
        }

        if (householdMemberRecords.length > 0) {
          const { error: memberError } = await supabase
            .from('compliance_household_members')
            .insert(householdMemberRecords);
          
          if (memberError) {
            console.error("Failed to create household member records:", memberError);
          }
        }

        if (data.assistants && Array.isArray(data.assistants)) {
          const assistantRecords = data.assistants.map((assistant: any) => ({
            application_id: applicationId,
            first_name: assistant.firstName,
            last_name: assistant.lastName,
            date_of_birth: assistant.dob,
            role: assistant.role,
            email: assistant.email,
            phone: assistant.phone,
            dbs_status: 'not_requested' as const,
            form_status: 'not_sent' as const
          }));

          if (assistantRecords.length > 0) {
            const { error: assistantError } = await supabase
              .from('compliance_assistants')
              .insert(assistantRecords);
            
            if (assistantError) {
              console.error("Failed to create assistant records:", assistantError);
            }
          }
        }
      }

      toast.success("Application submitted successfully! We'll review and be in touch soon.");
      localStorage.removeItem("childminder-application");
      
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(`Failed to submit application: ${error.message || 'Please try again.'}`);
    }
  };

  const renderSection = () => {
    switch (currentSection) {
      case 1:
        return <Section1PersonalDetails form={form} />;
      case 2:
        return <Section2AddressHistory form={form} />;
      case 3:
        return <Section3Premises form={form} />;
      case 4:
        return <Section4Service form={form} />;
      case 5:
        return <Section5Qualifications form={form} />;
      case 6:
        return <Section6Employment form={form} />;
      case 7:
        return <Section7People form={form} />;
      case 8:
        return <Section8Suitability form={form} />;
      case 9:
        return <Section9Declaration form={form} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E8F5F0] rk-apply flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-rk-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[10px] bg-gradient-to-br from-[hsl(163,50%,38%)] to-[hsl(163,50%,32%)] flex items-center justify-center shadow-[0_4px_12px_rgba(12,124,89,0.25)]">
              <Heart className="h-6 w-6 text-white" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-rk-primary font-fraunces leading-tight">ReadyKids</h1>
              <p className="text-sm text-rk-text-light font-dm-sans">Childminder Registration</p>
            </div>
          </Link>
          <Link 
            to="/" 
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-rk-gray-700 bg-white border border-rk-gray-300 rounded-md hover:bg-rk-gray-100 transition-all"
          >
            Save & Exit
          </Link>
        </div>
      </header>

      {/* Main 2-Column Layout */}
      <div className="max-w-[1200px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 flex-1">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-[100px] lg:h-fit">
          {/* Progress Card */}
          <RKProgressCard 
            currentSection={currentSection} 
            totalSections={totalSections} 
            className="mb-6"
          />

          {/* Section Navigation */}
          <RKSectionNav 
            sections={SECTIONS} 
            currentSection={currentSection} 
            onSectionClick={goToSection}
          />
        </aside>

        {/* Main Form Area */}
        <main>
          {/* Error Summary */}
          {errors.length > 0 && (
            <div className="mb-6 p-5 bg-[#FEE2E2] border-2 border-[#DC2626] rounded-2xl">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-[#DC2626] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-[#DC2626] text-lg mb-2">There is a problem</h3>
                  <ul className="text-sm text-rk-text space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Form Container */}
          <div className="bg-white rounded-[20px] shadow-lg overflow-hidden">
            <RKFormHeader 
              title="Apply to register as a childminder"
              subtitle="Complete this application to register with ReadyKids Childminder Agency."
            />

            <div className="p-6 md:p-10 bg-[#F8FAFC]">
              <form onSubmit={onSubmit} noValidate>
                {renderSection()}

                {/* Navigation Buttons */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 mt-10 pt-6 border-t border-rk-border">
                  {currentSection > 1 && (
                    <RKButton
                      type="button"
                      variant="secondary"
                      onClick={prevSection}
                      className="flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="h-5 w-5" />
                      Back
                    </RKButton>
                  )}

                  <div className="flex-1" />

                  {currentSection < totalSections ? (
                    <RKButton
                      type="button"
                      variant="primary"
                      size="lg"
                      onClick={nextSection}
                      className="flex items-center justify-center gap-2"
                    >
                      Continue
                      <ArrowRight className="h-5 w-5" />
                    </RKButton>
                  ) : (
                    <RKButton
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="flex items-center justify-center gap-2"
                    >
                      Submit Application
                    </RKButton>
                  )}
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <RKApplyFooter />
    </div>
  );
};

export default Apply;
