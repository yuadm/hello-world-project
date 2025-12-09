import { HouseholdFormData } from "@/pages/HouseholdForm";
import { RKInput, RKSectionTitle } from "@/components/apply/rk";
import { Shield, Pencil, CheckCircle, FileText } from "lucide-react";

interface Props {
  formData: HouseholdFormData;
  setFormData: React.Dispatch<React.SetStateAction<HouseholdFormData>>;
  validationErrors?: Record<string, string>;
}

interface ConsentItemProps {
  text: string;
  isChecked: boolean;
  onToggle: () => void;
}

const ConsentItem = ({ text, isChecked, onToggle }: ConsentItemProps) => (
  <div 
    className={`rk-consent-item ${isChecked ? 'checked' : ''}`}
    onClick={onToggle}
  >
    <div className="checkbox-wrapper">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={onToggle}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
    <span className="text">{text}</span>
  </div>
);

export function HouseholdFormSection5({ formData, setFormData, validationErrors = {} }: Props) {
  const hasErrors = validationErrors.consentChecks || validationErrors.declarationTruth || validationErrors.declarationNotify;

  return (
    <div className="space-y-8">
      <RKSectionTitle 
        title="5. Consent & Declaration"
        description="Ready Kids must carry out background checks to assess your suitability, in line with Ofsted requirements and the Department for Education's guidance for childminder agencies."
      />

      {/* Section A - Consent to Background Checks */}
      <div className="rk-consent-section">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-rk-primary/10 flex items-center justify-center">
            <Shield className="w-4 h-4 text-rk-primary" />
          </div>
          <h4 className="text-lg font-semibold text-rk-text m-0">A. Consent to Background Checks</h4>
        </div>
        
        <div className="space-y-3">
          <ConsentItem
            text="I consent to Ready Kids carrying out all necessary checks, including with the Disclosure and Barring Service (DBS) and local authorities, to assess my suitability."
            isChecked={formData.consentChecks}
            onToggle={() => setFormData(prev => ({ ...prev, consentChecks: !prev.consentChecks }))}
          />
        </div>
        {validationErrors.consentChecks && (
          <p className="text-sm text-rk-error mt-2">{validationErrors.consentChecks}</p>
        )}
      </div>

      {/* Section B - Declarations */}
      <div className="rk-consent-section">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-rk-primary/10 flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-rk-primary" />
          </div>
          <h4 className="text-lg font-semibold text-rk-text m-0">B. Declarations</h4>
        </div>
        
        <div className="space-y-3">
          <ConsentItem
            text="I declare that the information provided in this form is true, accurate, and complete to the best of my knowledge. I understand that providing false or misleading information is an offence and may result in refusal or cancellation of suitability status."
            isChecked={formData.declarationTruth}
            onToggle={() => setFormData(prev => ({ ...prev, declarationTruth: !prev.declarationTruth }))}
          />
          {validationErrors.declarationTruth && (
            <p className="text-sm text-rk-error">{validationErrors.declarationTruth}</p>
          )}
          
          <ConsentItem
            text="I understand that I must notify the childminder of any changes to this information, including any new cautions or convictions, within 14 days of the event."
            isChecked={formData.declarationNotify}
            onToggle={() => setFormData(prev => ({ ...prev, declarationNotify: !prev.declarationNotify }))}
          />
          {validationErrors.declarationNotify && (
            <p className="text-sm text-rk-error">{validationErrors.declarationNotify}</p>
          )}
        </div>

        {/* Privacy Policy Link */}
        <div className="mt-4 pt-4 border-t border-rk-border">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-rk-primary" />
            <span className="text-sm text-rk-text">
              You can read our full{" "}
              <a 
                href="/privacy-policy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-rk-primary hover:underline font-medium"
              >
                Privacy Policy
              </a>{" "}
              here.
            </span>
          </div>
        </div>
      </div>

      {/* Signature Section */}
      <div className="rk-signature-section">
        <div className="rk-signature-header">
          <Pencil className="icon w-5 h-5" />
          <h4>Electronic Signature</h4>
        </div>
        
        <div className="rk-signature-grid">
          <div>
            <label className="block text-sm font-medium text-rk-text mb-1">
              Your signature <span className="text-rk-error">*</span>
            </label>
            <p className="text-xs text-rk-text-light mb-2">Type your full name as your electronic signature</p>
            <input 
              type="text"
              placeholder="Type your full name"
              className="w-full px-4 py-3 border-2 border-rk-border rounded-[10px] bg-rk-gray-50 rk-signature-input focus:border-rk-primary focus:outline-none"
              value={formData.signatureFullName}
              onChange={(e) => setFormData(prev => ({ ...prev, signatureFullName: e.target.value }))}
            />
            {validationErrors.signatureFullName && (
              <p className="text-sm text-rk-error mt-1">{validationErrors.signatureFullName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-rk-text mb-1">
              Full name (PRINT) <span className="text-rk-error">*</span>
            </label>
            <p className="text-xs text-rk-text-light mb-2">FULL NAME IN CAPITALS</p>
            <input 
              type="text"
              placeholder="FULL NAME IN CAPITALS"
              className="w-full px-4 py-3 border-2 border-rk-border rounded-[10px] bg-white focus:border-rk-primary focus:outline-none uppercase"
              value={formData.signaturePrintName || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, signaturePrintName: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-rk-text mb-1">
              Date <span className="text-rk-error">*</span>
            </label>
            <p className="text-xs text-rk-text-light mb-2">&nbsp;</p>
            <input 
              type="date"
              className="w-full px-4 py-3 border-2 border-rk-border rounded-[10px] bg-white focus:border-rk-primary focus:outline-none"
              value={formData.signatureDate}
              onChange={(e) => setFormData(prev => ({ ...prev, signatureDate: e.target.value }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
