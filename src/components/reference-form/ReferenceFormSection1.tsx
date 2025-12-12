import { UseFormReturn } from "react-hook-form";
import { GovUKInput } from "@/components/apply/GovUKInput";
import { GovUKRadio } from "@/components/apply/GovUKRadio";

interface ReferenceFormData {
  confirmedRelationship: string;
  knownForYears: string;
  characterDescription: string;
  isReliable: "Yes" | "No" | "";
  reliableComments?: string;
  isPatient: "Yes" | "No" | "";
  patientComments?: string;
  hasGoodJudgment: "Yes" | "No" | "";
  judgmentComments?: string;
  observedWithChildren?: "Yes" | "No" | "";
  interactionDescription?: string;
  suitabilityConcerns?: string;
  integrityConcerns: "Yes" | "No" | "";
  integrityConcernsDetails?: string;
  wouldRecommend: "Yes" | "No" | "";
  recommendationComments?: string;
  additionalInformation?: string;
  declarationAccurate: boolean;
  signatureName: string;
  signatureDate: string;
}

interface Props {
  form: UseFormReturn<Partial<ReferenceFormData>>;
  refereeName: string;
  applicantName: string;
}

export const ReferenceFormSection1 = ({ form, refereeName, applicantName }: Props) => {
  const { register, watch, setValue } = form;

  return (
    <div className="space-y-6">
      <div className="p-4 bg-[hsl(var(--govuk-inset-blue-bg))] border-l-[10px] border-[hsl(var(--govuk-blue))]">
        <p className="text-sm">
          <strong>Applicant:</strong> {applicantName}
        </p>
        <p className="text-sm mt-1">
          <strong>Your name:</strong> {refereeName}
        </p>
      </div>

      <h2 className="text-2xl font-bold text-foreground">1. Confirmation</h2>

      <GovUKInput
        label="Please confirm your relationship to the applicant"
        hint="For example: Former employer, colleague, friend, etc."
        required
        {...register("confirmedRelationship")}
      />

      <GovUKInput
        label="How long have you known the applicant?"
        hint="For example: 5 years, 10 years, etc."
        required
        {...register("knownForYears")}
      />
    </div>
  );
};