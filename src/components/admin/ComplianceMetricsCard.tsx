import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComplianceMetricsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  description: string;
  variant: "critical" | "high" | "medium" | "low" | "success";
  trend?: string;
}

export const ComplianceMetricsCard = ({
  title,
  value,
  icon: Icon,
  description,
  variant,
  trend,
}: ComplianceMetricsCardProps) => {
  const variants = {
    critical: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100",
    high: "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-100",
    medium: "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100",
    low: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100",
    success: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100",
  };

  const iconColors = {
    critical: "text-red-600 dark:text-red-400",
    high: "text-orange-600 dark:text-orange-400",
    medium: "text-yellow-600 dark:text-yellow-400",
    low: "text-blue-600 dark:text-blue-400",
    success: "text-green-600 dark:text-green-400",
  };

  return (
    <Card className={cn("hover:shadow-lg transition-shadow", variants[variant])}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium opacity-80">{title}</span>
          <div className={cn("p-2 rounded-full bg-background/50", iconColors[variant])}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-bold">{value}</div>
          {trend && (
            <span className="text-xs opacity-70">{trend}</span>
          )}
        </div>
        <p className="text-xs opacity-70 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
};
