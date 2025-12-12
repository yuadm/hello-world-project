import { CochildminderFormData } from "@/types/cochildminder";
import { RKInput, RKCheckbox, RKSectionTitle, RKInfoBox } from "@/components/apply/rk";

interface Props {
  formData: CochildminderFormData;
  setFormData: React.Dispatch<React.SetStateAction<CochildminderFormData>>;
  validationErrors?: Record<string, string>;
}

export function CochildminderFormSection8({ formData, setFormData, validationErrors = {} }: Props) {
  return (
    <div>
      <RKSectionTitle 
        title="8. Declaration & Consent"
        description="Please read the declarations carefully and confirm your agreement before signing."
      />

      <div className="space-y-8">
        {/* Consent Checks */}
        <div className="space-y-4">
          <h3 className="rk-subsection-title">Consent</h3>
          
          <RKInfoBox type="info">
            <p>
              By ticking the boxes below, you consent to ReadyKids and the main applicant's 
              childminder agency conducting the necessary checks for your registration.
            </p>
          </RKInfoBox>

          <div className="space-y-4 bg-gray-50 border border-gray-200 rounded-xl p-5">
            <RKCheckbox
              id="consentChecks"
              label="I consent to background checks being carried out, including DBS checks, references, and local authority checks"
              checked={formData.consentChecks}
              onChange={(checked) => setFormData(prev => ({ ...prev, consentChecks: checked }))}
            />
          </div>
        </div>

        {/* Declaration */}
        <div className="space-y-4">
          <h3 className="rk-subsection-title">Declaration</h3>

          <div className="space-y-4 bg-gray-50 border border-gray-200 rounded-xl p-5">
            <RKCheckbox
              id="declarationTruth"
              label="I declare that the information I have provided in this application is true and complete to the best of my knowledge"
              checked={formData.declarationTruth}
              onChange={(checked) => setFormData(prev => ({ ...prev, declarationTruth: checked }))}
            />

            <RKCheckbox
              id="declarationNotify"
              label="I understand that I must notify ReadyKids and the childminder agency of any changes to my circumstances that may affect my suitability to work with children"
              checked={formData.declarationNotify}
              onChange={(checked) => setFormData(prev => ({ ...prev, declarationNotify: checked }))}
            />
          </div>
        </div>

        {/* Signature */}
        <div className="space-y-4">
          <h3 className="rk-subsection-title">Electronic Signature</h3>

          <RKInfoBox type="warning">
            <p>
              By typing your name below, you are signing this application electronically. 
              This has the same legal effect as a handwritten signature.
            </p>
          </RKInfoBox>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RKInput
              id="signatureName"
              label="Type your full name as your signature"
              required
              value={formData.signatureName}
              onChange={(e) => setFormData(prev => ({ ...prev, signatureName: e.target.value }))}
              error={validationErrors.signatureName}
              className="font-dancing-script text-2xl"
            />
            
            <RKInput
              id="signatureDate"
              label="Date"
              type="date"
              required
              value={formData.signatureDate}
              onChange={(e) => setFormData(prev => ({ ...prev, signatureDate: e.target.value }))}
              error={validationErrors.signatureDate}
            />
          </div>

          {formData.signatureName && (
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <p className="text-sm text-gray-500 mb-2">Your signature:</p>
              <p className="font-dancing-script text-3xl text-gray-900">{formData.signatureName}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
