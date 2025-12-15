import { cn } from "@/lib/utils";
import { getStatusColor, getRiskLevelColor } from "@/lib/enforcementUtils";

interface EnforcementBadgeProps {
  variant: 'status' | 'risk' | 'type' | 'timeline';
  value: string;
  className?: string;
}

export const EnforcementBadge = ({ variant, value, className }: EnforcementBadgeProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'status':
        return getStatusColor(value);
      case 'risk':
        return getRiskLevelColor(value);
      case 'type':
        return value === 'suspension' 
          ? 'bg-rose-100 text-rose-800 border-rose-200'
          : value === 'warning'
          ? 'bg-amber-100 text-amber-800 border-amber-200'
          : 'bg-orange-100 text-orange-800 border-orange-200';
      case 'timeline':
        return value === 'completed'
          ? 'bg-emerald-100 text-emerald-700'
          : value === 'urgent'
          ? 'bg-rose-100 text-rose-700'
          : 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const formatValue = (val: string) => {
    return val
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <span 
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border",
        getVariantClasses(),
        className
      )}
    >
      {formatValue(value)}
    </span>
  );
};
