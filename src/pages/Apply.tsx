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
      // Calculate payment
      const paymentAmount = data.ageGroups?.includes("0-5") || data.ageGroups?.includes("5-7") ? 200 : 100;

      // Submit to database
      const { error } = await supabase
        .from('childminder_applications' as any)
        .insert({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          date_of_birth: data.dob,
          ni_number: data.niNumber,
          service_type: data.ageGroups?.join(', '),
          application_data: data,
          status: 'pending',
          payment_amount: paymentAmount
        });

      if (error) throw error;

      toast.success("Application submitted successfully! We'll review and be in touch soon.");
      localStorage.removeItem("childminder-application");
      
      // Redirect to home after 2 seconds
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error("Failed to submit application. Please try again.");
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
      {/* GOV.UK Header */}
      <header className="bg-[hsl(var(--govuk-black))] text-white border-b-[10px] border-white">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center">
            <span className="text-2xl font-bold mr-4">Ready Kids</span>
            <span className="text-lg border-l pl-4 border-white/30">
              Childminder Registration Service
            </span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <p className="text-sm">
          <a href="/" className="underline text-primary hover:text-primary/80">
            Back to dashboard
          </a>
        </p>
      </div>

      <main className="container mx-auto px-4 md:px-8 pb-16">
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
