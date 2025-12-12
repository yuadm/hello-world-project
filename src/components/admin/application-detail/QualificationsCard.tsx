import { AppleCard } from "@/components/admin/AppleCard";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, CheckCircle2, XCircle } from "lucide-react";

interface TrainingEntry {
  completed: "Yes" | "No";
  provider?: string;
  completionDate?: string;
  certificateNumber?: string;
}

interface QualificationsCardProps {
  firstAid?: TrainingEntry;
  safeguarding?: TrainingEntry;
  eyfsChildminding?: TrainingEntry;
  level2Qual?: TrainingEntry;
}

export const QualificationsCard = ({
  firstAid,
  safeguarding,
  eyfsChildminding,
  level2Qual,
}: QualificationsCardProps) => {
  const QualItem = ({ title, qual }: { title: string; qual?: TrainingEntry }) => (
    <div className="rounded-lg bg-muted/30 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">{title}</div>
        {qual?.completed === "Yes" ? (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        ) : (
          <XCircle className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      
      {qual?.completed === "Yes" ? (
        <div className="space-y-1 text-xs text-muted-foreground">
          {qual.provider && <div>Provider: {qual.provider}</div>}
          {qual.completionDate && <div>Completed: {qual.completionDate}</div>}
          {qual.certificateNumber && <div>Cert: {qual.certificateNumber}</div>}
        </div>
      ) : (
        <Badge variant="outline" className="text-xs">
          Not Completed
        </Badge>
      )}
    </div>
  );

  return (
    <AppleCard className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <GraduationCap className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold tracking-tight">Qualifications</h3>
      </div>
      
      <div className="space-y-3">
        <QualItem title="First Aid" qual={firstAid} />
        <QualItem title="Safeguarding" qual={safeguarding} />
        <QualItem title="EYFS Childminding" qual={eyfsChildminding} />
        <QualItem title="Level 2 Qualification" qual={level2Qual} />
      </div>
    </AppleCard>
  );
};
