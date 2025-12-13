import { CochildminderFormData } from "@/types/cochildminder";
import { RKRadio, RKTextarea, RKSectionTitle, RKInfoBox, RKRepeatingBlock, RKInput, RKButton } from "@/components/apply/rk";
import { Plus } from "lucide-react";

interface Props {
  formData: CochildminderFormData;
  setFormData: React.Dispatch<React.SetStateAction<CochildminderFormData>>;
  validationErrors?: Record<string, string>;
}

export function CochildminderFormSection7({ formData, setFormData, validationErrors = {} }: Props) {
  const addRegistration = () => {
    setFormData(prev => ({
      ...prev,
      previousRegistrationDetails: [...prev.previousRegistrationDetails, { 
        regulator: "", registrationNumber: "", startDate: "", endDate: "" 
      }]
    }));
  };

  const removeRegistration = (index: number) => {
    setFormData(prev => ({
      ...prev,
      previousRegistrationDetails: prev.previousRegistrationDetails.filter((_, i) => i !== index)
    }));
  };

  const updateRegistration = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      previousRegistrationDetails: prev.previousRegistrationDetails.map((reg, i) =>
        i === index ? { ...reg, [field]: value } : reg
      )
    }));
  };

  return (
    <div>
      <RKSectionTitle 
        title="7. Suitability & Vetting"
        description="This section covers mandatory background and suitability checks required for childminding registration."
      />

      <div className="space-y-8">
        {/* Previous Registrations */}
        <div className="space-y-4">
          <h3 className="rk-subsection-title">Previous Registrations</h3>
          
          <RKRadio
            name="previousRegistration"
            legend="Have you ever been registered with Ofsted, a childminder agency, or any other regulatory body for childcare?"
            required
            options={[
              { value: "Yes", label: "Yes" },
              { value: "No", label: "No" }
            ]}
            value={formData.previousRegistration}
            onChange={(value) => setFormData(prev => ({ ...prev, previousRegistration: value }))}
            error={validationErrors.previousRegistration}
          />

          {formData.previousRegistration === "Yes" && (
            <div className="space-y-4">
              {formData.previousRegistrationDetails.map((reg, index) => (
                <RKRepeatingBlock
                  key={index}
                  title={`Registration ${index + 1}`}
                  onRemove={() => removeRegistration(index)}
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <RKInput
                        id={`regulator_${index}`}
                        label="Name of regulatory body"
                        required
                        value={reg.regulator}
                        onChange={(e) => updateRegistration(index, "regulator", e.target.value)}
                      />
                      <RKInput
                        id={`registrationNumber_${index}`}
                        label="Registration number (URN)"
                        required
                        value={reg.registrationNumber}
                        onChange={(e) => updateRegistration(index, "registrationNumber", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <RKInput
                        id={`regStartDate_${index}`}
                        label="Start date"
                        type="date"
                        required
                        value={reg.startDate}
                        onChange={(e) => updateRegistration(index, "startDate", e.target.value)}
                      />
                      <RKInput
                        id={`regEndDate_${index}`}
                        label="End date"
                        type="date"
                        hint="Leave blank if still registered"
                        value={reg.endDate}
                        onChange={(e) => updateRegistration(index, "endDate", e.target.value)}
                      />
                    </div>
                  </div>
                </RKRepeatingBlock>
              ))}
              
              <RKButton variant="secondary" onClick={addRegistration}>
                <Plus className="h-4 w-4 mr-2" />
                Add registration
              </RKButton>
            </div>
          )}
        </div>

        {/* Criminal History */}
        <div className="space-y-4">
          <h3 className="rk-subsection-title">Criminal History</h3>
          
          <RKInfoBox type="warning">
            <p>
              <strong>Important:</strong> You must declare all spent and unspent convictions, cautions, 
              reprimands, and final warnings. Working with children is exempt from the Rehabilitation of 
              Offenders Act 1974.
            </p>
          </RKInfoBox>
          
          <RKRadio
            name="criminalHistory"
            legend="Have you ever been convicted of any criminal offence, received a police caution, reprimand, or warning?"
            required
            options={[
              { value: "Yes", label: "Yes" },
              { value: "No", label: "No" }
            ]}
            value={formData.criminalHistory}
            onChange={(value) => setFormData(prev => ({ ...prev, criminalHistory: value }))}
            error={validationErrors.criminalHistory}
          />

          {formData.criminalHistory === "Yes" && (
            <RKTextarea
              id="criminalHistoryDetails"
              label="Please provide full details"
              hint="Include dates, offences, and outcomes"
              required
              rows={4}
              value={formData.criminalHistoryDetails}
              onChange={(e) => setFormData(prev => ({ ...prev, criminalHistoryDetails: e.target.value }))}
            />
          )}
        </div>

        {/* Disqualification */}
        <div className="space-y-4">
          <h3 className="rk-subsection-title">Disqualification</h3>
          
          <RKInfoBox type="warning">
            <p>
              A person may be disqualified from registration if they or someone living in their household 
              has been convicted of certain offences, or been subject to certain orders or sanctions.
            </p>
          </RKInfoBox>
          
          <RKRadio
            name="disqualified"
            legend="Are you disqualified from registration, or do you live in the same household as a person who is disqualified?"
            required
            options={[
              { value: "Yes", label: "Yes" },
              { value: "No", label: "No" }
            ]}
            value={formData.disqualified}
            onChange={(value) => setFormData(prev => ({ ...prev, disqualified: value }))}
            error={validationErrors.disqualified}
          />
        </div>

        {/* Social Services */}
        <div className="space-y-4">
          <h3 className="rk-subsection-title">Social Services Involvement</h3>
          
          <RKRadio
            name="socialServices"
            legend="Have you or any member of your household ever been investigated by, or had action taken by, social services or child protection services?"
            required
            options={[
              { value: "Yes", label: "Yes" },
              { value: "No", label: "No" }
            ]}
            value={formData.socialServices}
            onChange={(value) => setFormData(prev => ({ ...prev, socialServices: value }))}
            error={validationErrors.socialServices}
          />

          {formData.socialServices === "Yes" && (
            <RKTextarea
              id="socialServicesDetails"
              label="Please provide full details"
              required
              rows={4}
              value={formData.socialServicesDetails}
              onChange={(e) => setFormData(prev => ({ ...prev, socialServicesDetails: e.target.value }))}
            />
          )}
        </div>

        {/* Health Conditions */}
        <div className="space-y-4">
          <h3 className="rk-subsection-title">Health Declaration</h3>
          
          <RKRadio
            name="healthConditions"
            legend="Do you have any health conditions (physical or mental) that might affect your ability to care for children safely?"
            required
            options={[
              { value: "Yes", label: "Yes" },
              { value: "No", label: "No" }
            ]}
            value={formData.healthConditions}
            onChange={(value) => setFormData(prev => ({ ...prev, healthConditions: value }))}
            error={validationErrors.healthConditions}
          />

          {formData.healthConditions === "Yes" && (
            <RKTextarea
              id="healthConditionsDetails"
              label="Please provide details"
              hint="Include how you manage the condition and any support you may need"
              required
              rows={4}
              value={formData.healthConditionsDetails}
              onChange={(e) => setFormData(prev => ({ ...prev, healthConditionsDetails: e.target.value }))}
            />
          )}
        </div>

        {/* Smoking */}
        <div className="space-y-4">
          <h3 className="rk-subsection-title">Smoking</h3>
          
          <RKInfoBox type="warning">
            <p>
              <strong>Legal requirement:</strong> It is illegal to smoke in any part of a premises used 
              for childminding, or in the presence of minded children.
            </p>
          </RKInfoBox>
          
          <RKRadio
            name="smoker"
            legend="Do you smoke?"
            hint="This includes cigarettes, vaping, or any other tobacco products"
            required
            options={[
              { value: "Yes", label: "Yes" },
              { value: "No", label: "No" }
            ]}
            value={formData.smoker}
            onChange={(value) => setFormData(prev => ({ ...prev, smoker: value }))}
            error={validationErrors.smoker}
          />
        </div>
      </div>
    </div>
  );
}
