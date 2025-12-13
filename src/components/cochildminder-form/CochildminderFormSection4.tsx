import { CochildminderFormData } from "@/types/cochildminder";
import { RKSectionTitle, RKInfoBox } from "@/components/apply/rk";
import { Clock, Users } from "lucide-react";

interface Props {
  formData: CochildminderFormData;
}

export function CochildminderFormSection4({ formData }: Props) {
  const formatAgeGroups = (ageGroups: string[]) => {
    if (!ageGroups || ageGroups.length === 0) return "Not specified";
    
    const labels: Record<string, string> = {
      "under_1": "Under 1 year",
      "1_to_2": "1-2 years",
      "2_to_3": "2-3 years",
      "3_to_5": "3-5 years",
      "5_to_8": "5-8 years",
      "8_plus": "8+ years"
    };
    
    return ageGroups.map(g => labels[g] || g).join(", ");
  };

  const formatHours = (hours: string[]) => {
    if (!hours || hours.length === 0) return "Not specified";
    
    const labels: Record<string, string> = {
      "term_time_only": "Term time only",
      "all_year": "All year round",
      "before_school": "Before school",
      "after_school": "After school",
      "weekdays": "Weekdays",
      "weekends": "Weekends",
      "overnight": "Overnight care"
    };
    
    return hours.map(h => labels[h] || h).join(", ");
  };

  return (
    <div>
      <RKSectionTitle 
        title="4. Service Details"
        description="As a co-childminder, you will be offering the same service as the main applicant. These details have been pre-filled from their application."
      />

      <div className="space-y-6">
        <RKInfoBox type="info">
          <p>
            The service details below reflect the childminding service you will be providing together with the main applicant.
          </p>
        </RKInfoBox>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Age Groups</h3>
              <p className="text-gray-700">{formatAgeGroups(formData.serviceAgeGroups)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Service Hours</h3>
              <p className="text-gray-700">{formatHours(formData.serviceHours)}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <strong>Note:</strong> As a co-childminder, you will be jointly responsible for the care of children 
          at the shared premises. You must ensure you have appropriate qualifications, DBS checks, and 
          insurance in place before commencing work.
        </div>
      </div>
    </div>
  );
}
