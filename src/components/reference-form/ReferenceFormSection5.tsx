import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { GovUKInput } from "@/components/apply/GovUKInput";
import { format } from "date-fns";

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

export const ReferenceFormSection5 = ({ form }: Props) => {
  const { register, setValue, watch } = form;
  const declarationAccurate = watch("declarationAccurate");

  // Set current date on mount
  useEffect(() => {
    setValue("signatureDate", format(new Date(), "yyyy-MM-dd"));
  }, [setValue]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">5. Declaration</h2>

      <div className="p-6 bg-[hsl(var(--govuk-grey-background))] border-l-4 border-[hsl(var(--govuk-grey-border))] space-y-4">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="declarationAccurate"
            {...register("declarationAccurate")}
            className="mt-1 w-6 h-6 cursor-pointer appearance-none border-2 border-[hsl(var(--govuk-black))] checked:before:content-['✔'] checked:before:block checked:before:text-center checked:before:text-xl checked:before:leading-5"
          />
          <div>
            <label htmlFor="declarationAccurate" className="text-base font-medium cursor-pointer">
              I declare that the information I have provided in this reference is accurate and honest to the best of my knowledge
            </label>
            <p className="text-sm text-[hsl(var(--govuk-text-secondary))] mt-1">
              I understand that this reference will be used to assess the applicant's suitability to work with children and that providing false information could have serious consequences.
            </p>
          </div>
        </div>
      </div>

      <GovUKInput
        label="Full name (signature)"
        hint="Type your full name as your electronic signature"
        required
        {...register("signatureName")}
      />

      <GovUKInput
        label="Date"
        type="date"
        required
        {...register("signatureDate")}
      />
    </div>
  );
};