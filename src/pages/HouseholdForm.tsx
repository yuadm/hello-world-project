import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RKProgressCard, RKSectionNav, RKFormHeader, RKButton, RKApplyFooter } from "@/components/apply/rk";
import { ConnectionBanner } from "@/components/household-form/ConnectionBanner";
import { HouseholdFormSection1 } from "@/components/household-form/HouseholdFormSection1";
import { HouseholdFormSection2 } from "@/components/household-form/HouseholdFormSection2";
import { HouseholdFormSection3 } from "@/components/household-form/HouseholdFormSection3";
import { HouseholdFormSection4 } from "@/components/household-form/HouseholdFormSection4";
import { HouseholdFormSection5 } from "@/components/household-form/HouseholdFormSection5";
import { Printer } from "lucide-react";

export interface HouseholdFormData {
  // Section 1
  title: string;
  firstName: string;
  middleNames: string;
  lastName: string;
  otherNames: string;
  previousNames: Array<{ fullName: string; dateFrom: string; dateTo: string }>;
  dob: string;
  birthTown: string;
  sex: string;
  niNumber: string;
  
  // Section 2
  homeAddressLine1: string;
  homeAddressLine2: string;
  homeTown: string;
  homePostcode: string;
  homeMoveIn: string;
  addressHistory: Array<{ 
    line1?: string; 
    line2?: string; 
    town?: string; 
    postcode?: string; 
    moveIn: string; 
    moveOut: string 
  }>;
  addressGaps?: string;
  livedOutsideUK: string;
  outsideUKDetails: string;
  
  // Section 3
  prevReg: string;
  prevRegInfo: string;
  hasDBS: string;
  dbsNumber: string;
  dbsUpdate: string;
  offenceHistory: string;
  offenceDetails: string;
  disqualified: string;
  socialServices: string;
  socialServicesInfo: string;
  
  // Section 4
  healthCondition: string;
  healthConditionDetails: string;
  smoker: string;
  
  // Section 5
  consentChecks: boolean;
  declarationTruth: boolean;
  declarationNotify: boolean;
  signatureFullName: string;
  signaturePrintName?: string;
  signatureDate: string;
}

const SECTIONS = [
  { id: 1, label: "Personal Details" },
  { id: 2, label: "Address History" },
  { id: 3, label: "Vetting & Suitability" },
  { id: 4, label: "Health Declaration" },
  { id: 5, label: "Declaration" },
];

export default function HouseholdForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  
  const [currentSection, setCurrentSection] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<HouseholdFormData>({
    title: "", firstName: "", middleNames: "", lastName: "",
    otherNames: "No", previousNames: [],
    dob: "", birthTown: "", sex: "", niNumber: "",
    homeAddressLine1: "", homeAddressLine2: "", homeTown: "", homePostcode: "",
    homeMoveIn: "", addressHistory: [], addressGaps: "", livedOutsideUK: "No", outsideUKDetails: "",
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
      const { data: member } = await supabase
        .from("compliance_household_members")
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

      if (!member) {
        console.error("[HouseholdForm] Invalid or expired form token");
        toast.error("Invalid form link or token expired");
        navigate("/");
        return;
      }

      console.log("[HouseholdForm] Found member in unified table");
      const isEmployee = !!member.employee_id;
      
      const parent = isEmployee ? member.employees : member.childminder_applications;
      
      let parentAddress;
      if (isEmployee && parent) {
        parentAddress = {
          line1: (parent as any).address_line_1,
          line2: (parent as any).address_line_2,
          town: (parent as any).town_city,
          postcode: (parent as any).postcode
        };
      } else if (parent) {
        parentAddress = (parent as any).current_address;
      }

      setConnectionInfo({
        applicantName: `${parent?.first_name} ${parent?.last_name}`,
        applicantAddress: parentAddress,
        memberName: member.full_name,
        memberId: member.id,
        applicationId: isEmployee ? member.employee_id : member.application_id,
        isEmployee
      });

      const { data: existingForm } = await supabase
        .from("compliance_household_forms")
        .select("*")
        .eq("form_token", token)
        .maybeSingle();

      if (existingForm && existingForm.status === "submitted") {
        setAlreadySubmitted(true);
        setSubmittedAt(existingForm.submitted_at);
        setLoading(false);
        return;
      }

      if (existingForm) {
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
          outsideUKDetails: existingForm.outside_uk_details || "",
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
        toast.success("Draft form loaded");
      }

      setLoading(false);
    } catch (error: any) {
      console.error("Error loading form:", error);
      toast.error(error.message || "Failed to load form");
      navigate("/");
    }
  };

  const validateSection = (section: number): boolean => {
    const errors: Record<string, string> = {};

    if (section === 1) {
      if (!formData.title) errors.title = "Select a title";
      if (!formData.firstName.trim()) errors.firstName = "Enter your first name";
      if (!formData.lastName.trim()) errors.lastName = "Enter your last name";
      if (!formData.dob) errors.dob = "Enter your date of birth";
      if (!formData.birthTown.trim()) errors.birthTown = "Enter your town of birth";
      if (!formData.sex) errors.sex = "Select your sex";
      if (!formData.niNumber.trim()) errors.niNumber = "Enter your National Insurance number";
      else if (!/^[A-Z]{2}[0-9]{6}[A-D]$/.test(formData.niNumber.replace(/\s/g, ""))) {
        errors.niNumber = "Enter a valid NI number format (e.g., QQ123456C)";
      }
    } else if (section === 2) {
      if (!formData.homeAddressLine1.trim()) errors.homeAddressLine1 = "Enter address line 1";
      if (!formData.homeTown.trim()) errors.homeTown = "Enter town or city";
      if (!formData.homePostcode.trim()) errors.homePostcode = "Enter postcode";
      if (!formData.homeMoveIn) errors.homeMoveIn = "Enter move in date";
      if (!formData.livedOutsideUK) errors.livedOutsideUK = "Select yes or no";
    } else if (section === 3) {
      if (!formData.prevReg) errors.prevReg = "Select yes or no";
      if (!formData.hasDBS) errors.hasDBS = "Select yes or no";
      if (formData.hasDBS === "Yes" && !formData.dbsNumber.trim()) {
        errors.dbsNumber = "Enter your DBS certificate number";
      }
      if (formData.hasDBS === "Yes" && formData.dbsNumber && !/^\d{12}$/.test(formData.dbsNumber)) {
        errors.dbsNumber = "DBS certificate number must be 12 digits";
      }
      if (!formData.offenceHistory) errors.offenceHistory = "Select yes or no";
      if (!formData.disqualified) errors.disqualified = "Select yes or no";
      if (!formData.socialServices) errors.socialServices = "Select yes or no";
    } else if (section === 4) {
      if (!formData.healthCondition) errors.healthCondition = "Select yes or no";
      if (!formData.smoker) errors.smoker = "Select yes or no";
    } else if (section === 5) {
      if (!formData.consentChecks) errors.consentChecks = "You must consent to checks";
      if (!formData.declarationTruth) errors.declarationTruth = "You must confirm the information is true";
      if (!formData.declarationNotify) errors.declarationNotify = "You must agree to notify of changes";
      if (!formData.signatureFullName.trim()) errors.signatureFullName = "Enter your full name";
    }

    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
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

    if (connectionInfo.isEmployee) {
      return;
    }

    try {
      const payload = {
        member_id: connectionInfo.memberId,
        application_id: connectionInfo.applicationId,
        form_token: token,
        status: "draft",
        title: formData.title,
        first_name: formData.firstName,
        middle_names: formData.middleNames,
        last_name: formData.lastName,
        previous_names: formData.otherNames === "Yes" ? formData.previousNames : [],
        date_of_birth: formData.dob,
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
        outside_uk_details: formData.outsideUKDetails,
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
        signature_date: formData.signatureDate
      };

      const { error } = await supabase
        .from("compliance_household_forms")
        .upsert(payload, { onConflict: "form_token" });

      if (error) throw error;
      toast.success("Draft saved");
    } catch (error: any) {
      console.error("Error saving draft:", error);
      toast.error("Failed to save draft");
    }
  };

  const handleSubmit = async () => {
    if (!token || !connectionInfo) return;

    if (!validateSection(5)) {
      return;
    }

    setSubmitting(true);
    try {
      await saveDraft();

      const { error } = await supabase.functions.invoke("submit-household-form", {
        body: { token, formData }
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
            This household member form has already been submitted
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
              <span className="text-sm text-[#64748B] border-l border-[#E2E8F0] pl-3">Household Member Form</span>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#64748B] hover:text-[hsl(163,50%,38%)] hover:bg-[#F1F5F9] rounded-lg transition-colors"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Left Sidebar */}
          <aside className="space-y-6 no-print">
            <RKProgressCard 
              currentSection={currentSection} 
              totalSections={SECTIONS.length} 
            />
            <RKSectionNav 
              sections={SECTIONS}
              currentSection={currentSection}
              onSectionClick={handleSectionClick}
            />
          </aside>

          {/* Main Content */}
          <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(15,23,42,0.08)] overflow-hidden">
            <RKFormHeader 
              title="Suitability Check for Household Members"
              subtitle="Form CMA-H2 - Complete this form if you are aged 16+ and live or work at a childminding premises."
            />

            <div className="p-6 md:p-10">
              <ConnectionBanner
                applicantName={connectionInfo?.applicantName}
                applicantAddress={connectionInfo?.applicantAddress}
                memberName={connectionInfo?.memberName}
              />

              {currentSection === 1 && (
                <HouseholdFormSection1 formData={formData} setFormData={setFormData} validationErrors={validationErrors} />
              )}
              {currentSection === 2 && (
                <HouseholdFormSection2 formData={formData} setFormData={setFormData} validationErrors={validationErrors} />
              )}
              {currentSection === 3 && (
                <HouseholdFormSection3 formData={formData} setFormData={setFormData} validationErrors={validationErrors} />
              )}
              {currentSection === 4 && (
                <HouseholdFormSection4 formData={formData} setFormData={setFormData} validationErrors={validationErrors} />
              )}
              {currentSection === 5 && (
                <HouseholdFormSection5 formData={formData} setFormData={setFormData} validationErrors={validationErrors} />
              )}

              {/* Navigation Buttons */}
              <div className="mt-10 pt-6 border-t border-[#E2E8F0] flex flex-wrap gap-4 justify-between items-center no-print">
                <div className="flex gap-3">
                  {currentSection > 1 && (
                    <RKButton variant="secondary" onClick={handleBack}>
                      ← Back
                    </RKButton>
                  )}
                  
                  {currentSection < 5 && (
                    <RKButton onClick={handleNext}>
                      Continue →
                    </RKButton>
                  )}
                  
                  {currentSection === 5 && (
                    <RKButton onClick={handleSubmit} disabled={submitting}>
                      {submitting ? "Submitting..." : "Submit Form"}
                    </RKButton>
                  )}
                </div>

                {currentSection < 5 && !connectionInfo?.isEmployee && (
                  <RKButton variant="secondary" onClick={saveDraft}>
                    Save Draft
                  </RKButton>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <RKApplyFooter />
    </div>
  );
}
