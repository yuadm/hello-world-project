import { CochildminderFormData } from "@/types/cochildminder";
import { RKInput, RKRadio, RKTextarea, RKSectionTitle, RKInfoBox } from "@/components/apply/rk";

interface Props {
  formData: CochildminderFormData;
  setFormData: React.Dispatch<React.SetStateAction<CochildminderFormData>>;
  validationErrors?: Record<string, string>;
}

export function CochildminderFormSection5({ formData, setFormData, validationErrors = {} }: Props) {
  return (
    <div>
      <RKSectionTitle 
        title="5. Qualifications & Training"
        description="Tell us about your childcare qualifications and mandatory training."
      />

      <div className="space-y-8">
        {/* DBS Section */}
        <div className="space-y-4">
          <h3 className="rk-subsection-title">DBS (Disclosure and Barring Service)</h3>
          
          <RKRadio
            name="hasDbs"
            legend="Do you have an Enhanced DBS certificate for the Children's and Adults' Barred Lists?"
            required
            options={[
              { value: "Yes", label: "Yes" },
              { value: "No", label: "No" }
            ]}
            value={formData.hasDbs}
            onChange={(value) => setFormData(prev => ({ ...prev, hasDbs: value }))}
            error={validationErrors.hasDbs}
          />

          {formData.hasDbs === "Yes" && (
            <div className="space-y-4">
              <RKInput
                id="dbsNumber"
                label="DBS certificate number"
                hint="This is a 12-digit number on your certificate"
                required
                value={formData.dbsNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, dbsNumber: e.target.value }))}
                error={validationErrors.dbsNumber}
              />

              <RKRadio
                name="dbsUpdateService"
                legend="Are you registered with the DBS Update Service?"
                required
                options={[
                  { value: "Yes", label: "Yes" },
                  { value: "No", label: "No" }
                ]}
                value={formData.dbsUpdateService}
                onChange={(value) => setFormData(prev => ({ ...prev, dbsUpdateService: value }))}
              />
            </div>
          )}

          {formData.hasDbs === "No" && (
            <RKInfoBox type="info">
              Don't worry if you don't have a DBS certificate yet. ReadyKids will arrange for a new DBS check to be carried out.
            </RKInfoBox>
          )}
        </div>

        {/* First Aid */}
        <div className="space-y-4">
          <h3 className="rk-subsection-title">First Aid Training</h3>
          
          <RKRadio
            name="firstAidCompleted"
            legend="Have you completed a Paediatric First Aid (PFA) course?"
            hint="This must be a 12-hour course suitable for childminders"
            required
            options={[
              { value: "Yes", label: "Yes" },
              { value: "No", label: "No" }
            ]}
            value={formData.firstAidCompleted}
            onChange={(value) => setFormData(prev => ({ ...prev, firstAidCompleted: value }))}
            error={validationErrors.firstAidCompleted}
          />

          {formData.firstAidCompleted === "Yes" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RKInput
                id="firstAidProvider"
                label="Training provider"
                required
                value={formData.firstAidProvider}
                onChange={(e) => setFormData(prev => ({ ...prev, firstAidProvider: e.target.value }))}
              />
              <RKInput
                id="firstAidDate"
                label="Date completed"
                type="date"
                required
                value={formData.firstAidDate}
                onChange={(e) => setFormData(prev => ({ ...prev, firstAidDate: e.target.value }))}
              />
            </div>
          )}
        </div>

        {/* Safeguarding */}
        <div className="space-y-4">
          <h3 className="rk-subsection-title">Safeguarding Training</h3>
          
          <RKRadio
            name="safeguardingCompleted"
            legend="Have you completed Safeguarding / Child Protection training?"
            required
            options={[
              { value: "Yes", label: "Yes" },
              { value: "No", label: "No" }
            ]}
            value={formData.safeguardingCompleted}
            onChange={(value) => setFormData(prev => ({ ...prev, safeguardingCompleted: value }))}
            error={validationErrors.safeguardingCompleted}
          />

          {formData.safeguardingCompleted === "Yes" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RKInput
                id="safeguardingProvider"
                label="Training provider"
                required
                value={formData.safeguardingProvider}
                onChange={(e) => setFormData(prev => ({ ...prev, safeguardingProvider: e.target.value }))}
              />
              <RKInput
                id="safeguardingDate"
                label="Date completed"
                type="date"
                required
                value={formData.safeguardingDate}
                onChange={(e) => setFormData(prev => ({ ...prev, safeguardingDate: e.target.value }))}
              />
            </div>
          )}
        </div>

        {/* PFA */}
        <div className="space-y-4">
          <h3 className="rk-subsection-title">Preventing and Controlling Infection</h3>
          
          <RKRadio
            name="pfaCompleted"
            legend="Have you completed Preventing and Controlling Infection training?"
            required
            options={[
              { value: "Yes", label: "Yes" },
              { value: "No", label: "No" }
            ]}
            value={formData.pfaCompleted}
            onChange={(value) => setFormData(prev => ({ ...prev, pfaCompleted: value }))}
          />
        </div>

        {/* Level 2 Qualification */}
        <div className="space-y-4">
          <h3 className="rk-subsection-title">Level 2 Childcare Qualification</h3>
          
          <RKRadio
            name="level2Qualification"
            legend="Do you hold a Level 2 (or above) childcare qualification?"
            required
            options={[
              { value: "Yes", label: "Yes" },
              { value: "No", label: "No" }
            ]}
            value={formData.level2Qualification}
            onChange={(value) => setFormData(prev => ({ ...prev, level2Qualification: value }))}
          />

          {formData.level2Qualification === "Yes" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RKInput
                id="level2Provider"
                label="Awarding body / provider"
                required
                value={formData.level2Provider}
                onChange={(e) => setFormData(prev => ({ ...prev, level2Provider: e.target.value }))}
              />
              <RKInput
                id="level2Date"
                label="Date achieved"
                type="date"
                required
                value={formData.level2Date}
                onChange={(e) => setFormData(prev => ({ ...prev, level2Date: e.target.value }))}
              />
            </div>
          )}
        </div>

        {/* EYFS */}
        <div className="space-y-4">
          <h3 className="rk-subsection-title">EYFS Training</h3>
          
          <RKRadio
            name="eyfsCompleted"
            legend="Have you completed Early Years Foundation Stage (EYFS) training?"
            required
            options={[
              { value: "Yes", label: "Yes" },
              { value: "No", label: "No" }
            ]}
            value={formData.eyfsCompleted}
            onChange={(value) => setFormData(prev => ({ ...prev, eyfsCompleted: value }))}
          />

          {formData.eyfsCompleted === "Yes" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RKInput
                id="eyfsProvider"
                label="Training provider"
                required
                value={formData.eyfsProvider}
                onChange={(e) => setFormData(prev => ({ ...prev, eyfsProvider: e.target.value }))}
              />
              <RKInput
                id="eyfsDate"
                label="Date completed"
                type="date"
                required
                value={formData.eyfsDate}
                onChange={(e) => setFormData(prev => ({ ...prev, eyfsDate: e.target.value }))}
              />
            </div>
          )}
        </div>

        {/* Other Qualifications */}
        <div className="space-y-4">
          <h3 className="rk-subsection-title">Other Qualifications</h3>
          
          <RKTextarea
            id="otherQualifications"
            label="Please list any other relevant qualifications or training"
            hint="Include qualification name, awarding body, and date achieved"
            rows={4}
            value={formData.otherQualifications}
            onChange={(e) => setFormData(prev => ({ ...prev, otherQualifications: e.target.value }))}
          />
        </div>
      </div>
    </div>
  );
}
