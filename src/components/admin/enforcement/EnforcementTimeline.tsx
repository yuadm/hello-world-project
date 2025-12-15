import { Check, Clock, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/enforcementUtils";
import { EnforcementTimeline as TimelineType } from "@/types/enforcement";
import { cn } from "@/lib/utils";

interface EnforcementTimelineProps {
  events: TimelineType[];
  className?: string;
}

export const EnforcementTimeline = ({ events, className }: EnforcementTimelineProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'completed':
        return <Check className="w-4 h-4 text-emerald-600" />;
      case 'urgent':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getLineColor = (type: string) => {
    switch (type) {
      case 'completed':
        return 'bg-emerald-200';
      case 'urgent':
        return 'bg-rose-200';
      default:
        return 'bg-slate-200';
    }
  };

  const getDotColor = (type: string) => {
    switch (type) {
      case 'completed':
        return 'bg-emerald-100 border-emerald-300';
      case 'urgent':
        return 'bg-rose-100 border-rose-300';
      default:
        return 'bg-slate-100 border-slate-300';
    }
  };

  return (
    <div className={cn("space-y-0", className)}>
      {events.map((event, index) => (
        <div key={event.id} className="flex gap-3">
          {/* Timeline line and dot */}
          <div className="flex flex-col items-center">
            <div className={cn(
              "w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0",
              getDotColor(event.type)
            )}>
              {getIcon(event.type)}
            </div>
            {index < events.length - 1 && (
              <div className={cn("w-0.5 flex-1 min-h-[24px]", getLineColor(event.type))} />
            )}
          </div>
          
          {/* Event content */}
          <div className="pb-4">
            <p className="text-sm font-medium text-slate-900">{event.event}</p>
            <p className="text-xs text-slate-500">{formatDate(event.date)}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
