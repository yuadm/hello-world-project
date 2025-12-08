import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface RKButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
}

export const RKButton = forwardRef<HTMLButtonElement, RKButtonProps>(
  ({ variant = "primary", size = "md", className, children, disabled, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center font-semibold rounded-[10px] transition-all duration-150 focus:outline-none focus:shadow-[0_0_0_3px_#FACC15] disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
      primary: "bg-gradient-to-br from-[hsl(163,50%,38%)] to-[hsl(163,50%,32%)] text-white shadow-[0_4px_12px_rgba(12,124,89,0.25)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(12,124,89,0.35)]",
      secondary: "bg-white border-2 border-rk-gray-300 text-rk-gray-700 hover:bg-rk-gray-100 hover:border-rk-gray-400",
      ghost: "bg-transparent text-rk-primary hover:bg-rk-primary-light",
      destructive: "bg-rk-error text-white hover:bg-rk-error/90",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-4 text-base",
      lg: "px-8 py-4 text-[1.0625rem]",
    };

    return (
      <button
        ref={ref}
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

RKButton.displayName = "RKButton";