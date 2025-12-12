import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ChildminderApplication } from "@/types/childminder";
import { RKProgressCard } from "@/components/apply/rk/RKProgressCard";
import { RKSectionNav } from "@/components/apply/rk/RKSectionNav";
import { RKFormHeader } from "@/components/apply/rk/RKFormHeader";
import { RKButton } from "@/components/apply/rk/RKButton";
import { Section1PersonalDetails } from "@/components/apply/Section1PersonalDetails";
import { Section2AddressHistory } from "@/components/apply/Section2AddressHistory";
import { Section3Premises } from "@/components/apply/Section3Premises";
import { Section4Service } from "@/components/apply/Section4Service";
import { Section5Qualifications } from "@/components/apply/Section5Qualifications";
import { Section6Employment } from "@/components/apply/Section6Employment";
import { Section7People } from "@/components/apply/Section7People";
import { Section8Suitability } from "@/components/apply/Section8Suitability";
import { Section9Declaration } from "@/components/apply/Section9Declaration";
import { ArrowLeft, ArrowRight, Save, X, AlertCircle } from "lucide-react";
import { getValidatorForSection } from "@/lib/formValidation";
import { formToDbData } from "@/lib/applicationDataMapper";

interface AdminApplicationEditFormProps {
  applicationId: string;
  initialData: Partial<ChildminderApplication>;
  onCancel: () => void;
  onSaveSuccess: () => void;
}

const sections = [
  { id: 1, label: "Personal Details" },
  { id: 2, label: "Address History" },
  { id: 3, label: "Premises" },
  { id: 4, label: "Service Details" },
  { id: 5, label: "Qualifications" },
  { id: 6, label: "Employment" },
  { id: 7, label: "People" },
  { id: 8, label: "Suitability" },
  { id: 9, label: "Declaration" },
];

export const AdminApplicationEditForm = ({
  applicationId,
  initialData,
  onCancel,
  onSaveSuccess,
}: AdminApplicationEditFormProps) => {
  const [currentSection, setCurrentSection] = useState(1);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const totalSections = 9;

  const form = useForm<Partial<ChildminderApplication>>({
    defaultValues: initialData,
  });

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

  const goToSection = (sectionNumber: number) => {
    setErrors([]);
    setCurrentSection(sectionNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const syncComplianceTables = async (data: Partial<ChildminderApplication>) => {
    // Sync assistants from assistants array
    const assistants = data.assistants || [];
    for (const assistant of assistants) {
      if (!assistant.firstName || !assistant.lastName) continue;
      
      // Try to find existing assistant by matching name
      const { data: existingAssistants } = await supabase
        .from("compliance_assistants")
        .select("id, first_name, last_name, date_of_birth")
        .eq("application_id", applicationId);

      // Find matching assistant by original or similar name
      const matchingAssistant = existingAssistants?.find(
        (a) => 
          (a.first_name?.toLowerCase() === assistant.firstName?.toLowerCase() ||
           a.last_name?.toLowerCase() === assistant.lastName?.toLowerCase())
      );

      if (matchingAssistant) {
        await supabase
          .from("compliance_assistants")
          .update({
            first_name: assistant.firstName,
            last_name: assistant.lastName,
            date_of_birth: assistant.dob || matchingAssistant.date_of_birth,
            role: assistant.role || "Assistant",
            email: assistant.email,
            phone: assistant.phone,
            updated_at: new Date().toISOString(),
          })
          .eq("id", matchingAssistant.id);
      }
    }

    // Sync household members from adults and children arrays
    const adults = data.adults || [];
    const children = data.children || [];
    
    for (const adult of adults) {
      if (!adult.fullName) continue;

      const { data: existingMembers } = await supabase
        .from("compliance_household_members")
        .select("id, full_name, date_of_birth")
        .eq("application_id", applicationId)
        .eq("member_type", "adult");

      // Find matching member by name
      const matchingMember = existingMembers?.find(
        (m) => m.full_name?.toLowerCase().includes(adult.fullName?.toLowerCase().split(' ')[0] || '')
      );

      if (matchingMember) {
        await supabase
          .from("compliance_household_members")
          .update({
            full_name: adult.fullName,
            relationship: adult.relationship,
            date_of_birth: adult.dob || matchingMember.date_of_birth,
            updated_at: new Date().toISOString(),
          })
          .eq("id", matchingMember.id);
      }
    }

    for (const child of children) {
      if (!child.fullName) continue;

      const { data: existingMembers } = await supabase
        .from("compliance_household_members")
        .select("id, full_name, date_of_birth")
        .eq("application_id", applicationId)
        .eq("member_type", "child");

      const matchingMember = existingMembers?.find(
        (m) => m.full_name?.toLowerCase().includes(child.fullName?.toLowerCase().split(' ')[0] || '')
      );

      if (matchingMember) {
        await supabase
          .from("compliance_household_members")
          .update({
            full_name: child.fullName,
            date_of_birth: child.dob || matchingMember.date_of_birth,
            updated_at: new Date().toISOString(),
          })
          .eq("id", matchingMember.id);
      }
    }
  };

  const handleSave = async () => {
    const data = form.getValues();

    // Final validation of all sections
    const allErrors: string[] = [];
    for (let section = 1; section <= totalSections; section++) {
      const validator = getValidatorForSection(section);
      const validation = validator(data);
      if (!validation.isValid) {
        allErrors.push(...validation.errors.map((err) => `Section ${section}: ${err}`));
      }
    }

    if (allErrors.length > 0) {
      setErrors(allErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast.error("Please fix all errors before saving");
      return;
    }

    setSaving(true);
    try {
      const dbData = formToDbData(data);

      const { error } = await supabase
        .from("childminder_applications")
        .update(dbData as any)
        .eq("id", applicationId);

      if (error) throw error;

      // Sync compliance tables with updated data
      await syncComplianceTables(data);

      toast.success("Application updated successfully");
      onSaveSuccess();
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(`Failed to save changes: ${error.message || "Please try again."}`);
    } finally {
      setSaving(false);
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

  const currentSectionTitle = sections.find(s => s.id === currentSection)?.label || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E8F5F0]">
      {/* Header with Save/Cancel */}
      <div className="bg-white border-b border-border/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Editing Application</h1>
              <p className="text-sm text-muted-foreground">Make changes to the application details</p>
            </div>
            <div className="flex gap-3">
              <RKButton
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={saving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </RKButton>
              <RKButton
                type="button"
                variant="primary"
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </RKButton>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Summary */}
        {errors.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-red-800 mb-2">Please fix the following errors:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="text-sm text-red-700">{error}</li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => setErrors([])}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <RKProgressCard
              currentSection={currentSection}
              totalSections={totalSections}
            />
            <RKSectionNav
              sections={sections}
              currentSection={currentSection}
              onSectionClick={goToSection}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[20px] shadow-lg overflow-hidden">
              <RKFormHeader
                title={`Section ${currentSection}: ${currentSectionTitle}`}
              />
              
              <div className="p-6 sm:p-8">
                {renderSection()}

                {/* Navigation Buttons */}
                <div className="flex gap-4 mt-8 pt-6 border-t border-border/50">
                  {currentSection > 1 && (
                    <RKButton
                      type="button"
                      variant="secondary"
                      onClick={prevSection}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Previous
                    </RKButton>
                  )}

                  {currentSection < totalSections && (
                    <RKButton
                      type="button"
                      variant="primary"
                      onClick={nextSection}
                      className="ml-auto"
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </RKButton>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
