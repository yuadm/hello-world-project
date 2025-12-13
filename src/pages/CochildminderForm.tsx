import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RKProgressCard, RKSectionNav, RKFormHeader, RKButton, RKApplyFooter } from "@/components/apply/rk";
import { CochildminderFormData } from "@/types/cochildminder";
import { Printer } from "lucide-react";
import {
  CochildminderFormSection1,
  CochildminderFormSection2,
  CochildminderFormSection3,
  CochildminderFormSection4,
  CochildminderFormSection5,
  CochildminderFormSection6,
  CochildminderFormSection7,
  CochildminderFormSection8,
} from "@/components/cochildminder-form";
import {
  validateCochildminderSection1,
  validateCochildminderSection2,
  validateCochildminderSection3,
  validateCochildminderSection4,
  validateCochildminderSection5,
  validateCochildminderSection6,
  validateCochildminderSection7,
  validateCochildminderSection8,
} from "@/lib/cochildminderFormValidation";

const SECTIONS = [
  { id: 1, label: "Personal Details" },
  { id: 2, label: "Address History" },
  { id: 3, label: "Premises" },
  { id: 4, label: "Service" },
  { id: 5, label: "Qualifications" },
  { id: 6, label: "References" },
  { id: 7, label: "Suitability" },
  { id: 8, label: "Declaration" },
];

const initialFormData: CochildminderFormData = {
  title: "", firstName: "", middleNames: "", lastName: "",
  sex: "", dateOfBirth: "", birthTown: "", niNumber: "",
  previousNames: [],
  currentAddress: { line1: "", line2: "", town: "", postcode: "", moveIn: "" },
  addressHistory: [],
  livedOutsideUK: "", outsideUKDetails: "",
  premisesAddress: { line1: "", line2: "", town: "", postcode: "" },
  localAuthority: "", premisesType: "",
  serviceAgeGroups: [], serviceHours: [],
  hasDbs: "", dbsNumber: "", dbsUpdateService: "",
  firstAidCompleted: "", firstAidProvider: "", firstAidDate: "",
  safeguardingCompleted: "", safeguardingProvider: "", safeguardingDate: "",
  pfaCompleted: "",
  level2Qualification: "", level2Provider: "", level2Date: "",
  eyfsCompleted: "", eyfsProvider: "", eyfsDate: "",
  otherQualifications: "",
  employmentHistory: [], employmentGaps: "",
  reference1Name: "", reference1Relationship: "", reference1Email: "", reference1Phone: "", reference1Childcare: false,
  reference2Name: "", reference2Relationship: "", reference2Email: "", reference2Phone: "", reference2Childcare: false,
  previousRegistration: "", previousRegistrationDetails: [],
  criminalHistory: "", criminalHistoryDetails: "",
  disqualified: "",
  socialServices: "", socialServicesDetails: "",
  healthConditions: "", healthConditionsDetails: "",
  smoker: "",
  consentChecks: false, declarationTruth: false, declarationNotify: false,
  signatureName: "", signatureDate: new Date().toISOString().split('T')[0],
};

export default function CochildminderForm() {
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
  const [formData, setFormData] = useState<CochildminderFormData>(initialFormData);

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
      // First get the cochildminder record using form_token
      const { data: cochildminder, error: coError } = await supabase
        .from("compliance_cochildminders")
        .select(`
          *,
          childminder_applications(id, first_name, last_name, premises_address, premises_ownership, service_local_authority, service_age_range, service_hours),
          employees(id, first_name, last_name, premises_postcode, premises_type, local_authority)
        `)
        .eq("form_token", token)
        .maybeSingle();

      if (coError || !cochildminder) {
        toast.error("This form link is invalid or has expired.");
        setLoading(false);
        return;
      }

      const isEmployee = !!cochildminder.employee_id;
      const parent = isEmployee ? cochildminder.employees : cochildminder.childminder_applications;

      // Get pre-filled data from parent application
      let prefillData: Partial<CochildminderFormData> = {};
      if (!isEmployee && cochildminder.childminder_applications) {
        const app = cochildminder.childminder_applications;
        prefillData = {
          premisesAddress: (app.premises_address as any) || { line1: "", line2: "", town: "", postcode: "" },
          premisesType: (app as any).premises_ownership || "",
          localAuthority: app.service_local_authority || "",
          serviceAgeGroups: Array.isArray(app.service_age_range) ? (app.service_age_range as string[]) : [],
          serviceHours: Array.isArray(app.service_hours) ? (app.service_hours as string[]) : [],
        };
      } else if (isEmployee && cochildminder.employees) {
        const emp = cochildminder.employees;
        prefillData = {
          premisesType: (emp as any).premises_type || "",
          localAuthority: (emp as any).local_authority || "",
        };
      }

      setConnectionInfo({
        applicantName: parent ? `${parent.first_name} ${parent.last_name}` : "Unknown",
        cochildminderName: `${cochildminder.first_name} ${cochildminder.last_name}`,
        cochildminderId: cochildminder.id,
        applicationId: cochildminder.application_id,
        employeeId: cochildminder.employee_id,
        prefillData,
      });

      // Check for existing form submission
      const { data: existingForm } = await supabase
        .from("cochildminder_applications")
        .select("*")
        .eq("form_token", token)
        .maybeSingle();

      if (existingForm?.status === "submitted") {
        setAlreadySubmitted(true);
        setSubmittedAt(existingForm.submitted_at);
        setLoading(false);
        return;
      }

      if (existingForm) {
        restoreFormData(existingForm, prefillData);
        toast.success("Draft form loaded");
      } else {
        // Set initial form data with prefilled values
        setFormData(prev => ({
          ...prev,
          firstName: cochildminder.first_name || "",
          lastName: cochildminder.last_name || "",
          dateOfBirth: cochildminder.date_of_birth || "",
          ...prefillData,
        }));
      }

      setLoading(false);
    } catch (error: any) {
      console.error("[CochildminderForm] Error loading form:", error);
      toast.error(error.message || "Failed to load form");
      setLoading(false);
    }
  };

  const restoreFormData = (form: any, prefillData: Partial<CochildminderFormData>) => {
    setFormData({
      title: form.title || "",
      firstName: form.first_name || "",
      middleNames: form.middle_names || "",
      lastName: form.last_name || "",
      sex: form.sex || "",
      dateOfBirth: form.date_of_birth || "",
      birthTown: form.birth_town || "",
      niNumber: form.ni_number || "",
      previousNames: (form.previous_names as any[]) || [],
      currentAddress: (form.current_address as any) || { line1: "", line2: "", town: "", postcode: "", moveIn: "" },
      addressHistory: (form.address_history as any[]) || [],
      livedOutsideUK: form.lived_outside_uk || "",
      outsideUKDetails: form.outside_uk_details || "",
      premisesAddress: (form.premises_address as any) || prefillData.premisesAddress || { line1: "", line2: "", town: "", postcode: "" },
      localAuthority: form.local_authority || prefillData.localAuthority || "",
      premisesType: form.premises_type || "",
      serviceAgeGroups: (form.service_age_groups as any[]) || prefillData.serviceAgeGroups || [],
      serviceHours: (form.service_hours as any[]) || prefillData.serviceHours || [],
      hasDbs: form.has_dbs || "",
      dbsNumber: form.dbs_number || "",
      dbsUpdateService: form.dbs_update_service || "",
      firstAidCompleted: form.first_aid_completed || "",
      firstAidProvider: form.first_aid_provider || "",
      firstAidDate: form.first_aid_date || "",
      safeguardingCompleted: form.safeguarding_completed || "",
      safeguardingProvider: form.safeguarding_provider || "",
      safeguardingDate: form.safeguarding_date || "",
      pfaCompleted: form.pfa_completed || "",
      level2Qualification: form.level_2_qualification || "",
      level2Provider: form.level_2_provider || "",
      level2Date: form.level_2_date || "",
      eyfsCompleted: form.eyfs_completed || "",
      eyfsProvider: form.eyfs_provider || "",
      eyfsDate: form.eyfs_date || "",
      otherQualifications: form.other_qualifications || "",
      employmentHistory: (form.employment_history as any[]) || [],
      employmentGaps: form.employment_gaps || "",
      reference1Name: form.reference_1_name || "",
      reference1Relationship: form.reference_1_relationship || "",
      reference1Email: form.reference_1_email || "",
      reference1Phone: form.reference_1_phone || "",
      reference1Childcare: form.reference_1_childcare || false,
      reference2Name: form.reference_2_name || "",
      reference2Relationship: form.reference_2_relationship || "",
      reference2Email: form.reference_2_email || "",
      reference2Phone: form.reference_2_phone || "",
      reference2Childcare: form.reference_2_childcare || false,
      previousRegistration: form.previous_registration || "",
      previousRegistrationDetails: (form.previous_registration_details as any[]) || [],
      criminalHistory: form.criminal_history || "",
      criminalHistoryDetails: form.criminal_history_details || "",
      disqualified: form.disqualified || "",
      socialServices: form.social_services || "",
      socialServicesDetails: form.social_services_details || "",
      healthConditions: form.health_conditions || "",
      healthConditionsDetails: form.health_conditions_details || "",
      smoker: form.smoker || "",
      consentChecks: form.consent_checks || false,
      declarationTruth: form.declaration_truth || false,
      declarationNotify: form.declaration_notify || false,
      signatureName: form.signature_name || "",
      signatureDate: form.signature_date || new Date().toISOString().split('T')[0],
    });
  };

  const validateSection = (section: number): boolean => {
    let result: { isValid: boolean; errors: Record<string, string> };

    switch (section) {
      case 1: result = validateCochildminderSection1(formData); break;
      case 2: result = validateCochildminderSection2(formData); break;
      case 3: result = validateCochildminderSection3(formData); break;
      case 4: result = validateCochildminderSection4(formData); break;
      case 5: result = validateCochildminderSection5(formData); break;
      case 6: result = validateCochildminderSection6(formData); break;
      case 7: result = validateCochildminderSection7(formData); break;
      case 8: result = validateCochildminderSection8(formData); break;
      default: return true;
    }

    setValidationErrors(result.errors);

    if (!result.isValid) {
      toast.error("Please complete all required fields before continuing");
      return false;
    }

    return true;
  };

  const saveDraft = async () => {
    if (!token || !connectionInfo) return;

    try {
      const payload = {
        form_token: token,
        cochildminder_id: connectionInfo.cochildminderId,
        application_id: connectionInfo.applicationId || null,
        employee_id: connectionInfo.employeeId || null,
        status: "draft",
        title: formData.title,
        first_name: formData.firstName,
        middle_names: formData.middleNames,
        last_name: formData.lastName,
        sex: formData.sex,
        date_of_birth: formData.dateOfBirth || null,
        birth_town: formData.birthTown,
        ni_number: formData.niNumber,
        previous_names: formData.previousNames,
        current_address: formData.currentAddress,
        address_history: formData.addressHistory,
        lived_outside_uk: formData.livedOutsideUK,
        outside_uk_details: formData.outsideUKDetails,
        premises_address: formData.premisesAddress,
        local_authority: formData.localAuthority,
        premises_type: formData.premisesType,
        service_age_groups: formData.serviceAgeGroups,
        service_hours: formData.serviceHours,
        has_dbs: formData.hasDbs,
        dbs_number: formData.dbsNumber,
        dbs_update_service: formData.dbsUpdateService,
        first_aid_completed: formData.firstAidCompleted,
        first_aid_provider: formData.firstAidProvider,
        first_aid_date: formData.firstAidDate || null,
        safeguarding_completed: formData.safeguardingCompleted,
        safeguarding_provider: formData.safeguardingProvider,
        safeguarding_date: formData.safeguardingDate || null,
        pfa_completed: formData.pfaCompleted,
        level_2_qualification: formData.level2Qualification,
        level_2_provider: formData.level2Provider,
        level_2_date: formData.level2Date || null,
        eyfs_completed: formData.eyfsCompleted,
        eyfs_provider: formData.eyfsProvider,
        eyfs_date: formData.eyfsDate || null,
        other_qualifications: formData.otherQualifications,
        employment_history: formData.employmentHistory,
        employment_gaps: formData.employmentGaps,
        reference_1_name: formData.reference1Name,
        reference_1_relationship: formData.reference1Relationship,
        reference_1_email: formData.reference1Email,
        reference_1_phone: formData.reference1Phone,
        reference_1_childcare: formData.reference1Childcare,
        reference_2_name: formData.reference2Name,
        reference_2_relationship: formData.reference2Relationship,
        reference_2_email: formData.reference2Email,
        reference_2_phone: formData.reference2Phone,
        reference_2_childcare: formData.reference2Childcare,
        previous_registration: formData.previousRegistration,
        previous_registration_details: formData.previousRegistrationDetails,
        criminal_history: formData.criminalHistory,
        criminal_history_details: formData.criminalHistoryDetails,
        disqualified: formData.disqualified,
        social_services: formData.socialServices,
        social_services_details: formData.socialServicesDetails,
        health_conditions: formData.healthConditions,
        health_conditions_details: formData.healthConditionsDetails,
        smoker: formData.smoker,
        consent_checks: formData.consentChecks,
        declaration_truth: formData.declarationTruth,
        declaration_notify: formData.declarationNotify,
        signature_name: formData.signatureName,
        signature_date: formData.signatureDate || null,
      };

      const { error } = await supabase
        .from("cochildminder_applications")
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

    if (!validateSection(8)) return;

    setSubmitting(true);
    try {
      await saveDraft();

      const { error } = await supabase.functions.invoke("submit-cochildminder-form", {
        body: { formToken: token, formData }
      });

      if (error) throw error;

      toast.success("Form submitted successfully!");
      setAlreadySubmitted(true);
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error(error.message || "Failed to submit form");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSectionClick = (sectionId: number) => {
    if (sectionId < currentSection) {
      setValidationErrors({});
      setCurrentSection(sectionId);
    } else if (sectionId === currentSection + 1) {
      if (validateSection(currentSection)) {
        setValidationErrors({});
        setCurrentSection(sectionId);
      }
    }
  };

  const handleNext = () => {
    if (validateSection(currentSection)) {
      setValidationErrors({});
      setCurrentSection(currentSection + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setValidationErrors({});
    setCurrentSection(currentSection - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#FEF3E2] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading form...</p>
        </div>
      </div>
    );
  }

  if (alreadySubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#FEF3E2] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Application Submitted</h1>
          <p className="text-muted-foreground mb-4">
            Your co-childminder registration application has been submitted
            {submittedAt && ` on ${new Date(submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`}.
          </p>
          <p className="text-sm text-muted-foreground">
            Thank you! No further action is required at this time.
          </p>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (currentSection) {
      case 1: return <CochildminderFormSection1 formData={formData} setFormData={setFormData} validationErrors={validationErrors} />;
      case 2: return <CochildminderFormSection2 formData={formData} setFormData={setFormData} validationErrors={validationErrors} />;
      case 3: return <CochildminderFormSection3 formData={formData} />;
      case 4: return <CochildminderFormSection4 formData={formData} />;
      case 5: return <CochildminderFormSection5 formData={formData} setFormData={setFormData} validationErrors={validationErrors} />;
      case 6: return <CochildminderFormSection6 formData={formData} setFormData={setFormData} validationErrors={validationErrors} />;
      case 7: return <CochildminderFormSection7 formData={formData} setFormData={setFormData} validationErrors={validationErrors} />;
      case 8: return <CochildminderFormSection8 formData={formData} setFormData={setFormData} validationErrors={validationErrors} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#FEF3E2]">
      <header className="bg-white border-b border-border sticky top-0 z-50 no-print">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-amber-600 font-fraunces">Ready Kids</span>
              <span className="text-sm text-muted-foreground border-l border-border pl-3">Co-childminder Registration</span>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            >
              <Printer className="h-4 w-4" />
              Print Form
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Connection Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-amber-800">
                <strong>{connectionInfo?.cochildminderName}</strong> – Co-childminder application for <strong>{connectionInfo?.applicantName}</strong>'s registration
              </p>
              {connectionInfo?.prefillData?.premisesAddress?.line1 && (
                <p className="text-xs text-amber-600 mt-1">
                  Premises: {connectionInfo.prefillData.premisesAddress.line1}, {connectionInfo.prefillData.premisesAddress.postcode}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6 no-print">
            <RKProgressCard currentSection={currentSection} totalSections={8} />
            <RKSectionNav sections={SECTIONS} currentSection={currentSection} onSectionClick={handleSectionClick} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
              <RKFormHeader 
                title={SECTIONS[currentSection - 1]?.label || ""} 
                subtitle={`Section ${currentSection} of 8`} 
              />

              <div className="p-6 lg:p-8">
                {renderSection()}

                <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 pt-6 border-t border-border">
                  {currentSection > 1 && (
                    <RKButton variant="secondary" onClick={handleBack}>
                      Back
                    </RKButton>
                  )}
                  <div className="flex gap-3 ml-auto">
                    <RKButton variant="secondary" onClick={saveDraft}>
                      Save Draft
                    </RKButton>
                    {currentSection < 8 ? (
                      <RKButton onClick={handleNext}>
                        Continue
                      </RKButton>
                    ) : (
                      <RKButton onClick={handleSubmit} disabled={submitting}>
                        {submitting ? "Submitting..." : "Submit Application"}
                      </RKButton>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <RKApplyFooter />
    </div>
  );
}
