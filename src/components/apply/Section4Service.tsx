import { UseFormReturn } from "react-hook-form";
import { ChildminderApplication } from "@/types/childminder";
import { GovUKRadio } from "./GovUKRadio";
import { GovUKInput } from "./GovUKInput";
import { GovUKSelect } from "./GovUKSelect";
import { GovUKButton } from "./GovUKButton";
import { useMemo } from "react";
import { AlertCircle, CheckCircle2, Info, Plus, Trash2 } from "lucide-react";
import {
  calculateCapacityRatios,
  validateCapacity,
  getCapacityGuidanceText,
} from "@/lib/capacityCalculator";

interface Props {
  form: UseFormReturn<Partial<ChildminderApplication>>;
}

export const Section4Service = ({ form }: Props) => {
  const { register, watch, setValue } = form;
  const ageGroups = watch("ageGroups") || [];
  const workWithOthers = watch("workWithOthers");
  const numberOfAssistants = watch("numberOfAssistants") || 1;
  const assistants = watch("assistants") || [];
  const proposedUnder1 = watch("proposedUnder1") || 0;
  const proposedUnder5 = watch("proposedUnder5") || 0;
  const proposed5to8 = watch("proposed5to8") || 0;
  const proposed8plus = watch("proposed8plus") || 0;

  const toggleAgeGroup = (ageGroup: string) => {
    if (ageGroups.includes(ageGroup)) {
      setValue("ageGroups", ageGroups.filter((g) => g !== ageGroup));
    } else {
      setValue("ageGroups", [...ageGroups, ageGroup]);
    }
  };

  const addAssistant = () => {
    setValue("assistants", [...assistants, { firstName: "", lastName: "", dob: "", role: "", email: "", phone: "" }]);
  };

  const removeAssistant = (index: number) => {
    setValue("assistants", assistants.filter((_, i) => i !== index));
  };

  // Calculate capacity ratios
  const capacityRatios = useMemo(() => {
    return calculateCapacityRatios(workWithOthers, numberOfAssistants);
  }, [workWithOthers, numberOfAssistants]);

  // Validate proposed numbers
  const validation = useMemo(() => {
    return validateCapacity(
      {
        under1: proposedUnder1,
        under5: proposedUnder5,
        age5to8: proposed5to8,
        age8plus: proposed8plus,
      },
      capacityRatios
    );
  }, [proposedUnder1, proposedUnder5, proposed5to8, proposed8plus, capacityRatios]);

  const guidanceText = getCapacityGuidanceText(capacityRatios);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-foreground">4. Your Childminding Service</h2>

      <div className="space-y-4">
        <h3 className="text-lg font-bold">
          Which age groups will you care for?<span className="text-[hsl(var(--govuk-red))] ml-1">*</span>
        </h3>
        <div className="space-y-3">
          {[
            { value: "0-5", label: "Children aged 0-5 years (Early Years Foundation Stage)" },
            { value: "5-7", label: "Children aged 5-7 years" },
            { value: "8+", label: "Children aged 8 years and over" },
          ].map((option) => (
            <div key={option.value} className="flex items-center relative pl-10">
              <input
                type="checkbox"
                id={`ageGroup-${option.value}`}
                checked={ageGroups.includes(option.value)}
                onChange={() => toggleAgeGroup(option.value)}
                className="absolute left-0 top-0 w-6 h-6 cursor-pointer appearance-none border-2 border-[hsl(var(--govuk-black))] checked:before:content-['✔'] checked:before:block checked:before:text-center checked:before:text-xl checked:before:leading-5 checked:before:text-[hsl(var(--govuk-black))] focus:outline-none focus:ring-[3px] focus:ring-[hsl(var(--govuk-focus-yellow))] focus:ring-offset-0"
              />
              <label htmlFor={`ageGroup-${option.value}`} className="text-base cursor-pointer">
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <GovUKRadio
        legend="Will you work with any assistants or co-childminders?"
        required
        name="workWithOthers"
        options={[
          { value: "Yes", label: "Yes" },
          { value: "No", label: "No" },
        ]}
        value={workWithOthers}
        onChange={(value) => setValue("workWithOthers", value as "Yes" | "No")}
      />

      {workWithOthers === "Yes" && (
        <div className="space-y-4">
          <GovUKInput
            label="How many assistants/co-childminders?"
            type="number"
            required
            widthClass="10"
            min="1"
            max="3"
            hint="Maximum 3 assistants"
            {...register("numberOfAssistants", { valueAsNumber: true })}
          />
          
          {numberOfAssistants > 3 && (
            <div className="p-4 border-l-[10px] border-[hsl(var(--govuk-red))] bg-[hsl(var(--govuk-inset-red-bg))] flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-[hsl(var(--govuk-red))] flex-shrink-0 mt-0.5" />
              <p className="text-sm">
                You cannot work with more than 3 assistants. Please adjust the number.
              </p>
            </div>
          )}

          {/* Assistants Details */}
          <div className="space-y-6 border-t pt-6">
            <div className="p-4 border-l-[5px] border-[hsl(var(--govuk-blue))] bg-[hsl(var(--govuk-inset-blue-bg))]">
              <h3 className="text-xl font-bold mb-2">Assistants and Co-childminders Details</h3>
              <p className="text-sm">
                Anyone working with you must complete a full suitability check (Form CMA-A1). 
                Please provide their basic details below so we can initiate their application.
              </p>
            </div>
            
            {assistants.map((_, index) => (
              <div
                key={index}
                className="p-6 bg-[hsl(var(--govuk-grey-background))] border-l-4 border-[hsl(var(--govuk-grey-border))] space-y-4"
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-lg">Person {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeAssistant(index)}
                    className="text-[hsl(var(--govuk-red))] hover:underline flex items-center gap-1 font-bold"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove this person
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <GovUKInput
                    label="First name"
                    required
                    {...register(`assistants.${index}.firstName`)}
                  />
                  <GovUKInput
                    label="Last name"
                    required
                    {...register(`assistants.${index}.lastName`)}
                  />
                  
                  <GovUKInput
                    label="Date of birth"
                    hint="dd/mm/yyyy"
                    type="date"
                    required
                    {...register(`assistants.${index}.dob`)}
                  />
                  <GovUKSelect
                    label="Role"
                    required
                    options={[
                      { value: "", label: "Select role" },
                      { value: "Assistant", label: "Assistant" },
                      { value: "Co-childminder", label: "Co-childminder" }
                    ]}
                    {...register(`assistants.${index}.role`)}
                  />
                  
                  <GovUKInput
                    label="Email address"
                    type="email"
                    required
                    {...register(`assistants.${index}.email`)}
                  />
                  <GovUKInput
                    label="Mobile number"
                    type="tel"
                    required
                    {...register(`assistants.${index}.phone`)}
                  />
                </div>
              </div>
            ))}
            
            <GovUKButton
              type="button"
              variant="secondary"
              onClick={addAssistant}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add person
            </GovUKButton>
          </div>
        </div>
      )}

      {/* Capacity Guidance Info Box */}
      <div className="p-4 border-l-[10px] border-[hsl(var(--govuk-blue))] bg-[hsl(var(--govuk-inset-blue-bg))]">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-[hsl(var(--govuk-blue))] flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-base font-bold mb-2">Your Maximum Capacity</h3>
            <p className="text-sm mb-2">
              Based on {capacityRatios.totalAdults} adult{capacityRatios.totalAdults > 1 ? "s" : ""}, these are your standard ratios (subject to Ofsted approval):
            </p>
            <ul className="list-disc list-inside text-sm space-y-1">
              {guidanceText.map((text, index) => (
                <li key={index}>{text}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Real-time Capacity Validation */}
      {(proposedUnder1 > 0 || proposedUnder5 > 0 || proposed5to8 > 0 || proposed8plus > 0) && (
        <div className="space-y-3">
          {validation.isValid && validation.warnings.length === 0 && (
            <div className="p-4 border-l-[10px] border-[hsl(var(--govuk-green))] bg-[hsl(var(--govuk-inset-green-bg))] flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-[hsl(var(--govuk-green))] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm mb-1">✓ Your proposed numbers are within limits</p>
                <p className="text-sm">
                  Total under 5: {validation.totalUnder5} of {capacityRatios.maxUnder5} | 
                  Total under 8: {validation.totalUnder8} of {capacityRatios.maxUnder8}
                </p>
              </div>
            </div>
          )}

          {validation.warnings.length > 0 && validation.isValid && (
            <div className="p-4 border-l-[10px] border-[hsl(var(--govuk-blue))] bg-[hsl(var(--govuk-inset-blue-bg))] flex items-start gap-3">
              <Info className="h-5 w-5 text-[hsl(var(--govuk-blue))] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm mb-1">Notice</p>
                <ul className="text-sm space-y-1">
                  {validation.warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {validation.errors.length > 0 && (
            <div className="p-4 border-l-[10px] border-[hsl(var(--govuk-red))] bg-[hsl(var(--govuk-inset-red-bg))] flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-[hsl(var(--govuk-red))] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm mb-2 text-[hsl(var(--govuk-red))]">
                  Capacity limits exceeded
                </p>
                <ul className="text-sm space-y-1">
                  {validation.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      <h3 className="text-xl font-bold">Proposed Numbers of Children</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GovUKInput
          label="Children under 1 year"
          type="number"
          widthClass="10"
          min="0"
          max={capacityRatios.maxUnder1}
          hint={`Maximum: ${capacityRatios.maxUnder1}`}
          {...register("proposedUnder1", { valueAsNumber: true })}
        />
        <GovUKInput
          label="Children aged 1-5 years"
          type="number"
          widthClass="10"
          min="0"
          hint="Not including children under 1"
          {...register("proposedUnder5", { valueAsNumber: true })}
        />
        <GovUKInput
          label="Children aged 5-8 years"
          type="number"
          widthClass="10"
          min="0"
          {...register("proposed5to8", { valueAsNumber: true })}
        />
        <GovUKInput
          label="Children aged 8+ years"
          type="number"
          widthClass="10"
          min="0"
          {...register("proposed8plus", { valueAsNumber: true })}
        />
      </div>

      <div className="space-y-6 border-t pt-6">
        <h3 className="text-xl font-bold">Childcare Times</h3>
        
        <div className="space-y-3">
          <label className="text-base font-semibold block">
            When will you provide childcare?<span className="text-[hsl(var(--govuk-red))] ml-1">*</span>
          </label>
          <p className="text-sm text-[hsl(var(--govuk-text-secondary))] mb-3">
            Select all that apply
          </p>
          
          {[
            { value: "Weekdays", label: "Weekdays (Monday - Friday)" },
            { value: "Weekends", label: "Weekends" },
            { value: "Before School", label: "Before School" },
            { value: "After School", label: "After School" },
            { value: "School Holidays", label: "School Holidays" },
          ].map((option) => (
            <div key={option.value} className="flex items-center relative pl-10">
              <input
                type="checkbox"
                id={`childcareTimes-${option.value}`}
                value={option.value}
                {...register("childcareTimes")}
                className="absolute left-0 top-0 w-6 h-6 cursor-pointer appearance-none border-2 border-[hsl(var(--govuk-black))] checked:before:content-['✔'] checked:before:block checked:before:text-center checked:before:text-xl checked:before:leading-5 checked:before:text-[hsl(var(--govuk-black))] focus:outline-none focus:ring-[3px] focus:ring-[hsl(var(--govuk-focus-yellow))] focus:ring-offset-0"
              />
              <label htmlFor={`childcareTimes-${option.value}`} className="text-base cursor-pointer">
                {option.label}
              </label>
            </div>
          ))}
        </div>

        <GovUKRadio
          legend="Will you be looking after children overnight?"
          hint="This requires specific approval and potentially different premises requirements."
          required
          name="overnightCare"
          options={[
            { value: "Yes", label: "Yes" },
            { value: "No", label: "No" },
          ]}
          value={watch("overnightCare")}
          onChange={(value) => setValue("overnightCare", value as "Yes" | "No")}
        />
      </div>
    </div>
  );
};
