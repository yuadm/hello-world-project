import { CochildminderFormData } from "@/types/cochildminder";
import { RKInput, RKSelect, RKRadio, RKSectionTitle, RKButton, RKRepeatingBlock } from "@/components/apply/rk";
import { Plus } from "lucide-react";
import { useState } from "react";

interface Props {
  formData: CochildminderFormData;
  setFormData: React.Dispatch<React.SetStateAction<CochildminderFormData>>;
  validationErrors?: Record<string, string>;
}

export function CochildminderFormSection1({ formData, setFormData, validationErrors = {} }: Props) {
  const [hasOtherNames, setHasOtherNames] = useState(formData.previousNames.length > 0);

  const addPreviousName = () => {
    setFormData(prev => ({
      ...prev,
      previousNames: [...prev.previousNames, { fullName: "", dateFrom: "", dateTo: "" }]
    }));
  };

  const removePreviousName = (index: number) => {
    setFormData(prev => ({
      ...prev,
      previousNames: prev.previousNames.filter((_, i) => i !== index)
    }));
  };

  const updatePreviousName = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      previousNames: prev.previousNames.map((name, i) =>
        i === index ? { ...name, [field]: value } : name
      )
    }));
  };

  return (
    <div>
      <RKSectionTitle 
        title="1. Your Personal Details"
        description="Please provide your full legal name exactly as it appears on your passport or driving licence."
      />

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <RKSelect
            id="title"
            label="Title"
            required
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            error={validationErrors.title}
            options={[
              { value: "", label: "Select title" },
              { value: "Mr", label: "Mr" },
              { value: "Mrs", label: "Mrs" },
              { value: "Miss", label: "Miss" },
              { value: "Ms", label: "Ms" },
              { value: "Mx", label: "Mx" },
              { value: "Dr", label: "Dr" },
              { value: "Other", label: "Other" }
            ]}
          />
          
          <div className="md:col-span-2">
            <RKInput
              id="firstName"
              label="First name(s)"
              required
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              error={validationErrors.firstName}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RKInput
            id="middleNames"
            label="Middle name(s)"
            hint="If any"
            value={formData.middleNames}
            onChange={(e) => setFormData(prev => ({ ...prev, middleNames: e.target.value }))}
          />
          
          <RKInput
            id="lastName"
            label="Last name"
            required
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            error={validationErrors.lastName}
          />
        </div>

        <RKRadio
          name="otherNames"
          legend="Have you been known by any other names?"
          hint="Including maiden name, name at birth if different, or names changed by deed poll"
          required
          options={[
            { value: "Yes", label: "Yes" },
            { value: "No", label: "No" }
          ]}
          value={hasOtherNames ? "Yes" : "No"}
          onChange={(value) => {
            setHasOtherNames(value === "Yes");
            if (value === "No") {
              setFormData(prev => ({ ...prev, previousNames: [] }));
            }
          }}
        />

        {hasOtherNames && (
          <div className="space-y-4">
            {formData.previousNames.map((name, index) => (
              <RKRepeatingBlock
                key={index}
                title={`Previous Name ${index + 1}`}
                onRemove={() => removePreviousName(index)}
              >
                <RKInput
                  id={`prevNameFull_${index}`}
                  label="Full name"
                  required
                  value={name.fullName}
                  onChange={(e) => updatePreviousName(index, "fullName", e.target.value)}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <RKInput
                    id={`prevNameStart_${index}`}
                    label="Date from"
                    type="date"
                    required
                    value={name.dateFrom}
                    onChange={(e) => updatePreviousName(index, "dateFrom", e.target.value)}
                  />
                  <RKInput
                    id={`prevNameEnd_${index}`}
                    label="Date to"
                    type="date"
                    required
                    value={name.dateTo}
                    onChange={(e) => updatePreviousName(index, "dateTo", e.target.value)}
                  />
                </div>
              </RKRepeatingBlock>
            ))}
            
            <RKButton variant="secondary" onClick={addPreviousName}>
              <Plus className="h-4 w-4 mr-2" />
              Add previous name
            </RKButton>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RKInput
            id="dob"
            label="Date of birth"
            type="date"
            required
            value={formData.dateOfBirth}
            onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
            error={validationErrors.dateOfBirth}
          />
          
          <RKInput
            id="birthTown"
            label="Town or city of birth"
            required
            value={formData.birthTown}
            onChange={(e) => setFormData(prev => ({ ...prev, birthTown: e.target.value }))}
            error={validationErrors.birthTown}
          />
        </div>

        <RKRadio
          name="sex"
          legend="Sex"
          required
          options={[
            { value: "Male", label: "Male" },
            { value: "Female", label: "Female" }
          ]}
          value={formData.sex}
          onChange={(value) => setFormData(prev => ({ ...prev, sex: value }))}
          error={validationErrors.sex}
        />

        <RKInput
          id="niNumber"
          label="National Insurance number"
          hint="It's on your National Insurance card, benefit letter, payslip or P60. For example, 'QQ 12 34 56 C'"
          required
          value={formData.niNumber}
          onChange={(e) => setFormData(prev => ({ ...prev, niNumber: e.target.value }))}
          error={validationErrors.niNumber}
        />
      </div>
    </div>
  );
}
