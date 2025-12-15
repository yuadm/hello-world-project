import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface EnforcementCardProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export const EnforcementCard = ({ 
  title, 
  icon: Icon, 
  children, 
  className,
  headerAction 
}: EnforcementCardProps) => {
  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            {Icon && <Icon className="w-5 h-5 text-slate-600" />}
            {title}
          </CardTitle>
          {headerAction}
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};
