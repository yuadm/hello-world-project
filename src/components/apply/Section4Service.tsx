import { UseFormReturn } from "react-hook-form";
import { ChildminderApplication } from "@/types/childminder";
import { RKRadio, RKInput, RKButton, RKSectionTitle, RKInfoBox, RKCheckbox } from "./rk";
import { useMemo, useEffect } from "react";
import { Plus, Trash2, Users, UserCheck } from "lucide-react";
import {
  calculateCapacityRatios,
} from "@/lib/capacityCalculator";

interface Props {
  form: UseFormReturn<Partial<ChildminderApplication>>;
}

export const Section4Service = ({ form }: Props) => {
  const { register, watch, setValue } = form;
  const ageGroups = watch("ageGroups") || [];
  const workWithAssistants = watch("workWithAssistants");
  const workWithCochildminders = watch("workWithCochildminders");
  const numberOfAssistants = watch("numberOfAssistants") || 0;
  const numberOfCochildminders = watch("numberOfCochildminders") || 0;
  const assistants = watch("assistants") || [];
  const cochildminders = watch("cochildminders") || [];

  const toggleAgeGroup = (ageGroup: string) => {
    if (ageGroups.includes(ageGroup)) {
      setValue("ageGroups", ageGroups.filter((g) => g !== ageGroup));
    } else {
      setValue("ageGroups", [...ageGroups, ageGroup]);
    }
  };

  // Auto-sync assistants array with numberOfAssistants
  useEffect(() => {
    if (workWithAssistants === "Yes" && numberOfAssistants > 0) {
      const currentLength = assistants.length;
      if (currentLength < numberOfAssistants) {
        const newAssistants = [...assistants];
        for (let i = currentLength; i < numberOfAssistants; i++) {
          newAssistants.push({ firstName: "", lastName: "", dob: "", email: "", phone: "" });
        }
        setValue("assistants", newAssistants);
      } else if (currentLength > numberOfAssistants) {
        setValue("assistants", assistants.slice(0, numberOfAssistants));
      }
    } else if (workWithAssistants === "No") {
      setValue("assistants", []);
      setValue("numberOfAssistants", 0);
    }
  }, [workWithAssistants, numberOfAssistants]);

  // Auto-sync cochildminders array with numberOfCochildminders
  useEffect(() => {
    if (workWithCochildminders === "Yes" && numberOfCochildminders > 0) {
      const currentLength = cochildminders.length;
      if (currentLength < numberOfCochildminders) {
        const newCochildminders = [...cochildminders];
        for (let i = currentLength; i < numberOfCochildminders; i++) {
          newCochildminders.push({ firstName: "", lastName: "", dob: "", email: "", phone: "" });
        }
        setValue("cochildminders", newCochildminders);
      } else if (currentLength > numberOfCochildminders) {
        setValue("cochildminders", cochildminders.slice(0, numberOfCochildminders));
      }
    } else if (workWithCochildminders === "No") {
      setValue("cochildminders", []);
      setValue("numberOfCochildminders", 0);
    }
  }, [workWithCochildminders, numberOfCochildminders]);

  const addAssistant = () => {
    if (numberOfAssistants < 3) {
      setValue("numberOfAssistants", numberOfAssistants + 1);
    }
  };

  const removeAssistant = (index: number) => {
    const newAssistants = assistants.filter((_, i) => i !== index);
    setValue("assistants", newAssistants);
    setValue("numberOfAssistants", newAssistants.length);
  };

  const addCochildminder = () => {
    if (numberOfCochildminders < 2) {
      setValue("numberOfCochildminders", numberOfCochildminders + 1);
    }
  };

  const removeCochildminder = (index: number) => {
    const newCochildminders = cochildminders.filter((_, i) => i !== index);
    setValue("cochildminders", newCochildminders);
    setValue("numberOfCochildminders", newCochildminders.length);
  };

  // Calculate capacity ratios (assistants increase capacity, co-childminders don't count for main applicant)
  const capacityRatios = useMemo(() => {
    // Only assistants affect the main applicant's capacity
    return calculateCapacityRatios(workWithAssistants, numberOfAssistants);
  }, [workWithAssistants, numberOfAssistants]);

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

      <div className="rk-divider" />
      
      <h3 className="rk-subsection-title">People Connected to Your Application</h3>
      <p className="text-sm text-rk-text-light -mt-2 mb-4">
        We must ensure the suitability of everyone connected to your registration. This includes staff working with you and people living or working at the premises.
      </p>

      {/* Assistants Section */}
      <div className="p-5 bg-rk-bg-form border border-rk-border rounded-xl space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-rk-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-rk-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-rk-text">Assistants</h4>
            <p className="text-sm text-rk-text-light">People who work <strong>under your supervision</strong></p>
          </div>
        </div>
        
        <RKInfoBox type="info">
          Assistants work under your direction and help with childcare duties. They must complete a CMA-A1 suitability check form and will increase your child capacity ratios.
        </RKInfoBox>

        <RKRadio
          legend="Will you work with any assistants?"
          required
          name="workWithAssistants"
          options={[
            { value: "Yes", label: "Yes" },
            { value: "No", label: "No" },
          ]}
          value={workWithAssistants || ""}
          onChange={(value) => setValue("workWithAssistants", value as "Yes" | "No")}
        />

        {workWithAssistants === "Yes" && (
          <>
            <RKInput
              label="How many assistants?"
              type="number"
              required
              widthClass="10"
              min={1}
              max={3}
              hint="Maximum 3 assistants"
              {...register("numberOfAssistants", { valueAsNumber: true })}
            />

            {numberOfAssistants > 0 && assistants.map((_, index) => (
              <div
                key={index}
                className="p-4 bg-white border border-rk-border rounded-lg space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h5 className="font-medium text-rk-text">Assistant {index + 1}</h5>
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
                  <RKInput
                    label="Email address"
                    type="email"
                    required
                    {...register(`assistants.${index}.email`)}
                  />
                </div>
                <RKInput
                  label="Mobile number"
                  type="tel"
                  widthClass="20"
                  {...register(`assistants.${index}.phone`)}
                />
              </div>
            ))}
            
            {numberOfAssistants < 3 && (
              <RKButton
                type="button"
                variant="secondary"
                onClick={addAssistant}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add assistant
              </RKButton>
            )}
          </>
        )}
      </div>

      {/* Co-childminders Section */}
      <div className="p-5 bg-rk-bg-form border border-rk-border rounded-xl space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h4 className="font-semibold text-rk-text">Co-childminders</h4>
            <p className="text-sm text-rk-text-light">Independent childminders who <strong>share your premises</strong></p>
          </div>
        </div>
        
        <RKInfoBox type="warning">
          Co-childminders are registered childminders in their own right. They share your premises but have their own registration and capacity. They will need to complete a full co-childminder application form (similar to your application).
        </RKInfoBox>

        <RKRadio
          legend="Will any co-childminders work from your premises?"
          required
          name="workWithCochildminders"
          options={[
            { value: "Yes", label: "Yes" },
            { value: "No", label: "No" },
          ]}
          value={workWithCochildminders || ""}
          onChange={(value) => setValue("workWithCochildminders", value as "Yes" | "No")}
        />

        {workWithCochildminders === "Yes" && (
          <>
            <RKInput
              label="How many co-childminders?"
              type="number"
              required
              widthClass="10"
              min={1}
              max={2}
              hint="Maximum 2 co-childminders"
              {...register("numberOfCochildminders", { valueAsNumber: true })}
            />

            {numberOfCochildminders > 0 && cochildminders.map((_, index) => (
              <div
                key={index}
                className="p-4 bg-white border border-amber-200 rounded-lg space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h5 className="font-medium text-rk-text">Co-childminder {index + 1}</h5>
                  <button
                    type="button"
                    onClick={() => removeCochildminder(index)}
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
                    {...register(`cochildminders.${index}.firstName`)}
                  />
                  <RKInput
                    label="Last name"
                    required
                    {...register(`cochildminders.${index}.lastName`)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <RKInput
                    label="Date of birth"
                    type="date"
                    hint="dd/mm/yyyy"
                    required
                    {...register(`cochildminders.${index}.dob`)}
                  />
                  <RKInput
                    label="Email address"
                    type="email"
                    required
                    {...register(`cochildminders.${index}.email`)}
                  />
                </div>
                <RKInput
                  label="Mobile number"
                  type="tel"
                  widthClass="20"
                  {...register(`cochildminders.${index}.phone`)}
                />
              </div>
            ))}
            
            {numberOfCochildminders < 2 && (
              <RKButton
                type="button"
                variant="secondary"
                onClick={addCochildminder}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add co-childminder
              </RKButton>
            )}
          </>
        )}
      </div>

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