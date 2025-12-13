import { AppleCard } from "@/components/admin/AppleCard";
import { Badge } from "@/components/ui/badge";
import { Baby, Users, MapPin, Building2 } from "lucide-react";

interface CochildminderEntry {
  firstName: string;
  lastName: string;
  dob: string;
  email: string;
  phone?: string;
}

interface ServiceDetailsCardProps {
  serviceType: string;
  ageGroups: string[];
  capacity: {
    under1?: number;
    under5?: number;
    ages5to8?: number;
    ages8plus?: number;
  };
  localAuthority: string;
  workWithOthers: string;
  numberOfAssistants?: number;
  workWithCochildminders?: string;
  numberOfCochildminders?: number;
  cochildminders?: CochildminderEntry[];
  serviceHours?: string[];
  overnightCare?: string;
  ofstedRegistered?: string;
  ofstedNumber?: string;
}

export const ServiceDetailsCard = ({
  serviceType,
  ageGroups,
  capacity,
  localAuthority,
  workWithOthers,
  numberOfAssistants,
  workWithCochildminders,
  numberOfCochildminders,
  cochildminders,
  serviceHours,
  overnightCare,
  ofstedRegistered,
  ofstedNumber,
}: ServiceDetailsCardProps) => {
  return (
    <AppleCard className="p-6 col-span-2">
      <h3 className="text-lg font-semibold tracking-tight mb-4">Service Details</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Service Type</span>
          </div>
          <div className="text-sm font-medium mb-4">{serviceType || "N/A"}</div>

          <div className="flex items-center gap-2 mb-3">
            <Baby className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Age Groups</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {ageGroups && ageGroups.length > 0 ? (
              ageGroups.map((group, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {group}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">N/A</span>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Proposed Capacity</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/30 p-3">
              <div className="text-xs text-muted-foreground mb-1">Under 1</div>
              <div className="text-lg font-semibold tracking-tight">{capacity.under1 || 0}</div>
            </div>
            <div className="rounded-lg bg-muted/30 p-3">
              <div className="text-xs text-muted-foreground mb-1">1-5 years</div>
              <div className="text-lg font-semibold tracking-tight">{capacity.under5 || 0}</div>
            </div>
            <div className="rounded-lg bg-muted/30 p-3">
              <div className="text-xs text-muted-foreground mb-1">5-8 years</div>
              <div className="text-lg font-semibold tracking-tight">{capacity.ages5to8 || 0}</div>
            </div>
            <div className="rounded-lg bg-muted/30 p-3">
              <div className="text-xs text-muted-foreground mb-1">8+ years</div>
              <div className="text-lg font-semibold tracking-tight">{capacity.ages8plus || 0}</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Local Authority</span>
            </div>
            <div className="text-sm font-medium">{localAuthority || "N/A"}</div>
          </div>

          {workWithOthers === "Yes" && (
            <div className="mt-4">
              <Badge variant="outline" className="text-xs">
                {numberOfAssistants || 0} Assistant{(numberOfAssistants || 0) !== 1 ? "s" : ""}
              </Badge>
            </div>
          )}

          {workWithCochildminders === "Yes" && (
            <div className="mt-4">
              <Badge variant="outline" className="text-xs bg-amber-50 border-amber-200 text-amber-700">
                {numberOfCochildminders || 0} Co-childminder{(numberOfCochildminders || 0) !== 1 ? "s" : ""}
              </Badge>
              {cochildminders && cochildminders.length > 0 && (
                <div className="mt-2 space-y-2">
                  {cochildminders.map((cc, idx) => (
                    <div key={idx} className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                      <div className="font-medium">{cc.firstName} {cc.lastName}</div>
                      <div>{cc.email}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {(serviceHours && serviceHours.length > 0) || overnightCare || ofstedRegistered || ofstedNumber ? (
        <div className="mt-4 pt-4 border-t border-border">
          {(ofstedRegistered || ofstedNumber) && (
            <div className="mb-4">
              <div className="text-xs font-medium text-muted-foreground mb-2">Ofsted Registration</div>
              <div className="flex items-center gap-2">
                {ofstedRegistered === "Yes" && (
                  <Badge variant="outline" className="text-xs">Previously Registered</Badge>
                )}
                {ofstedNumber && (
                  <div className="text-sm font-mono">{ofstedNumber}</div>
                )}
              </div>
            </div>
          )}
          
          {serviceHours && serviceHours.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-medium text-muted-foreground mb-2">Service Hours</div>
              <div className="flex flex-wrap gap-2">
                {serviceHours.map((time, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {time}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {overnightCare === "Yes" && (
            <Badge variant="outline" className="text-xs">Overnight Care</Badge>
          )}
        </div>
      ) : null}
    </AppleCard>
  );
};
