import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

export interface RKSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
  widthClass?: "full" | "half" | "auto";
}

export const RKSelect = forwardRef<HTMLSelectElement, RKSelectProps>(
  ({ label, hint, error, required, options, widthClass = "full", className, ...props }, ref) => {
    const widthClasses = {
      full: "w-full",
      half: "w-full md:w-1/2",
      auto: "w-auto min-w-[12rem]",
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
        <div className={cn("relative", widthClasses[widthClass])}>
          <select
            ref={ref}
            className={cn(
              "w-full px-4 py-3 bg-white border-2 border-[#E2E8F0] rounded-[10px] text-base text-[#334155] appearance-none cursor-pointer transition-all duration-150 pr-11",
              "hover:border-[#CBD5E1] focus:outline-none focus:border-[hsl(163,50%,38%)] focus:shadow-[0_0_0_4px_rgba(12,124,89,0.12)]",
              error && "border-[#DC2626] bg-[#FEE2E2] focus:border-[#DC2626] focus:shadow-[0_0_0_4px_rgba(220,38,38,0.12)]",
              className
            )}
            aria-invalid={error ? "true" : "false"}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#64748B] pointer-events-none" />
        </div>
        {error && (
          <p className="text-sm text-[#DC2626] mt-1">{error}</p>
        )}
      </div>
    );
  }
);

RKSelect.displayName = "RKSelect";