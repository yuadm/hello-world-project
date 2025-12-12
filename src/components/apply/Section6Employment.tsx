import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { ChildminderApplication } from "@/types/childminder";
import { RKInput, RKSectionTitle, RKTextarea, RKRadio } from "./rk";
import { Plus } from "lucide-react";

interface Props {
  form: UseFormReturn<Partial<ChildminderApplication>>;
}

export const Section6Employment = ({ form }: Props) => {
  const { register, watch, setValue } = form;
  const employmentHistory = watch("employmentHistory") || [];

  // Initialize with one empty employment entry if none exist
  useEffect(() => {
    if (!employmentHistory || employmentHistory.length === 0) {
      setValue("employmentHistory", [{ employer: "", role: "", startDate: "", endDate: "", reasonForLeaving: "" }]);
    }
  }, []);

  const addEmployment = () => {
    setValue("employmentHistory", [
      ...employmentHistory,
      { employer: "", role: "", startDate: "", endDate: "", reasonForLeaving: "" },
    ]);
  };

  const removeEmployment = (index: number) => {
    setValue("employmentHistory", employmentHistory.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <RKSectionTitle 
        title="Employment History & References"
        description="Provide your employment history and two professional references."
      />

      {/* Employment History */}
      <div className="space-y-4">
        <div className="space-y-4">
          {employmentHistory.map((_, index) => (
            <div
              key={index}
              className="p-5 bg-white border border-gray-200 rounded-xl space-y-4"
            >
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-gray-900">Employment {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeEmployment(index)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
              <RKInput
                label="Employer name"
                required
                {...register(`employmentHistory.${index}.employer`)}
              />
              <RKInput 
                label="Job title" 
                required
                {...register(`employmentHistory.${index}.role`)} 
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RKInput
                  label="Start date"
                  type="date"
                  required
                  {...register(`employmentHistory.${index}.startDate`)}
                />
                <RKInput
                  label="End date"
                  type="date"
                  hint="Leave blank if current"
                  {...register(`employmentHistory.${index}.endDate`)}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addEmployment}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-rk-primary border-2 border-dashed border-gray-300 rounded-lg hover:border-rk-primary hover:bg-rk-primary/5 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add employment
        </button>

        <RKTextarea
          label="Explanation for gaps in employment (if any)"
          hint="Please explain any periods not covered above (e.g., parental leave, travel, unemployment)."
          {...register("employmentGaps")}
        />

        <RKRadio
          legend="Have you been employed or volunteered to work with children in the last 5 years?"
          required
          name="workedWithChildren"
          options={[
            { value: "Yes", label: "Yes" },
            { value: "No", label: "No" },
          ]}
          value={(watch("workedWithChildren") as string) || ""}
          onChange={(value) => setValue("workedWithChildren", value as "Yes" | "No")}
        />
      </div>

      {/* References */}
      <div className="space-y-4">
        <h3 className="rk-subsection-title">References</h3>
        <p className="text-sm text-gray-600 -mt-2">
          Provide details for two referees. They must not be related to you.
        </p>

        {/* Reference 1 */}
        <div className="p-5 bg-white border border-gray-200 rounded-xl space-y-4">
          <h4 className="font-semibold text-gray-900">Reference 1</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RKInput label="Full name" required {...register("reference1Name")} />
            <RKInput 
              label="How do they know you?" 
              required 
              placeholder="e.g. Manager, Colleague"
              {...register("reference1Relationship")} 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RKInput
              label="Email address"
              type="email"
              required
              {...register("reference1Contact")}
            />
            <RKInput
              label="Phone number"
              type="tel"
              {...register("reference1Phone" as any)}
            />
          </div>
          <RKRadio
            legend="Did you work with this person in a role involving children?"
            required
            name="reference1ChildcareRole"
            options={[
              { value: "Yes", label: "Yes" },
              { value: "No", label: "No" },
            ]}
            value={(watch("reference1ChildcareRole") as string) || ""}
            onChange={(value) => setValue("reference1ChildcareRole", value as "Yes" | "No")}
          />
        </div>

        {/* Reference 2 */}
        <div className="p-5 bg-white border border-gray-200 rounded-xl space-y-4">
          <h4 className="font-semibold text-gray-900">Reference 2</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RKInput label="Full name" required {...register("reference2Name")} />
            <RKInput 
              label="How do they know you?" 
              required 
              placeholder="e.g. Manager, Colleague"
              {...register("reference2Relationship")} 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RKInput
              label="Email address"
              type="email"
              required
              {...register("reference2Contact")}
            />
            <RKInput
              label="Phone number"
              type="tel"
              {...register("reference2Phone" as any)}
            />
          </div>
          <RKRadio
            legend="Did you work with this person in a role involving children?"
            required
            name="reference2ChildcareRole"
            options={[
              { value: "Yes", label: "Yes" },
              { value: "No", label: "No" },
            ]}
            value={(watch("reference2ChildcareRole") as string) || ""}
            onChange={(value) => setValue("reference2ChildcareRole", value as "Yes" | "No")}
          />
        </div>
      </div>
    </div>
  );
};
