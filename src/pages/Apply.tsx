import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ChildminderApplication } from "@/types/childminder";
import { ProgressBar } from "@/components/apply/ProgressBar";
import { ErrorSummary } from "@/components/apply/ErrorSummary";
import { GovUKButton } from "@/components/apply/GovUKButton";
import { Section1PersonalDetails } from "@/components/apply/Section1PersonalDetails";
import { Section2AddressHistory } from "@/components/apply/Section2AddressHistory";
import { Section3Premises } from "@/components/apply/Section3Premises";
import { Section4Service } from "@/components/apply/Section4Service";
import { Section5Qualifications } from "@/components/apply/Section5Qualifications";
import { Section6Employment } from "@/components/apply/Section6Employment";
import { Section7People } from "@/components/apply/Section7People";
import { Section8Suitability } from "@/components/apply/Section8Suitability";
import { Section9Declaration } from "@/components/apply/Section9Declaration";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getValidatorForSection } from "@/lib/formValidation";
import Navigation from "@/components/Navigation";

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
      declarationAccuracy: false,
      declarationChangeNotification: false,
      declarationInspectionCooperation: false,
      declarationInformationSharing: false,
      declarationDataProcessing: false,
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
    // Validate current section before proceeding
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get all form values directly
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
      // Submit to database with proper column mapping
      const { data: applicationData, error } = await supabase
        .from('childminder_applications')
        .insert({
          // Personal Details
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
          
          // Address
          home_postcode: data.homePostcode,
          current_address: data.homeAddress,
          home_move_in: data.homeMoveIn,
          address_history: data.addressHistory,
          address_gaps: data.addressGaps,
          lived_outside_uk: data.livedOutsideUK,
          military_base: data.militaryBase,
          
          // Premises
          same_address: data.sameAddress,
          premises_address: data.childcareAddress || data.homeAddress,
          premises_ownership: data.premisesType,
          use_additional_premises: data.useAdditionalPremises,
          additional_premises: data.additionalPremises,
          outdoor_space: data.outdoorSpace,
          premises_animals: data.pets,
          premises_animal_details: data.petsDetails,
          
          // Service Details
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
          
          // Qualifications & Employment
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
              childcare: data.reference1Childcare
            },
            reference2: {
              name: data.reference2Name,
              relationship: data.reference2Relationship,
              contact: data.reference2Contact,
              childcare: data.reference2Childcare
            }
          },
          
          // People
          adults_in_home: data.adultsInHome,
          children_in_home: data.childrenInHome,
          people_in_household: {
            adults: data.adults,
            children: data.children
          },
          people_regular_contact: data.assistants,
          
          // Suitability
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
          
          // Declaration
          declaration_confirmed: data.declarationAccuracy,
          declaration_change_notification: data.declarationChangeNotification,
          declaration_inspection_cooperation: data.declarationInspectionCooperation,
          declaration_information_sharing: data.declarationInformationSharing,
          declaration_data_processing: data.declarationDataProcessing,
          declaration_signature: data.signatureFullName,
          declaration_date: data.signatureDate,
          payment_method: data.paymentMethod,
          
          // No user_id - allowing anonymous submissions
          user_id: null,
          status: 'pending'
        } as any)
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      // Create compliance records for household members and assistants
      if (applicationData?.id) {
        const applicationId = applicationData.id;
        
        // Helper function to calculate age
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

        // Create household member records
        const householdMemberRecords = [];
        
        // Process adults
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

        // Process children (check if any are 16+ and mark as adult)
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

        // Create assistant records
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
      
      // Redirect to home after 2 seconds
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
    <div className="min-h-screen bg-[hsl(var(--govuk-grey-background))]">
      <Navigation />

      <main className="container mx-auto px-4 md:px-8 py-8 pt-24 pb-16">
        <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 shadow-lg">
          <h1 className="text-4xl font-extrabold mb-6 leading-tight text-foreground">
            Apply to register as a childminder
          </h1>

          <ErrorSummary errors={errors} onClose={() => setErrors([])} />

          <ProgressBar currentSection={currentSection} totalSections={totalSections} />

          <form onSubmit={onSubmit} noValidate>
            {renderSection()}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8 pt-6 border-t border-border">
              {currentSection > 1 && (
                <GovUKButton
                  type="button"
                  variant="secondary"
                  onClick={prevSection}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </GovUKButton>
              )}

              {currentSection < totalSections ? (
                <GovUKButton
                  type="button"
                  variant="primary"
                  onClick={nextSection}
                  className="flex items-center gap-2 ml-auto"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </GovUKButton>
              ) : (
                <GovUKButton
                  type="submit"
                  variant="primary"
                  className="ml-auto"
                >
                  Submit Application
                </GovUKButton>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Apply;
