import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface RKInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  widthClass?: "full" | "10" | "20" | "half";
}

export const RKInput = forwardRef<HTMLInputElement, RKInputProps>(
  ({ label, hint, error, required, widthClass = "full", className, ...props }, ref) => {
    const widthClasses = {
      full: "w-full",
      half: "w-full md:w-1/2",
      10: "w-full max-w-[180px]",
      20: "w-full max-w-[280px]",
    };

    return (
      <div className="space-y-2">
        <label className="block text-[0.9375rem] font-semibold text-[#334155]">
          {label}
          {required && <span className="text-[#DC2626] ml-0.5">*</span>}
        </label>
        {hint && (
          <span className="block text-sm text-[#64748B] leading-normal">{hint}</span>
        )}
        <input
          ref={ref}
          className={cn(
            "px-4 py-3 bg-white border-2 border-[#E2E8F0] rounded-[10px] text-base text-[#334155] placeholder:text-[#94A3B8] transition-all duration-150",
            "hover:border-[#CBD5E1] focus:outline-none focus:border-[hsl(163,50%,38%)] focus:shadow-[0_0_0_4px_rgba(12,124,89,0.12)]",
            error && "border-[#DC2626] bg-[#FEE2E2] focus:border-[#DC2626] focus:shadow-[0_0_0_4px_rgba(220,38,38,0.12)]",
            widthClasses[widthClass],
            className
          )}
          aria-invalid={error ? "true" : "false"}
          {...props}
        />
        {error && (
          <p className="text-sm text-[#DC2626] mt-1">{error}</p>
        )}
      </div>
    );
  }
);

RKInput.displayName = "RKInput";