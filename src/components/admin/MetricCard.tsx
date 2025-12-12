import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "success" | "warning" | "error";
  className?: string;
  onClick?: () => void;
}

const variantStyles = {
  default: {
    bg: "bg-card",
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
  },
  primary: {
    bg: "bg-gradient-to-br from-primary/10 to-accent/10",
    iconBg: "bg-gradient-to-br from-primary to-accent",
    iconColor: "text-white",
  },
  success: {
    bg: "bg-[hsl(var(--admin-success-light))]",
    iconBg: "bg-[hsl(var(--admin-success))]",
    iconColor: "text-white",
  },
  warning: {
    bg: "bg-[hsl(var(--admin-warning-light))]",
    iconBg: "bg-[hsl(var(--admin-warning))]",
    iconColor: "text-white",
  },
  error: {
    bg: "bg-[hsl(var(--admin-error-light))]",
    iconBg: "bg-[hsl(var(--admin-error))]",
    iconColor: "text-white",
  },
};

const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  className,
  onClick,
}: MetricCardProps) => {
  const styles = variantStyles[variant];

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl p-5 transition-all duration-300",
        styles.bg,
        "border border-[hsl(var(--admin-border))] hover:border-[hsl(var(--admin-border-hover))]",
        "hover:shadow-[var(--admin-shadow-lg)] hover:-translate-y-0.5",
        onClick && "cursor-pointer",
        className
      )}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />

      <div className="relative flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground tracking-tight">
              {value}
            </span>
            {trend && (
              <span
                className={cn(
                  "text-xs font-semibold px-1.5 py-0.5 rounded-md",
                  trend.isPositive
                    ? "text-[hsl(var(--admin-success))] bg-[hsl(var(--admin-success-light))]"
                    : "text-[hsl(var(--admin-error))] bg-[hsl(var(--admin-error-light))]"
                )}
              >
                {trend.isPositive ? "+" : ""}{trend.value}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>

        <div
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-xl transition-transform duration-300 group-hover:scale-110",
            styles.iconBg
          )}
        >
          <Icon className={cn("w-6 h-6", styles.iconColor)} />
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
