import { cn } from "@/lib/utils";

interface DualTrafficLightIndicatorProps {
  formStatus: "compliant" | "pending" | "critical";
  dbsStatus: "compliant" | "pending" | "critical";
  className?: string;
}

const statusConfig: Record<"compliant" | "pending" | "critical", { activeLight: "red" | "amber" | "green"; label: string }> = {
  compliant: {
    activeLight: "green",
    label: "Submitted",
  },
  pending: {
    activeLight: "amber",
    label: "Awaiting response",
  },
  critical: {
    activeLight: "red",
    label: "Action required",
  },
};

const TrafficLight = ({ activeLight }: { activeLight: "red" | "amber" | "green" }) => {
  return (
    <div className="bg-gray-900 rounded-full p-0.5 flex flex-col gap-0.5">
      <div
        className={cn(
          "w-2 h-2 rounded-full transition-colors",
          activeLight === "red" ? "bg-red-500" : "bg-gray-700"
        )}
      />
      <div
        className={cn(
          "w-2 h-2 rounded-full transition-colors",
          activeLight === "amber" ? "bg-amber-500" : "bg-gray-700"
        )}
      />
      <div
        className={cn(
          "w-2 h-2 rounded-full transition-colors",
          activeLight === "green" ? "bg-green-500" : "bg-gray-700"
        )}
      />
    </div>
  );
};

export const DualTrafficLightIndicator = ({
  formStatus,
  dbsStatus,
  className,
}: DualTrafficLightIndicatorProps) => {
  const formConfig = statusConfig[formStatus];
  const dbsConfig = statusConfig[dbsStatus];

  return (
    <div className={cn("flex items-center gap-4 text-sm", className)}>
      <div className="flex items-center gap-2">
        <TrafficLight activeLight={formConfig.activeLight} />
        <span className="text-muted-foreground">
          Form: <span className="text-foreground">{formConfig.label}</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <TrafficLight activeLight={dbsConfig.activeLight} />
        <span className="text-muted-foreground">
          DBS: <span className="text-foreground">{dbsConfig.label}</span>
        </span>
      </div>
    </div>
  );
};
