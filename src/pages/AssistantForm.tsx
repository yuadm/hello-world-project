import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RKProgressCard, RKSectionNav, RKFormHeader, RKButton, RKApplyFooter } from "@/components/apply/rk";
import { AssistantConnectionBanner } from "@/components/assistant-form/AssistantConnectionBanner";
import { AssistantFormSection1 } from "@/components/assistant-form/AssistantFormSection1";
import { AssistantFormSection2 } from "@/components/assistant-form/AssistantFormSection2";
import { AssistantFormSection3 } from "@/components/assistant-form/AssistantFormSection3";
import { AssistantFormSection4 } from "@/components/assistant-form/AssistantFormSection4";
import { AssistantFormSection5 } from "@/components/assistant-form/AssistantFormSection5";
import { AssistantFormSection6 } from "@/components/assistant-form/AssistantFormSection6";
import { AssistantFormData } from "@/types/assistant";
import { Printer } from "lucide-react";
import {
  validateAssistantSection1,
  validateAssistantSection2,
  validateAssistantSection3,
  validateAssistantSection4,
  validateAssistantSection5,
  validateAssistantSection6,
} from "@/lib/assistantFormValidation";

type AssistantSource = "applicant" | "employee";

const SECTIONS = [
  { id: 1, label: "Personal Details" },
  { id: 2, label: "Address History" },
  { id: 3, label: "Professional History" },
  { id: 4, label: "Vetting & Suitability" },
  { id: 5, label: "Health Declaration" },
  { id: 6, label: "Declaration" },
];

export default function AssistantForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  
  const [currentSection, setCurrentSection] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [assistantSource, setAssistantSource] = useState<AssistantSource>("applicant");
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<AssistantFormData>({
    title: "", firstName: "", middleNames: "", lastName: "",
    otherNames: "No", previousNames: [],
    dob: "", birthTown: "", sex: "", niNumber: "",
    homeAddressLine1: "", homeAddressLine2: "", homeTown: "", homePostcode: "",
    homeMoveIn: "", addressHistory: [], addressGaps: "", livedOutsideUK: "No", outsideUKDetails: "",
    employmentHistory: [], employmentGaps: "",
    pfaCompleted: "", safeguardingCompleted: "",
    prevReg: "No", prevRegInfo: "", hasDBS: "No", dbsNumber: "", dbsUpdate: "",
    offenceHistory: "No", offenceDetails: "", disqualified: "No",
    socialServices: "No", socialServicesInfo: "",
    healthCondition: "No", healthConditionDetails: "", smoker: "",
    consentChecks: false, declarationTruth: false, declarationNotify: false,
    signatureFullName: "", signaturePrintName: "", signatureDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing form token");
      navigate("/");
      return;
    }
    loadFormData();
  }, [token]);

  const loadFormData = async () => {
    try {
      const { data: assistant } = await supabase
        .from("compliance_assistants")
        .select(`
          *,
          childminder_applications(
            id, first_name, last_name, current_address
          ),
          employees(
            id, first_name, last_name, address_line_1, address_line_2, town_city, postcode
          )
        `)
        .eq("form_token", token)
        .maybeSingle();

      if (!assistant) {
        toast.error("This form link is invalid or has expired.");
        setLoading(false);
        return;
      }

      const isEmployee = !!assistant.employee_id;
      setAssistantSource(isEmployee ? "employee" : "applicant");
      
      const parent = isEmployee ? assistant.employees : assistant.childminder_applications;
      
      let parentAddress;
      if (isEmployee && parent) {
        parentAddress = {
          line1: (parent as any).address_line_1,
          line2: (parent as any).address_line_2,
          town: (parent as any).town_city,
          postcode: (parent as any).postcode,
        };
      } else if (parent) {
        parentAddress = (parent as any).current_address;
      }

      setConnectionInfo({
        applicantName: `${parent?.first_name} ${parent?.last_name}`,
        applicantAddress: parentAddress,
        assistantName: `${assistant.first_name} ${assistant.last_name}`,
        assistantId: assistant.id,
        ...(isEmployee ? { employeeId: assistant.employee_id } : { applicationId: assistant.application_id }),
      });

      await loadAssistantForm(token!);
      setLoading(false);

    } catch (error: any) {
      console.error("[AssistantForm] Error loading form:", error);
      toast.error(error.message || "Failed to load form");
      navigate("/");
    }
  };

  const loadAssistantForm = async (formToken: string) => {
    const { data: existingForm } = await supabase
      .from("compliance_assistant_forms")
      .select("*")
      .eq("form_token", formToken)
      .maybeSingle();

    if (existingForm && existingForm.status === "submitted") {
      setAlreadySubmitted(true);
      setSubmittedAt(existingForm.submitted_at);
      return;
    }

    if (existingForm) {
      restoreFormData(existingForm);
      toast.success("Draft form loaded");
    }
  };

  const restoreFormData = (existingForm: any) => {
    // Map address history to new format
    const mappedAddressHistory = ((existingForm.address_history as any[]) || []).map(addr => ({
      line1: addr.line1 || addr.address?.line1 || "",
      line2: addr.line2 || addr.address?.line2 || "",
      town: addr.town || addr.address?.town || "",
      postcode: addr.postcode || addr.address?.postcode || "",
      moveIn: addr.moveIn || "",
      moveOut: addr.moveOut || ""
    }));

    setFormData({
      title: existingForm.title || "",
      firstName: existingForm.first_name || "",
      middleNames: existingForm.middle_names || "",
      lastName: existingForm.last_name || "",
      otherNames: Array.isArray(existingForm.previous_names) && existingForm.previous_names.length > 0 ? "Yes" : "No",
      previousNames: (existingForm.previous_names as any[]) || [],
      dob: existingForm.date_of_birth || "",
      birthTown: existingForm.birth_town || "",
      sex: existingForm.sex || "",
      niNumber: existingForm.ni_number || "",
      homeAddressLine1: (existingForm.current_address as any)?.line1 || "",
      homeAddressLine2: (existingForm.current_address as any)?.line2 || "",
      homeTown: (existingForm.current_address as any)?.town || "",
      homePostcode: (existingForm.current_address as any)?.postcode || "",
      homeMoveIn: (existingForm.current_address as any)?.moveIn || "",
      addressHistory: mappedAddressHistory,
      addressGaps: "",
      livedOutsideUK: existingForm.lived_outside_uk || "No",
      outsideUKDetails: "",
      employmentHistory: (existingForm.employment_history as any[]) || [],
      employmentGaps: existingForm.employment_gaps || "",
      pfaCompleted: existingForm.pfa_completed || "",
      safeguardingCompleted: existingForm.safeguarding_completed || "",
      prevReg: existingForm.previous_registration || "No",
      prevRegInfo: (existingForm.previous_registration_details as string) || "",
      hasDBS: existingForm.has_dbs || "No",
      dbsNumber: existingForm.dbs_number || "",
      dbsUpdate: existingForm.dbs_update_service || "",
      offenceHistory: existingForm.criminal_history || "No",
      offenceDetails: existingForm.criminal_history_details || "",
      disqualified: existingForm.disqualified || "No",
      socialServices: existingForm.social_services || "No",
      socialServicesInfo: existingForm.social_services_details || "",
      healthCondition: existingForm.health_conditions || "No",
      healthConditionDetails: existingForm.health_conditions_details || "",
      smoker: existingForm.smoker || "",
      consentChecks: existingForm.consent_checks || false,
      declarationTruth: existingForm.declaration_truth || false,
      declarationNotify: existingForm.declaration_notify || false,
      signatureFullName: existingForm.signature_name || "",
      signaturePrintName: "",
      signatureDate: existingForm.signature_date || new Date().toISOString().split('T')[0]
    });
  };

  const validateSection = (section: number): boolean => {
    let result: any;
    
    // Adjust section index (UI is 1-based, validation is 0-based)
    switch (section) {
      case 1: result = validateAssistantSection1(formData); break;
      case 2: result = validateAssistantSection2(formData); break;
      case 3: result = validateAssistantSection3(formData); break;
      case 4: result = validateAssistantSection4(formData); break;
      case 5: result = validateAssistantSection5(formData); break;
      case 6: result = validateAssistantSection6(formData); break;
      default: return true;
    }

    setValidationErrors(result.errors);
    
    if (!result.isValid) {
      toast.error("Please complete all required fields before continuing");
      setTimeout(() => {
        const firstError = document.querySelector('[aria-invalid="true"]');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return false;
    }
    
    return true;
  };

  const saveDraft = async () => {
    if (!token || !connectionInfo) return;

    try {
      const payload = {
        form_token: token,
        status: "draft",
        title: formData.title,
        first_name: formData.firstName,
        middle_names: formData.middleNames,
        last_name: formData.lastName,
        previous_names: formData.otherNames === "Yes" ? formData.previousNames : [],
        date_of_birth: formData.dob || null,
        birth_town: formData.birthTown,
        sex: formData.sex,
        ni_number: formData.niNumber,
        current_address: {
          line1: formData.homeAddressLine1,
          line2: formData.homeAddressLine2,
          town: formData.homeTown,
          postcode: formData.homePostcode,
          moveIn: formData.homeMoveIn
        },
        address_history: formData.addressHistory,
        lived_outside_uk: formData.livedOutsideUK,
        employment_history: formData.employmentHistory,
        employment_gaps: formData.employmentGaps,
        pfa_completed: formData.pfaCompleted,
        safeguarding_completed: formData.safeguardingCompleted,
        previous_registration: formData.prevReg,
        previous_registration_details: formData.prevRegInfo,
        has_dbs: formData.hasDBS,
        dbs_number: formData.dbsNumber,
        dbs_update_service: formData.dbsUpdate,
        criminal_history: formData.offenceHistory,
        criminal_history_details: formData.offenceDetails,
        disqualified: formData.disqualified,
        social_services: formData.socialServices,
        social_services_details: formData.socialServicesInfo,
        health_conditions: formData.healthCondition,
        health_conditions_details: formData.healthConditionDetails,
        smoker: formData.smoker,
        consent_checks: formData.consentChecks,
        declaration_truth: formData.declarationTruth,
        declaration_notify: formData.declarationNotify,
        signature_name: formData.signatureFullName,
        signature_date: formData.signatureDate || null
      };

      const { error } = await supabase
        .from("compliance_assistant_forms")
        .upsert({
          ...payload,
          assistant_id: connectionInfo.assistantId,
          ...(assistantSource === "employee" 
            ? { employee_id: connectionInfo.employeeId } 
            : { application_id: connectionInfo.applicationId }
          ),
        }, { onConflict: "form_token" });

      if (error) throw error;

      toast.success("Draft saved");
    } catch (error: any) {
      console.error("Error saving draft:", error);
      toast.error("Failed to save draft");
    }
  };

  const handleSubmit = async () => {
    if (!token || !connectionInfo) return;

    if (!validateSection(6)) {
      return;
    }

    setSubmitting(true);
    try {
      await saveDraft();

      const { error } = await supabase.functions.invoke("submit-assistant-form", {
        body: { 
          token, 
          formData,
          isEmployee: assistantSource === "employee"
        }
      });

      if (error) throw error;

      toast.success("Form submitted successfully!");
      navigate("/");
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error(error.message || "Failed to submit form");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSectionClick = (sectionId: number) => {
    setValidationErrors({});
    setCurrentSection(sectionId);
  };

  const handleNext = () => {
    setValidationErrors({});
    setCurrentSection(currentSection + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setValidationErrors({});
    setCurrentSection(currentSection - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E8F5F0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(163,50%,38%)] mx-auto mb-4"></div>
          <p className="text-[#64748B]">Loading form...</p>
        </div>
      </div>
    );
  }

  if (alreadySubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E8F5F0] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Already Submitted</h1>
          <p className="text-gray-600 mb-4">
            This assistant form has already been submitted
            {submittedAt && ` on ${new Date(submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`}.
          </p>
          <p className="text-sm text-gray-500">
            Thank you for completing the form. No further action is required.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E8F5F0]">
      {/* Header */}
      <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-50 no-print">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-[hsl(163,50%,38%)] font-fraunces">Ready Kids</span>
              <span className="text-sm text-[#64748B] border-l border-[#E2E8F0] pl-3">Assistant Suitability Form (CMA-A1)</span>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#64748B] hover:text-[hsl(163,50%,38%)] hover:bg-[#F1F5F9] rounded-lg transition-colors"
            >
              <Printer className="h-4 w-4" />
              Print Form
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Connection Banner */}
        <AssistantConnectionBanner
          applicantName={connectionInfo?.applicantName}
          applicantAddress={connectionInfo?.applicantAddress}
          assistantName={connectionInfo?.assistantName}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6 no-print">
            <RKProgressCard 
              currentSection={currentSection} 
              totalSections={6} 
            />
            <RKSectionNav 
              sections={SECTIONS}
              currentSection={currentSection}
              onSectionClick={handleSectionClick}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
              <RKFormHeader 
                title={SECTIONS[currentSection - 1]?.label || ""}
                subtitle={`Section ${currentSection} of 6`}
              />

              <div className="p-8">
                {currentSection === 1 && (
                  <AssistantFormSection1 formData={formData} setFormData={setFormData} validationErrors={validationErrors} />
                )}
                {currentSection === 2 && (
                  <AssistantFormSection2 formData={formData} setFormData={setFormData} validationErrors={validationErrors} />
                )}
                {currentSection === 3 && (
                  <AssistantFormSection3 formData={formData} setFormData={setFormData} validationErrors={validationErrors} />
                )}
                {currentSection === 4 && (
                  <AssistantFormSection4 formData={formData} setFormData={setFormData} validationErrors={validationErrors} />
                )}
                {currentSection === 5 && (
                  <AssistantFormSection5 formData={formData} setFormData={setFormData} validationErrors={validationErrors} />
                )}
                {currentSection === 6 && (
                  <AssistantFormSection6 formData={formData} setFormData={setFormData} validationErrors={validationErrors} />
                )}

                {/* Navigation Buttons */}
                <div className="mt-10 pt-6 border-t border-[#E2E8F0] flex flex-wrap gap-4 justify-between items-center no-print">
                  <div className="flex gap-2">
                    {currentSection > 1 && (
                      <RKButton variant="secondary" onClick={handleBack}>
                        Previous
                      </RKButton>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <RKButton variant="secondary" onClick={saveDraft}>
                      Save Draft
                    </RKButton>

                    {currentSection < 6 ? (
                      <RKButton onClick={handleNext}>
                        Continue
                      </RKButton>
                    ) : (
                      <RKButton onClick={handleSubmit} disabled={submitting}>
                        {submitting ? "Submitting..." : "Submit Form"}
                      </RKButton>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <RKApplyFooter />
    </div>
  );
}
