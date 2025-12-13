import { CochildminderFormData } from "@/types/cochildminder";
import { RKSectionTitle, RKInfoBox } from "@/components/apply/rk";
import { MapPin, Building2 } from "lucide-react";

interface Props {
  formData: CochildminderFormData;
}

export function CochildminderFormSection3({ formData }: Props) {
  const formatAddress = (address: { line1: string; line2?: string; town: string; postcode: string }) => {
    const parts = [address.line1, address.line2, address.town, address.postcode].filter(Boolean);
    return parts.join(", ");
  };

  return (
    <div>
      <RKSectionTitle 
        title="3. Childminding Premises"
        description="As a co-childminder, you will be working at the same premises as the main applicant. These details have been pre-filled from their application."
      />

      <div className="space-y-6">
        <RKInfoBox type="info">
          <p>
            The premises details below are taken from the main childminder's application. 
            You will be working at this location together.
          </p>
        </RKInfoBox>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <MapPin className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Premises Address</h3>
              <p className="text-gray-700">
                {formData.premisesAddress?.line1 ? formatAddress(formData.premisesAddress) : "Not provided"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Building2 className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Local Authority</h3>
              <p className="text-gray-700">{formData.localAuthority || "Not provided"}</p>
            </div>
          </div>

          {formData.premisesType && (
            <div className="pt-3 border-t border-amber-200">
              <span className="text-sm text-amber-700 font-medium">Premises Type: </span>
              <span className="text-sm text-gray-700 capitalize">{formData.premisesType.replace(/_/g, " ")}</span>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <strong>Note:</strong> If you believe any of the premises details above are incorrect, 
          please contact the main applicant or ReadyKids support before submitting your application.
        </div>
      </div>
    </div>
  );
}
