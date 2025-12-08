import { UseFormReturn } from "react-hook-form";
import { ChildminderApplication } from "@/types/childminder";
import { RKInput, RKTextarea, RKRadio, RKSectionTitle, RKInfoBox, RKCheckbox } from "./rk";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  form: UseFormReturn<Partial<ChildminderApplication>>;
}

export const Section6Employment = ({ form }: Props) => {
  const { register, watch, setValue } = form;
  const employmentHistory = watch("employmentHistory") || [];
  const childVolunteered = watch("childVolunteered");

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

      {/* Employment History Subsection */}
      <div className="space-y-4">
        <h3 className="rk-subsection-title">Employment/Education History</h3>
        <p className="text-sm text-gray-600 -mt-2">
          Please provide details of your employment or education for the last 5 years. We need a complete 5-year history.
        </p>

        {employmentHistory.length === 0 && (
          <RKInfoBox type="info">
            Click "Add employment" below to start providing your 5-year history.
          </RKInfoBox>
        )}

        <div className="space-y-4">
          {employmentHistory.map((_, index) => (
            <div
              key={index}
              className="p-5 bg-gray-50 border border-gray-200 rounded-xl space-y-4"
            >
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-gray-900">Entry {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeEmployment(index)}
                  className="text-red-600 hover:text-red-700 flex items-center gap-1 text-sm"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RKInput
                  label="Employer/Institution"
                  required
                  {...register(`employmentHistory.${index}.employer`)}
                />
                <RKInput 
                  label="Role/Course" 
                  required
                  {...register(`employmentHistory.${index}.role`)} 
                />
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
              <RKTextarea
                label="Reason for leaving"
                rows={2}
                {...register(`employmentHistory.${index}.reasonForLeaving`)}
              />
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
          label="Explain any gaps in employment/education history"
          hint="If there are gaps in your 5-year history, please explain what you were doing during those periods."
          rows={4}
          {...register("employmentGaps")}
        />

        <RKRadio
          legend="Have you previously worked or volunteered with children?"
          required
          name="childVolunteered"
          options={[
            { value: "Yes", label: "Yes" },
            { value: "No", label: "No" },
          ]}
          value={childVolunteered || ""}
          onChange={(value) => setValue("childVolunteered", value as "Yes" | "No")}
        />

        {childVolunteered === "Yes" && (
          <RKCheckbox
            name="childVolunteeredConsent"
            label="I consent to Ready Kids contacting my previous employers/organizations"
            hint="We may need to verify your experience working with children."
            checked={watch("childVolunteeredConsent") || false}
            onChange={(checked) => setValue("childVolunteeredConsent", checked)}
          />
        )}
      </div>

      {/* References Subsection */}
      <div className="space-y-4">
        <h3 className="rk-subsection-title">References</h3>
        <p className="text-sm text-gray-600 -mt-2">
          Provide details for two referees. They must not be related to you.
        </p>

        {/* Reference 1 */}
        <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
          <h4 className="font-semibold text-gray-900">Reference 1</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RKInput label="Full name" required {...register("reference1Name")} />
            <RKInput label="Relationship to you" required {...register("reference1Relationship")} />
          </div>
          <RKInput
            label="Contact details (email or phone)"
            required
            {...register("reference1Contact")}
          />
          <RKRadio
            legend="Is this a childcare-related reference?"
            required
            name="reference1Childcare"
            options={[
              { value: "Yes", label: "Yes" },
              { value: "No", label: "No" },
            ]}
            value={watch("reference1Childcare") || ""}
            onChange={(value) => setValue("reference1Childcare", value as "Yes" | "No")}
          />
        </div>

        {/* Reference 2 */}
        <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
          <h4 className="font-semibold text-gray-900">Reference 2</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RKInput label="Full name" required {...register("reference2Name")} />
            <RKInput label="Relationship to you" required {...register("reference2Relationship")} />
          </div>
          <RKInput
            label="Contact details (email or phone)"
            required
            {...register("reference2Contact")}
          />
          <RKRadio
            legend="Is this a childcare-related reference?"
            required
            name="reference2Childcare"
            options={[
              { value: "Yes", label: "Yes" },
              { value: "No", label: "No" },
            ]}
            value={watch("reference2Childcare") || ""}
            onChange={(value) => setValue("reference2Childcare", value as "Yes" | "No")}
          />
        </div>
      </div>
    </div>
  );
};
