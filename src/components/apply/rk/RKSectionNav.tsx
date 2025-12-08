import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface RKSectionNavProps {
  sections: Array<{ id: number; label: string }>;
  currentSection: number;
  onSectionClick: (section: number) => void;
  className?: string;
}

export const RKSectionNav = ({ sections, currentSection, onSectionClick, className }: RKSectionNavProps) => {
  return (
    <nav className={cn(
      "bg-white rounded-2xl p-4 shadow-[0_4px_12px_rgba(15,23,42,0.08)]",
      className
    )}>
      {/* Desktop: Vertical list with labels */}
      <div className="hidden lg:flex flex-col gap-1">
        {sections.map((section) => {
          const isActive = section.id === currentSection;
          const isCompleted = section.id < currentSection;
          
          return (
            <button
              key={section.id}
              onClick={() => onSectionClick(section.id)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-150 border-2 border-transparent text-left",
                isActive
                  ? "bg-[#E8F5F0] border-[hsl(163,50%,38%)]"
                  : isCompleted
                    ? "bg-[#D1FAE5]"
                    : "hover:bg-rk-gray-100"
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-all",
                  isActive
                    ? "bg-[hsl(163,50%,38%)] text-white shadow-[0_2px_8px_rgba(12,124,89,0.3)]"
                    : isCompleted
                      ? "bg-[#059669] text-white"
                      : "bg-rk-gray-300 text-white"
                )}
              >
                {isCompleted ? <Check className="h-3.5 w-3.5" /> : section.id}
              </div>
              <span
                className={cn(
                  "text-sm font-medium",
                  isActive
                    ? "text-[hsl(163,50%,32%)] font-semibold"
                    : "text-rk-gray-700"
                )}
              >
                {section.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile: Horizontal scroll with numbers only */}
      <div className="flex lg:hidden items-center justify-start gap-2 overflow-x-auto pb-1 -webkit-overflow-scrolling-touch">
        {sections.map((section) => {
          const isActive = section.id === currentSection;
          const isCompleted = section.id < currentSection;
          
          return (
            <button
              key={section.id}
              onClick={() => onSectionClick(section.id)}
              className={cn(
                "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200",
                isActive
                  ? "bg-[hsl(163,50%,38%)] text-white shadow-[0_2px_8px_rgba(12,124,89,0.3)]"
                  : isCompleted
                    ? "bg-[#059669] text-white"
                    : "bg-rk-gray-300 text-white"
              )}
              title={section.label}
            >
              {isCompleted ? <Check className="h-3.5 w-3.5" /> : section.id}
            </button>
          );
        })}
      </div>
    </nav>
  );
};