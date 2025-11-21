import { UseFormReturn } from "react-hook-form";
import { ChildminderApplication } from "@/types/childminder";
import { GovUKInput } from "./GovUKInput";
import { GovUKTextarea } from "./GovUKTextarea";
import { GovUKButton } from "./GovUKButton";
import { GovUKRadio } from "./GovUKRadio";
import { Plus, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { calculateEmploymentCoverage } from "@/lib/employmentHistoryCalculator";
import { format } from "date-fns";

interface Props {
  form: UseFormReturn<Partial<ChildminderApplication>>;
}

export const Section6Employment = ({ form }: Props) => {
  const { register, watch, setValue } = form;
  const employmentHistory = watch("employmentHistory") || [];
  const childVolunteered = watch("childVolunteered");

  // Calculate employment coverage
  const coverage = calculateEmploymentCoverage(employmentHistory);

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
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-foreground">6. Employment History & References</h2>

      <h3 className="text-xl font-bold">Employment/Education History</h3>
      <p className="text-base">
        Please provide details of your employment or education for the last 5 years. We need a complete 5-year history.
      </p>

      {/* Coverage Indicator */}
      {employmentHistory.length > 0 && (
        <div className={`p-4 border-l-[10px] ${
          coverage.isComplete 
            ? "border-[hsl(var(--govuk-green))] bg-[hsl(var(--govuk-inset-blue-bg))]"
            : "border-[hsl(var(--govuk-orange))] bg-[hsl(var(--govuk-inset-blue-bg))]"
        }`}>
          <div className="flex items-start gap-2">
            {coverage.isComplete ? (
              <CheckCircle2 className="h-5 w-5 text-[hsl(var(--govuk-green))] mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-[hsl(var(--govuk-orange))] mt-0.5 flex-shrink-0" />
            )}
            <div className="space-y-2">
              <p className="text-sm font-bold">
                5-Year Coverage: {coverage.percentageCovered}%
              </p>
              <div className="w-full bg-white border border-border rounded-none h-6 overflow-hidden">
                <div
                  className={`h-full ${
                    coverage.isComplete ? "bg-[hsl(var(--govuk-green))]" : "bg-[hsl(var(--govuk-orange))]"
                  }`}
                  style={{ width: `${Math.min(coverage.percentageCovered, 100)}%` }}
                />
              </div>
              <p className="text-sm">
                {coverage.isComplete
                  ? "✓ Complete 5-year employment/education history provided"
                  : `You have covered ${coverage.coveredMonths} of 60 months (5 years)`}
              </p>
              {coverage.hasGaps && coverage.gaps.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-bold">Gaps detected:</p>
                  <ul className="text-sm list-disc list-inside">
                    {coverage.gaps.map((gap, idx) => (
                      <li key={idx}>
                        {format(gap.start, "MMM yyyy")} to {format(gap.end, "MMM yyyy")} ({gap.months} months)
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm mt-2">
                    Please add more employment/education entries or explain these gaps below.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {employmentHistory.length === 0 && (
        <div className="p-4 border-l-[10px] border-[hsl(var(--govuk-blue))] bg-[hsl(var(--govuk-inset-blue-bg))]">
          <p className="text-sm">
            Click "Add employment/education entry" below to start providing your 5-year history.
          </p>
        </div>
      )}

      {employmentHistory.map((_, index) => (
        <div
          key={index}
          className="p-6 bg-[hsl(var(--govuk-grey-background))] border-l-4 border-[hsl(var(--govuk-grey-border))] space-y-4"
        >
          <div className="flex justify-between items-center">
            <h4 className="font-semibold">Employment/Education Entry {index + 1}</h4>
            <button
              type="button"
              onClick={() => removeEmployment(index)}
              className="text-[hsl(var(--govuk-red))] hover:underline flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
          </div>
          <GovUKInput
            label="Employer/Institution"
            {...register(`employmentHistory.${index}.employer`)}
          />
          <GovUKInput label="Role/Course" {...register(`employmentHistory.${index}.role`)} />
          <div className="grid grid-cols-2 gap-4">
            <GovUKInput
              label="Start date"
              type="date"
              {...register(`employmentHistory.${index}.startDate`)}
            />
            <GovUKInput
              label="End date"
              type="date"
              {...register(`employmentHistory.${index}.endDate`)}
            />
          </div>
          <GovUKTextarea
            label="Reason for leaving"
            rows={2}
            {...register(`employmentHistory.${index}.reasonForLeaving`)}
          />
        </div>
      ))}

      <GovUKButton
        type="button"
        variant="secondary"
        onClick={addEmployment}
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Add employment/education entry
      </GovUKButton>

      <GovUKTextarea
        label="Explain any gaps in employment/education history"
        hint="If there are gaps in your 5-year history, please explain what you were doing during those periods (e.g., caring for family, traveling, unemployed, etc.)."
        rows={4}
        {...register("employmentGaps")}
      />

      <GovUKRadio
        legend="Have you previously worked or volunteered with children?"
        required
        name="childVolunteered"
        options={[
          { value: "Yes", label: "Yes" },
          { value: "No", label: "No" },
        ]}
        value={childVolunteered || "No"}
        onChange={(value) => setValue("childVolunteered", value as "Yes" | "No")}
      />

      {childVolunteered === "Yes" && (
        <div className="flex items-start space-x-3 p-4 border border-border rounded">
          <input
            type="checkbox"
            id="childVolunteeredConsent"
            {...register("childVolunteeredConsent")}
            className="mt-1 w-6 h-6 cursor-pointer appearance-none border-2 border-[hsl(var(--govuk-black))] checked:before:content-['✔'] checked:before:block checked:before:text-center checked:before:text-xl checked:before:leading-5"
          />
          <div className="space-y-1">
            <label htmlFor="childVolunteeredConsent" className="text-base font-medium cursor-pointer">
              I consent to Ready Kids contacting my previous employers/organizations
            </label>
            <p className="text-sm text-[hsl(var(--govuk-text-secondary))]">
              We may need to verify your experience working with children.
            </p>
          </div>
        </div>
      )}

      <h3 className="text-xl font-bold border-t pt-6">References</h3>
      <p className="text-base">Please provide two references who have known you for at least 2 years.</p>

      {/* Reference 1 */}
      <div className="p-6 bg-[hsl(var(--govuk-grey-background))] border-l-4 border-[hsl(var(--govuk-grey-border))] space-y-4">
        <h4 className="font-semibold">Reference 1</h4>
        <GovUKInput label="Full name" required {...register("reference1Name")} />
        <GovUKInput label="Relationship to you" required {...register("reference1Relationship")} />
        <GovUKInput
          label="Contact details (email or phone)"
          required
          {...register("reference1Contact")}
        />
        <GovUKRadio
          legend="Is this a childcare-related reference?"
          required
          name="reference1Childcare"
          options={[
            { value: "Yes", label: "Yes" },
            { value: "No", label: "No" },
          ]}
          value={watch("reference1Childcare") || "No"}
          onChange={(value) => setValue("reference1Childcare", value as "Yes" | "No")}
        />
      </div>

      {/* Reference 2 */}
      <div className="p-6 bg-[hsl(var(--govuk-grey-background))] border-l-4 border-[hsl(var(--govuk-grey-border))] space-y-4">
        <h4 className="font-semibold">Reference 2</h4>
        <GovUKInput label="Full name" required {...register("reference2Name")} />
        <GovUKInput label="Relationship to you" required {...register("reference2Relationship")} />
        <GovUKInput
          label="Contact details (email or phone)"
          required
          {...register("reference2Contact")}
        />
        <GovUKRadio
          legend="Is this a childcare-related reference?"
          required
          name="reference2Childcare"
          options={[
            { value: "Yes", label: "Yes" },
            { value: "No", label: "No" },
          ]}
          value={watch("reference2Childcare") || "No"}
          onChange={(value) => setValue("reference2Childcare", value as "Yes" | "No")}
        />
      </div>
    </div>
  );
};
