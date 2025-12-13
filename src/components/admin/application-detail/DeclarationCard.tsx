import { AppleCard } from "@/components/admin/AppleCard";
import { Badge } from "@/components/ui/badge";
import { FileCheck, CheckCircle2, Calendar, CreditCard } from "lucide-react";

interface DeclarationCardProps {
  declarationConfirmed?: boolean;
  declarationChangeNotification?: boolean;
  declarationInspectionCooperation?: boolean;
  declarationInformationSharing?: boolean;
  declarationDataProcessing?: boolean;
  declarationSignature?: string;
  declarationDate?: string;
  paymentMethod?: string;
}

export const DeclarationCard = ({
  declarationConfirmed,
  declarationChangeNotification,
  declarationInspectionCooperation,
  declarationInformationSharing,
  declarationDataProcessing,
  declarationSignature,
  declarationDate,
  paymentMethod,
}: DeclarationCardProps) => {
  const declarations = [
    { label: "Accuracy Confirmed", value: declarationConfirmed },
    { label: "Change Notification", value: declarationChangeNotification },
    { label: "Inspection Cooperation", value: declarationInspectionCooperation },
    { label: "Information Sharing", value: declarationInformationSharing },
    { label: "Data Processing", value: declarationDataProcessing },
  ];

  return (
    <AppleCard className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileCheck className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold tracking-tight">Declaration & Payment</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-3">Declarations</div>
          <div className="space-y-2">
            {declarations.map((declaration, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between rounded-lg p-3 ${
                  declaration.value
                    ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900'
                    : 'bg-muted/30'
                }`}
              >
                <span className="text-sm">{declaration.label}</span>
                {declaration.value && (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                )}
              </div>
            ))}
          </div>
        </div>

        {declarationSignature && (
          <div className="pt-4 border-t border-border">
            <div className="text-xs font-medium text-muted-foreground mb-2">Signature</div>
            <div className="text-sm font-medium italic">{declarationSignature}</div>
          </div>
        )}


        {declarationDate && (
          <div className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
            <Calendar className="h-4 w-4 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">Declaration Date</div>
              <div className="text-sm font-medium">{declarationDate}</div>
            </div>
          </div>
        )}

        {paymentMethod && (
          <div className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
            <CreditCard className="h-4 w-4 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">Payment Method</div>
              <div className="text-sm font-medium">{paymentMethod}</div>
            </div>
          </div>
        )}
      </div>
    </AppleCard>
  );
};
