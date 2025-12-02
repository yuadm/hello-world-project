import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertCircle } from "lucide-react";
import { format } from "date-fns";

type DBSStatus = "not_requested" | "requested" | "received" | "expired";

interface EmployeeDBSCardProps {
  dbsStatus: DBSStatus;
  dbsCertificateNumber?: string | null;
  dbsCertificateDate?: string | null;
  dbsCertificateExpiryDate?: string | null;
  onRequestDBS: () => void;
}

const getDBSStatusConfig = (status: DBSStatus) => {
  switch (status) {
    case "received":
      return {
        label: "Received",
        variant: "default" as const,
        color: "text-green-600 dark:text-green-400",
      };
    case "requested":
      return {
        label: "Requested",
        variant: "secondary" as const,
        color: "text-blue-600 dark:text-blue-400",
      };
    case "expired":
      return {
        label: "Expired",
        variant: "destructive" as const,
        color: "text-red-600 dark:text-red-400",
      };
    default:
      return {
        label: "Not Requested",
        variant: "outline" as const,
        color: "text-muted-foreground",
      };
  }
};

export function EmployeeDBSCard({
  dbsStatus,
  dbsCertificateNumber,
  dbsCertificateDate,
  dbsCertificateExpiryDate,
  onRequestDBS,
}: EmployeeDBSCardProps) {
  const statusConfig = getDBSStatusConfig(dbsStatus);
  
  // Calculate days until expiry if applicable
  let daysUntilExpiry: number | null = null;
  if (dbsCertificateExpiryDate && dbsStatus === "received") {
    const today = new Date();
    const expiryDate = new Date(dbsCertificateExpiryDate);
    const diffTime = expiryDate.getTime() - today.getTime();
    daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  const showExpiryWarning = daysUntilExpiry !== null && daysUntilExpiry <= 90 && daysUntilExpiry > 0;

  return (
    <Card className="rounded-2xl border-0 shadow-apple-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold tracking-tight flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          DBS Certificate
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={onRequestDBS}
          className="rounded-lg"
        >
          Request DBS
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Status:</span>
          <Badge
            variant={statusConfig.variant}
            className="rounded-full px-3 py-1"
          >
            {statusConfig.label}
          </Badge>
        </div>

        {dbsCertificateNumber && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Certificate Number</p>
            <p className="text-sm font-mono bg-muted px-3 py-2 rounded-lg">
              {dbsCertificateNumber}
            </p>
          </div>
        )}

        {dbsCertificateDate && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Issue Date</p>
              <p className="text-sm">
                {format(new Date(dbsCertificateDate), "MMM dd, yyyy")}
              </p>
            </div>
            {dbsCertificateExpiryDate && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Expiry Date</p>
                <p className="text-sm">
                  {format(new Date(dbsCertificateExpiryDate), "MMM dd, yyyy")}
                </p>
              </div>
            )}
          </div>
        )}

        {showExpiryWarning && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Certificate expiring in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {dbsStatus === "expired" && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-300">
              DBS certificate has expired. A new check is required.
            </p>
          </div>
        )}

        {dbsStatus === "not_requested" && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              No DBS check has been requested for this employee yet.
            </p>
          </div>
        )}

        {dbsStatus === "requested" && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              DBS check request is pending.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
