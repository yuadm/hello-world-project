import { cn } from "@/lib/utils";

interface RKFormHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export const RKFormHeader = ({ title, subtitle, className }: RKFormHeaderProps) => {
  return (
    <div className={cn(
      "bg-gradient-to-br from-[hsl(163,50%,38%)] to-[hsl(163,50%,32%)] px-6 py-8 md:px-10 md:py-8",
      className
    )}>
      <h1 className="text-2xl md:text-[2rem] font-bold text-white font-fraunces mb-2">
        {title}
      </h1>
      {subtitle && (
        <p className="text-base text-white/90">{subtitle}</p>
      )}
    </div>
  );
};