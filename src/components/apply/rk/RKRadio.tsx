import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface RKRadioOption {
  value: string;
  label: string;
  hint?: string;
}

export interface RKRadioProps {
  legend: string;
  hint?: string;
  options: RKRadioOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  name: string;
  inline?: boolean;
}

export const RKRadio = forwardRef<HTMLFieldSetElement, RKRadioProps>(
  ({ legend, hint, options, value, onChange, error, required, name, inline = true }, ref) => {
    return (
      <fieldset ref={ref} className="border-none p-0">
        <legend className="block text-[0.9375rem] font-semibold text-[#334155] mb-2">
          {legend}
          {required && <span className="text-[#DC2626] ml-0.5">*</span>}
        </legend>
        {hint && (
          <span className="block text-sm text-[#64748B] mb-3 leading-normal">{hint}</span>
        )}
        <div className={cn("flex gap-4", inline ? "flex-row flex-wrap" : "flex-col gap-3")}>
          {options.map((option) => (
            <label
              key={option.value}
              className={cn(
                "flex items-start gap-3 px-4 py-4 bg-[#F1F5F9] border-2 border-transparent rounded-[10px] cursor-pointer transition-all duration-150",
                value === option.value 
                  ? "bg-[#E8F5F0] border-[hsl(163,50%,38%)]" 
                  : "hover:bg-[#E2E8F0]",
                error && "border-[#DC2626] bg-[#FEE2E2]"
              )}
            >
              <div className="relative flex items-center justify-center flex-shrink-0 mt-0.5">
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  className="sr-only"
                  aria-invalid={error ? "true" : "false"}
                />
                <div className={cn(
                  "w-[22px] h-[22px] rounded-full border-2 transition-all duration-150 flex items-center justify-center",
                  value === option.value
                    ? "border-[hsl(163,50%,38%)] bg-[hsl(163,50%,38%)]"
                    : "border-[#CBD5E1] bg-white"
                )}>
                  {value === option.value && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <span className="text-base font-medium text-[#334155]">{option.label}</span>
                {option.hint && (
                  <span className="block text-sm text-[#64748B] mt-1">{option.hint}</span>
                )}
              </div>
            </label>
          ))}
        </div>
        {error && (
          <p className="text-sm text-[#DC2626] mt-2">{error}</p>
        )}
      </fieldset>
    );
  }
);

RKRadio.displayName = "RKRadio";