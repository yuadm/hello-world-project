import { cn } from "@/lib/utils";

interface RKProgressCardProps {
  currentSection: number;
  totalSections: number;
  className?: string;
}

export const RKProgressCard = ({ currentSection, totalSections, className }: RKProgressCardProps) => {
  const percentage = Math.round(((currentSection - 1) / totalSections) * 100);
  
  return (
    <div className={cn(
      "bg-white rounded-2xl p-6 shadow-[0_4px_12px_rgba(15,23,42,0.08)]",
      className
    )}>
      <div className="flex items-baseline justify-between mb-4">
        <span className="text-sm font-semibold text-rk-gray-800 uppercase tracking-[0.05em]">Progress</span>
        <span className="text-2xl font-bold text-rk-primary font-fraunces">{percentage}%</span>
      </div>
      <div className="h-2 bg-rk-gray-200 rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-gradient-to-r from-[hsl(163,50%,38%)] to-[hsl(188,75%,39%)] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-sm text-rk-gray-600">Section {currentSection} of {totalSections}</p>
    </div>
  );
};