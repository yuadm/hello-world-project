import { cn } from "@/lib/utils";
import { Info, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

export interface RKInfoBoxProps {
  type: "info" | "warning" | "success" | "error";
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const RKInfoBox = ({ type, title, children, className }: RKInfoBoxProps) => {
  const config = {
    info: {
      icon: Info,
      bgClass: "bg-[#DBEAFE]",
      borderClass: "border-l-4 border-l-[#2563EB]",
      iconClass: "text-[#2563EB]",
      titleClass: "text-[#334155]",
    },
    warning: {
      icon: AlertTriangle,
      bgClass: "bg-[#FEF3C7]",
      borderClass: "border-l-4 border-l-[#D97706]",
      iconClass: "text-[#D97706]",
      titleClass: "text-[#334155]",
    },
    success: {
      icon: CheckCircle2,
      bgClass: "bg-[#D1FAE5]",
      borderClass: "border-l-4 border-l-[#059669]",
      iconClass: "text-[#059669]",
      titleClass: "text-[#334155]",
    },
    error: {
      icon: XCircle,
      bgClass: "bg-[#FEE2E2]",
      borderClass: "border-l-4 border-l-[#DC2626]",
      iconClass: "text-[#DC2626]",
      titleClass: "text-[#334155]",
    },
  };

  const { icon: Icon, bgClass, borderClass, iconClass, titleClass } = config[type];

  return (
    <div className={cn("flex gap-4 p-5 rounded-[10px]", bgClass, borderClass, className)}>
      <Icon className={cn("h-6 w-6 flex-shrink-0", iconClass)} />
      <div className="flex-1">
        {title && (
          <h4 className={cn("text-[0.9375rem] font-semibold mb-1", titleClass)}>{title}</h4>
        )}
        <p className="text-[0.9375rem] text-[#475569] leading-relaxed">{children}</p>
      </div>
    </div>
  );
};