import { UseFormReturn } from "react-hook-form";
import { ChildminderApplication } from "@/types/childminder";
import { RKSectionTitle } from "./rk";
import { Shield, Pencil, FileText, Share2, CheckCircle } from "lucide-react";

interface Props {
  form: UseFormReturn<Partial<ChildminderApplication>>;
}

interface ConsentItemProps {
  fieldKey: keyof ChildminderApplication;
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

export const Section9Declaration = ({ form }: Props) => {
  const { register, watch, setValue } = form;

  const toggleField = (key: keyof ChildminderApplication) => {
    const current = watch(key) as boolean || false;
    setValue(key, !current as never);
  };

  return (
    <div className="space-y-8">
      <RKSectionTitle 
        title="Consent & Declaration" 
        description="Ready Kids must carry out background checks to assess your suitability to work with children, in line with Ofsted requirements and the Department for Education's guidance for childminder agencies." 
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
            fieldKey="consentDBSChecks"
            text="I consent to Ready Kids carrying out all necessary checks, including with the Disclosure and Barring Service (DBS), local authorities, referees, and my GP (if required), to assess my suitability and the suitability of connected persons."
            isChecked={watch("consentDBSChecks") as boolean || false}
            onToggle={() => toggleField("consentDBSChecks")}
          />
          <ConsentItem
            fieldKey="consentLAContact"
            text="I authorise Ready Kids to contact the children's services departments of any local authority area in which I have lived in the last 5 years, using the address history I have provided in this application."
            isChecked={watch("consentLAContact") as boolean || false}
            onToggle={() => toggleField("consentLAContact")}
          />
          <ConsentItem
            fieldKey="consentLAShare"
            text="I authorise those local authorities' children's services departments to share with Ready Kids any information they hold about me that is relevant to assessing my suitability to work with children. This may include information about any child protection enquiries or assessments involving me, information about any child in my care who has been subject to a child protection plan or care proceedings, and any other relevant information."
            isChecked={watch("consentLAShare") as boolean || false}
            onToggle={() => toggleField("consentLAShare")}
          />
        </div>
      </div>

      {/* Section B - Data Sharing & Use */}
      <div className="rk-consent-section">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-rk-primary/10 flex items-center justify-center">
            <Share2 className="w-4 h-4 text-rk-primary" />
          </div>
          <h4 className="text-lg font-semibold text-rk-text m-0">B. Data Sharing & Use</h4>
        </div>
        
        <div className="space-y-3">
          <ConsentItem
            fieldKey="consentOfstedSharing"
            text="I understand that my data, and the data of connected persons, will be shared with Ofsted and other statutory bodies as legally required for registration, regulation, and safeguarding purposes."
            isChecked={watch("consentOfstedSharing") as boolean || false}
            onToggle={() => toggleField("consentOfstedSharing")}
          />
          <ConsentItem
            fieldKey="consentDataUse"
            text="I understand that Ready Kids will use information received from local authorities and other sources only for the purposes of assessing my suitability to be registered (as a childminder, assistant, household member, or other role), and for meeting its safeguarding and regulatory duties as a childminder agency registered with Ofsted."
            isChecked={watch("consentDataUse") as boolean || false}
            onToggle={() => toggleField("consentDataUse")}
          />
          <ConsentItem
            fieldKey="consentDataProtection"
            text="I understand that Ready Kids will handle all information received in accordance with data protection law and its privacy notice."
            isChecked={watch("consentDataProtection") as boolean || false}
            onToggle={() => toggleField("consentDataProtection")}
          />
        </div>
      </div>

      {/* Section C - Declarations */}
      <div className="rk-consent-section">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-rk-primary/10 flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-rk-primary" />
          </div>
          <h4 className="text-lg font-semibold text-rk-text m-0">C. Declarations</h4>
        </div>
        
        <div className="space-y-3">
          <ConsentItem
            fieldKey="declarationTruth"
            text="I declare that the information provided in this application is true, accurate, and complete to the best of my knowledge. I understand that providing false or misleading information is an offence and will result in the refusal or cancellation of my registration."
            isChecked={watch("declarationTruth") as boolean || false}
            onToggle={() => toggleField("declarationTruth")}
          />
          <ConsentItem
            fieldKey="declarationNotify"
            text="I understand that I must notify Ready Kids of any significant changes to the information provided, including new household members, changes of address, or any new cautions or convictions, within 14 days of the event."
            isChecked={watch("declarationNotify") as boolean || false}
            onToggle={() => toggleField("declarationNotify")}
          />
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
              {...register("signatureFullName")} 
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
              {...register("signatureDate")} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};
