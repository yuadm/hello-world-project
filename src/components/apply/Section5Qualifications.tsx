import { UseFormReturn } from "react-hook-form";
import { ChildminderApplication } from "@/types/childminder";
import { RKRadio, RKInput, RKSectionTitle, RKInfoBox } from "./rk";
import { Info } from "lucide-react";
import { useState } from "react";

interface Props {
  form: UseFormReturn<Partial<ChildminderApplication>>;
}

interface TrainingCardProps {
  title: string;
  subtitle?: string;
  question: string;
  hint?: string;
  required?: boolean;
  name: string;
  value: string;
  onChange: (value: string) => void;
  children?: React.ReactNode;
}

const TrainingCard = ({ 
  title, 
  subtitle, 
  question, 
  hint, 
  required, 
  name, 
  value, 
  onChange,
  children 
}: TrainingCardProps) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="mb-4">
        <h4 className="text-base font-semibold text-gray-900">
          {title}
          {subtitle && <span className="font-normal text-gray-500"> {subtitle}</span>}
        </h4>
      </div>
      
      <div className="space-y-4">
        <RKRadio
          legend={question}
          hint={hint}
          required={required}
          name={name}
          options={[
            { value: "Yes", label: "Yes" },
            { value: "No", label: "No" },
          ]}
          value={value}
          onChange={onChange}
        />
        
        {children}
      </div>
    </div>
  );
};

export const Section5Qualifications = ({ form }: Props) => {
  const { register, watch, setValue } = form;
  const ageGroups = watch("ageGroups") || [];
  const firstAidCompleted = watch("firstAid.completed");
  const firstAidCompletionDate = watch("firstAid.completionDate");

  // Calculate if first aid is older than 3 years
  const isFirstAidExpired = (): boolean => {
    if (!firstAidCompletionDate) return false;
    const completionDate = new Date(firstAidCompletionDate);
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
    return completionDate < threeYearsAgo;
  };

  const requires0to5 = ageGroups.includes("0-5");
  const requires5to7 = ageGroups.includes("5-7");
  const requires8plus = ageGroups.includes("8+");
  const hasAnyAgeGroup = requires0to5 || requires5to7 || requires8plus;

  const firstAidLabel = requires0to5
    ? "Paediatric First Aid (PFA)"
    : "Appropriate First Aid";
  const firstAidQuestion = requires0to5
    ? "Have you completed a 12-hour Paediatric First Aid course?"
    : "Have you completed an appropriate first aid qualification?";

  return (
    <div className="space-y-6">
      <RKSectionTitle 
        title="Qualifications & Training"
        description="You must have completed the required training before registration. We will verify certificates during your pre-registration visit."
      />

      {/* Food Hygiene - Always shown first as recommended */}
      <TrainingCard
        title="Food Hygiene"
        subtitle="(Recommended)"
        question="Have you completed food hygiene training?"
        hint="This is recommended if you will be preparing food for children."
        name="foodHygiene.completed"
        value={watch("foodHygiene.completed") || ""}
        onChange={(value) => setValue("foodHygiene.completed", value as "Yes" | "No")}
      >
        {watch("foodHygiene.completed") === "Yes" && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <RKInput label="Training provider" {...register("foodHygiene.provider")} />
            <RKInput label="Completion date" type="date" widthClass="10" {...register("foodHygiene.completionDate")} />
          </div>
        )}
      </TrainingCard>

      {/* Info box when no age groups selected */}
      {!hasAnyAgeGroup && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-gray-700">
            Please select at least one age group in the previous section to see your required training.
          </p>
        </div>
      )}

      {/* First Aid - Only show when age groups are selected */}
      {hasAnyAgeGroup && (
        <TrainingCard
          title={firstAidLabel}
          question={firstAidQuestion}
          required
          name="firstAid.completed"
          value={firstAidCompleted || ""}
          onChange={(value) => setValue("firstAid.completed", value as "Yes" | "No")}
        >
          {firstAidCompleted === "Yes" && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <RKInput
                label="Training provider"
                required
                {...register("firstAid.provider")}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <RKInput
                  label="Completion date"
                  type="date"
                  required
                  {...register("firstAid.completionDate")}
                />
                <RKInput
                  label="Certificate number"
                  {...register("firstAid.certificateNumber")}
                />
              </div>

              {isFirstAidExpired() && (
                <RKInfoBox type="warning">
                  Your first aid certificate is more than 3 years old. You will need to renew it before your registration can be approved.
                </RKInfoBox>
              )}
            </div>
          )}

          {firstAidCompleted === "No" && (
            <RKInfoBox type="error">
              You must complete {requires0to5 ? "a 12-hour Paediatric First Aid course" : "an appropriate first aid qualification"} before your registration can be approved.
            </RKInfoBox>
          )}
        </TrainingCard>
      )}

      {/* Safeguarding */}
      {(requires0to5 || requires5to7) && (
        <TrainingCard
          title="Safeguarding Training"
          question="Have you completed safeguarding children training?"
          required
          name="safeguarding.completed"
          value={watch("safeguarding.completed") || ""}
          onChange={(value) => setValue("safeguarding.completed", value as "Yes" | "No")}
        >
          {watch("safeguarding.completed") === "Yes" && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <RKInput label="Training provider" {...register("safeguarding.provider")} />
              <RKInput label="Completion date" type="date" widthClass="10" {...register("safeguarding.completionDate")} />
            </div>
          )}
        </TrainingCard>
      )}

      {/* EYFS/Childminding Course */}
      {requires5to7 && (
        <TrainingCard
          title="EYFS/Childminding Course"
          question="Have you completed an EYFS or childminding-specific course?"
          required
          name="eyfsChildminding.completed"
          value={watch("eyfsChildminding.completed") || ""}
          onChange={(value) => setValue("eyfsChildminding.completed", value as "Yes" | "No")}
        >
          {watch("eyfsChildminding.completed") === "Yes" && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <RKInput label="Training provider" {...register("eyfsChildminding.provider")} />
              <RKInput label="Completion date" type="date" widthClass="10" {...register("eyfsChildminding.completionDate")} />
            </div>
          )}
        </TrainingCard>
      )}

      {/* Level 2 Qualification */}
      {requires8plus && (
        <TrainingCard
          title="Level 2 Qualification"
          question="Do you hold a Level 2 qualification in childcare or education?"
          required
          name="level2Qual.completed"
          value={watch("level2Qual.completed") || ""}
          onChange={(value) => setValue("level2Qual.completed", value as "Yes" | "No")}
        >
          {watch("level2Qual.completed") === "Yes" && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <RKInput label="Qualification name" {...register("level2Qual.provider")} />
              <RKInput label="Completion date" type="date" widthClass="10" {...register("level2Qual.completionDate")} />
            </div>
          )}
        </TrainingCard>
      )}
    </div>
  );
};
