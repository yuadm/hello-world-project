import { cn } from "@/lib/utils";

interface RKSectionTitleProps {
  title: string;
  subtitle?: string;
  description?: string;
  className?: string;
}

export const RKSectionTitle = ({ title, subtitle, description, className }: RKSectionTitleProps) => {
  const descText = description || subtitle;
  
  return (
    <div className={cn("mb-8", className)}>
      <h2 className="text-[1.75rem] font-bold text-[#0F172A] font-fraunces mb-2">{title}</h2>
      {descText && (
        <p className="text-base text-[#64748B] leading-relaxed max-w-[600px]">{descText}</p>
      )}
    </div>
  );
};