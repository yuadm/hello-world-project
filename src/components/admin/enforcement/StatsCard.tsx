import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'critical' | 'warning' | 'success';
  className?: string;
}

export const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon,
  variant = 'default',
  className 
}: StatsCardProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'critical':
        return 'bg-rose-50 border-rose-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      case 'success':
        return 'bg-emerald-50 border-emerald-200';
      default:
        return 'bg-white border-slate-200';
    }
  };

  const getValueColor = () => {
    switch (variant) {
      case 'critical':
        return 'text-rose-700';
      case 'warning':
        return 'text-amber-700';
      case 'success':
        return 'text-emerald-700';
      default:
        return 'text-slate-900';
    }
  };

  return (
    <div className={cn(
      "rounded-xl border p-5 transition-all hover:shadow-md",
      getVariantStyles(),
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className={cn("text-3xl font-bold mt-1", getValueColor())}>{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={cn(
            "p-2 rounded-lg",
            variant === 'critical' ? 'bg-rose-100' :
            variant === 'warning' ? 'bg-amber-100' :
            variant === 'success' ? 'bg-emerald-100' :
            'bg-slate-100'
          )}>
            <Icon className={cn(
              "w-5 h-5",
              variant === 'critical' ? 'text-rose-600' :
              variant === 'warning' ? 'text-amber-600' :
              variant === 'success' ? 'text-emerald-600' :
              'text-slate-600'
            )} />
          </div>
        )}
      </div>
    </div>
  );
};
