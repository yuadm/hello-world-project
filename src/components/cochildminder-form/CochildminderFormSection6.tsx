import { CochildminderFormData } from "@/types/cochildminder";
import { RKInput, RKTextarea, RKSectionTitle, RKButton, RKRepeatingBlock, RKRadio } from "@/components/apply/rk";
import { Plus } from "lucide-react";

interface Props {
  formData: CochildminderFormData;
  setFormData: React.Dispatch<React.SetStateAction<CochildminderFormData>>;
  validationErrors?: Record<string, string>;
}

export function CochildminderFormSection6({ formData, setFormData, validationErrors = {} }: Props) {
  const addEmployment = () => {
    setFormData(prev => ({
      ...prev,
      employmentHistory: [...prev.employmentHistory, { 
        employer: "", role: "", startDate: "", endDate: "", reasonForLeaving: "" 
      }]
    }));
  };

  const removeEmployment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      employmentHistory: prev.employmentHistory.filter((_, i) => i !== index)
    }));
  };

  const updateEmployment = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      employmentHistory: prev.employmentHistory.map((emp, i) =>
        i === index ? { ...emp, [field]: value } : emp
      )
    }));
  };

  return (
    <div>
      <RKSectionTitle 
        title="6. Employment History"
        description="Please provide details of your employment history for the last 5 years."
      />

      <div className="space-y-8">
        {/* Employment History */}
        <div className="space-y-4">
          <h3 className="rk-subsection-title">Employment History (Last 5 Years)</h3>
          <p className="text-sm text-gray-600 -mt-2">
            Include all paid and voluntary work, starting with your most recent.
          </p>

          <div className="space-y-4">
            {formData.employmentHistory.map((emp, index) => (
              <RKRepeatingBlock
                key={index}
                title={`Employment ${index + 1}`}
                onRemove={() => removeEmployment(index)}
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <RKInput
                      id={`employer_${index}`}
                      label="Employer name"
                      required
                      value={emp.employer}
                      onChange={(e) => updateEmployment(index, "employer", e.target.value)}
                    />
                    <RKInput
                      id={`role_${index}`}
                      label="Job title / Role"
                      required
                      value={emp.role}
                      onChange={(e) => updateEmployment(index, "role", e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <RKInput
                      id={`startDate_${index}`}
                      label="Start date"
                      type="date"
                      required
                      value={emp.startDate}
                      onChange={(e) => updateEmployment(index, "startDate", e.target.value)}
                    />
                    <RKInput
                      id={`endDate_${index}`}
                      label="End date"
                      type="date"
                      hint="Leave blank if current"
                      value={emp.endDate}
                      onChange={(e) => updateEmployment(index, "endDate", e.target.value)}
                    />
                  </div>

                  <RKTextarea
                    id={`reasonForLeaving_${index}`}
                    label="Reason for leaving"
                    hint="Or 'Current position' if still employed"
                    rows={2}
                    value={emp.reasonForLeaving}
                    onChange={(e) => updateEmployment(index, "reasonForLeaving", e.target.value)}
                  />
                </div>
              </RKRepeatingBlock>
            ))}
          </div>

          <RKButton variant="secondary" onClick={addEmployment}>
            <Plus className="h-4 w-4 mr-2" />
            Add employment
          </RKButton>
        </div>

        {/* Employment Gaps */}
        <div className="space-y-4">
          <h3 className="rk-subsection-title">Employment Gaps</h3>
          
          <RKTextarea
            id="employmentGaps"
            label="Please explain any gaps in your employment history"
            hint="Include periods of study, caring responsibilities, travel, or other activities"
            rows={4}
            value={formData.employmentGaps}
            onChange={(e) => setFormData(prev => ({ ...prev, employmentGaps: e.target.value }))}
          />
        </div>

        {/* References */}
        <div className="space-y-6">
          <h3 className="rk-subsection-title">References</h3>
          <p className="text-sm text-gray-600 -mt-2">
            Please provide two references. At least one should be from someone who has known you in a professional capacity.
          </p>

          {/* Reference 1 */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
            <h4 className="font-semibold text-gray-900">Reference 1</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RKInput
                id="reference1Name"
                label="Full name"
                required
                value={formData.reference1Name}
                onChange={(e) => setFormData(prev => ({ ...prev, reference1Name: e.target.value }))}
                error={validationErrors.reference1Name}
              />
              <RKInput
                id="reference1Relationship"
                label="Relationship to you"
                hint="e.g., Manager, Colleague, Tutor"
                required
                value={formData.reference1Relationship}
                onChange={(e) => setFormData(prev => ({ ...prev, reference1Relationship: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RKInput
                id="reference1Email"
                label="Email address"
                type="email"
                required
                value={formData.reference1Email}
                onChange={(e) => setFormData(prev => ({ ...prev, reference1Email: e.target.value }))}
                error={validationErrors.reference1Email}
              />
              <RKInput
                id="reference1Phone"
                label="Phone number"
                type="tel"
                required
                value={formData.reference1Phone}
                onChange={(e) => setFormData(prev => ({ ...prev, reference1Phone: e.target.value }))}
              />
            </div>

            <RKRadio
              name="reference1Childcare"
              legend="Did you work with this person in a role involving children?"
              required
              options={[
                { value: "Yes", label: "Yes" },
                { value: "No", label: "No" }
              ]}
              value={formData.reference1Childcare ? "Yes" : "No"}
              onChange={(value) => setFormData(prev => ({ ...prev, reference1Childcare: value === "Yes" }))}
            />
          </div>

          {/* Reference 2 */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
            <h4 className="font-semibold text-gray-900">Reference 2</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RKInput
                id="reference2Name"
                label="Full name"
                required
                value={formData.reference2Name}
                onChange={(e) => setFormData(prev => ({ ...prev, reference2Name: e.target.value }))}
                error={validationErrors.reference2Name}
              />
              <RKInput
                id="reference2Relationship"
                label="Relationship to you"
                hint="e.g., Manager, Colleague, Tutor"
                required
                value={formData.reference2Relationship}
                onChange={(e) => setFormData(prev => ({ ...prev, reference2Relationship: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RKInput
                id="reference2Email"
                label="Email address"
                type="email"
                required
                value={formData.reference2Email}
                onChange={(e) => setFormData(prev => ({ ...prev, reference2Email: e.target.value }))}
                error={validationErrors.reference2Email}
              />
              <RKInput
                id="reference2Phone"
                label="Phone number"
                type="tel"
                required
                value={formData.reference2Phone}
                onChange={(e) => setFormData(prev => ({ ...prev, reference2Phone: e.target.value }))}
              />
            </div>

            <RKRadio
              name="reference2Childcare"
              legend="Did you work with this person in a role involving children?"
              required
              options={[
                { value: "Yes", label: "Yes" },
                { value: "No", label: "No" }
              ]}
              value={formData.reference2Childcare ? "Yes" : "No"}
              onChange={(value) => setFormData(prev => ({ ...prev, reference2Childcare: value === "Yes" }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
