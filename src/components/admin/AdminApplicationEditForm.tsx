import { useState } from "react";
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
import { ArrowLeft, ArrowRight, Save, X } from "lucide-react";
import { getValidatorForSection } from "@/lib/formValidation";
import { formToDbData } from "@/lib/applicationDataMapper";

interface AdminApplicationEditFormProps {
  applicationId: string;
  initialData: Partial<ChildminderApplication>;
  onCancel: () => void;
  onSaveSuccess: () => void;
}

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

  return (
    <div className="space-y-6">
      {/* Header with Save/Cancel */}
      <div className="flex items-center justify-between pb-4 border-b">
        <h2 className="text-2xl font-semibold">Editing Application</h2>
        <div className="flex gap-3">
          <GovUKButton
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </GovUKButton>
          <GovUKButton
            type="button"
            variant="primary"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </GovUKButton>
        </div>
      </div>

      <ErrorSummary errors={errors} onClose={() => setErrors([])} />

      <ProgressBar currentSection={currentSection} totalSections={totalSections} />

      <div className="bg-white p-6 rounded-xl border">
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

          {currentSection < totalSections && (
            <GovUKButton
              type="button"
              variant="primary"
              onClick={nextSection}
              className="flex items-center gap-2 ml-auto"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </GovUKButton>
          )}
        </div>
      </div>
    </div>
  );
};
