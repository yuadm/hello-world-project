import { UseFormReturn } from "react-hook-form";
import { GovUKTextarea } from "@/components/apply/GovUKTextarea";
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
}

export const ReferenceFormSection2 = ({ form }: Props) => {
  const { register, watch, setValue } = form;
  const isReliable = watch("isReliable");
  const isPatient = watch("isPatient");
  const hasGoodJudgment = watch("hasGoodJudgment");

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">2. Character Assessment</h2>

      <GovUKTextarea
        label="How would you describe the applicant's character?"
        hint="Please provide specific examples where possible"
        required
        rows={6}
        {...register("characterDescription")}
      />

      <GovUKRadio
        legend="Are they reliable and trustworthy?"
        required
        name="isReliable"
        options={[
          { value: "Yes", label: "Yes" },
          { value: "No", label: "No" },
        ]}
        value={isReliable}
        onChange={(value) => setValue("isReliable", value as "Yes" | "No")}
      />

      {isReliable === "No" && (
        <GovUKTextarea
          label="Please provide details"
          required
          rows={3}
          {...register("reliableComments")}
        />
      )}

      <GovUKRadio
        legend="Are they patient and calm under pressure?"
        required
        name="isPatient"
        options={[
          { value: "Yes", label: "Yes" },
          { value: "No", label: "No" },
        ]}
        value={isPatient}
        onChange={(value) => setValue("isPatient", value as "Yes" | "No")}
      />

      {isPatient === "No" && (
        <GovUKTextarea
          label="Please provide details"
          required
          rows={3}
          {...register("patientComments")}
        />
      )}

      <GovUKRadio
        legend="Do they demonstrate good judgment?"
        required
        name="hasGoodJudgment"
        options={[
          { value: "Yes", label: "Yes" },
          { value: "No", label: "No" },
        ]}
        value={hasGoodJudgment}
        onChange={(value) => setValue("hasGoodJudgment", value as "Yes" | "No")}
      />

      {hasGoodJudgment === "No" && (
        <GovUKTextarea
          label="Please provide details"
          required
          rows={3}
          {...register("judgmentComments")}
        />
      )}
    </div>
  );
};