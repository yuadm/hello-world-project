import { UseFormReturn } from "react-hook-form";
import { ChildminderApplication } from "@/types/childminder";
import { RKRadio, RKInput, RKButton, RKSectionTitle, RKInfoBox, RKCheckbox, RKSelect } from "./rk";
import { useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  calculateCapacityRatios,
} from "@/lib/capacityCalculator";

interface Props {
  form: UseFormReturn<Partial<ChildminderApplication>>;
}

export const Section4Service = ({ form }: Props) => {
  const { register, watch, setValue } = form;
  const ageGroups = watch("ageGroups") || [];
  const workWithOthers = watch("workWithOthers");
  const numberOfAssistants = watch("numberOfAssistants") || 0;
  const assistants = watch("assistants") || [];

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

  return (
    <div className="space-y-8">
      <RKSectionTitle 
        title="Your Childminding Service"
        description="Tell us about the childcare services you plan to offer."
      />

      <RKInfoBox type="info" title="Understanding the Registers">
        <p className="text-sm mb-2">Depending on the ages of children you care for, you may be registered on:</p>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li><strong>Early Years Register</strong> - for children from birth to 31 August after their 5th birthday</li>
          <li><strong>Compulsory Childcare Register</strong> - for children from 1 September after their 5th birthday until their 8th birthday</li>
          <li><strong>Voluntary Childcare Register</strong> - for children aged 8 and over</li>
        </ul>
      </RKInfoBox>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-rk-text">
          Which age groups will you care for?<span className="text-rk-error ml-1">*</span>
        </label>
        <div className="space-y-3">
          {[
            { value: "0-5", label: "Children aged 0-5 years (Early Years Register)" },
            { value: "5-7", label: "Children aged 5-7 years (Compulsory Childcare Register)" },
            { value: "8+", label: "Children aged 8 years and over (Voluntary Childcare Register)" },
          ].map((option) => (
            <RKCheckbox
              key={option.value}
              name={`ageGroup-${option.value}`}
              label={option.label}
              checked={ageGroups.includes(option.value)}
              onChange={() => toggleAgeGroup(option.value)}
            />
          ))}
        </div>
      </div>

      <div className="rk-divider" />

      <h3 className="rk-subsection-title">Capacity Calculator</h3>

      <RKRadio
        legend="Will you work with any assistants or co-childminders?"
        required
        name="workWithOthers"
        options={[
          { value: "Yes", label: "Yes" },
          { value: "No", label: "No" },
        ]}
        value={workWithOthers || ""}
        onChange={(value) => setValue("workWithOthers", value as "Yes" | "No")}
      />

      {workWithOthers === "Yes" && (
        <RKInput
          label="How many assistants/co-childminders?"
          type="number"
          required
          widthClass="10"
          min={1}
          max={3}
          hint="Maximum 3 assistants"
          {...register("numberOfAssistants", { valueAsNumber: true })}
        />
      )}

      {workWithOthers === "Yes" && numberOfAssistants > 0 && (
        <>
          <div className="rk-divider" />
          
          <h3 className="rk-subsection-title">People Connected to Your Application</h3>
          <p className="text-sm text-rk-text-light -mt-2 mb-4">
            We must ensure the suitability of everyone connected to your registration. This includes staff working with you and people living or working at the premises.
          </p>

          <h4 className="font-semibold text-rk-text mb-2">Assistants and Co-childminders Details</h4>
          <RKInfoBox type="info">
            Anyone working with you must complete a full suitability check (Form CMA-A1). 
            Please provide their basic details below so we can initiate their application.
          </RKInfoBox>
          
          {assistants.map((_, index) => (
            <div
              key={index}
              className="p-5 bg-rk-bg-form border border-rk-border rounded-xl space-y-4"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-lg text-rk-text">Person {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeAssistant(index)}
                  className="text-rk-error hover:text-rk-error/80 flex items-center gap-1 font-medium text-sm"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RKInput
                  label="First name"
                  required
                  {...register(`assistants.${index}.firstName`)}
                />
                <RKInput
                  label="Last name"
                  required
                  {...register(`assistants.${index}.lastName`)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RKInput
                  label="Date of birth"
                  type="date"
                  hint="dd/mm/yyyy"
                  required
                  {...register(`assistants.${index}.dob`)}
                />
                <RKSelect
                  label="Role"
                  required
                  options={[
                    { value: "", label: "Select role" },
                    { value: "Assistant", label: "Assistant" },
                    { value: "Co-childminder", label: "Co-childminder" },
                  ]}
                  {...register(`assistants.${index}.role`)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RKInput
                  label="Email address"
                  type="email"
                  required
                  {...register(`assistants.${index}.email`)}
                />
                <RKInput
                  label="Mobile number"
                  type="tel"
                  {...register(`assistants.${index}.phone`)}
                />
              </div>
            </div>
          ))}
          
          {assistants.length < numberOfAssistants && (
            <RKButton
              type="button"
              variant="secondary"
              onClick={addAssistant}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add person
            </RKButton>
          )}
        </>
      )}

      {/* Visual Capacity Calculator - Bento Style */}
      <div className="rk-capacity-wrapper">
        <div className="rk-capacity-header">
          <div className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h4>Your Maximum Child Capacity</h4>
        </div>
        <div className="rk-capacity-calculator">
          <div className="rk-capacity-card">
            <div className="value">{capacityRatios.totalAdults}</div>
            <div className="label">Total Adults</div>
          </div>
          <div className="rk-capacity-card">
            <div className="value">{capacityRatios.maxUnder5}</div>
            <div className="label">Max Under 5s</div>
          </div>
          <div className="rk-capacity-card">
            <div className="value">{capacityRatios.maxUnder1}</div>
            <div className="label">Max Under 1s</div>
          </div>
          <div className="rk-capacity-card">
            <div className="value">{capacityRatios.maxUnder8}</div>
            <div className="label">Max Under 8s</div>
          </div>
        </div>
      </div>

      <RKInfoBox type="info">
        These limits are based on EYFS statutory requirements. Your actual registered numbers may vary based on your premises and Ofsted assessment.
      </RKInfoBox>


      <div className="rk-divider" />

      <h3 className="rk-subsection-title">Service Hours</h3>
      
      <div className="space-y-3">
        <label className="block text-sm font-medium text-rk-text">
          When will you provide childcare?<span className="text-rk-error ml-1">*</span>
        </label>
        <p className="text-sm text-rk-text-light mb-3">Select all that apply</p>
        
        {[
          { value: "Weekdays", label: "Weekdays (Monday - Friday)" },
          { value: "Weekends", label: "Weekends" },
          { value: "Before School", label: "Before School" },
          { value: "After School", label: "After School" },
          { value: "School Holidays", label: "School Holidays" },
        ].map((option) => (
          <RKCheckbox
            key={option.value}
            name={`childcareTimes-${option.value}`}
            label={option.label}
            checked={(watch("childcareTimes") || []).includes(option.value)}
            onChange={(checked) => {
              const current = watch("childcareTimes") || [];
              if (checked) {
                setValue("childcareTimes", [...current, option.value]);
              } else {
                setValue("childcareTimes", current.filter((v: string) => v !== option.value));
              }
            }}
          />
        ))}
      </div>

      <RKRadio
        legend="Will you be looking after children overnight?"
        hint="This requires specific approval and potentially different premises requirements."
        required
        name="overnightCare"
        options={[
          { value: "Yes", label: "Yes" },
          { value: "No", label: "No" },
        ]}
        value={watch("overnightCare") || ""}
        onChange={(value) => setValue("overnightCare", value as "Yes" | "No")}
      />
    </div>
  );
};
