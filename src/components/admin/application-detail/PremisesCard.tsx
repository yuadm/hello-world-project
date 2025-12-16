import { AppleCard } from "@/components/admin/AppleCard";
import { Home, Trees, Dog, CheckCircle2, XCircle } from "lucide-react";

interface PremisesCardProps {
  ownership: string;
  outdoorSpace: string;
  pets: string;
  petsDetails?: string;
  sameAddress?: string;
  premisesType?: string;
  premisesAddress?: any;
  useAdditionalPremises?: string;
  additionalPremises?: any[];
}

export const PremisesCard = ({
  ownership,
  outdoorSpace,
  pets,
  petsDetails,
  sameAddress,
  premisesType,
  premisesAddress,
  useAdditionalPremises,
  additionalPremises,
}: PremisesCardProps) => {
  return (
    <AppleCard className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Home className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold tracking-tight">Premises</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2">
            Ownership
          </div>
          <div className="text-sm font-medium">{ownership || "N/A"}</div>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
          <div className="flex items-center gap-2">
            <Trees className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Outdoor Space</span>
          </div>
          {outdoorSpace === "Yes" ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-muted-foreground" />
          )}
        </div>

        <div>
          <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
            <div className="flex items-center gap-2">
              <Dog className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Pets</span>
            </div>
            {pets === "Yes" ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          
          {pets === "Yes" && petsDetails && (
            <div className="mt-2 text-xs text-muted-foreground p-3 rounded-lg bg-muted/20">
              {petsDetails}
            </div>
          )}
        </div>

        {(sameAddress === "No" || premisesType === "Non-domestic") && premisesAddress && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              {premisesType === "Non-domestic" ? "Non-domestic Premises Address" : "Childcare Address (Different)"}
            </div>
            <div className="text-sm rounded-lg bg-muted/30 p-3">
              {premisesAddress.line1}
              {premisesAddress.line2 && <>, {premisesAddress.line2}</>}
              <br />
              {premisesAddress.town}, {premisesAddress.postcode}
            </div>
          </div>
        )}

        {useAdditionalPremises === "Yes" && additionalPremises && additionalPremises.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              Additional Premises
            </div>
            <div className="space-y-2">
              {additionalPremises.map((premise: any, idx: number) => (
                <div key={idx} className="text-sm rounded-lg bg-muted/30 p-3">
                  <div className="font-medium">{premise.address}</div>
                  <div className="text-xs text-muted-foreground mt-1">{premise.reason}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppleCard>
  );
};
