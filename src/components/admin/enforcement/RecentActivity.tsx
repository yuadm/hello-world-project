import { useRecentActivity } from "@/hooks/useEnforcementData";
import { EnforcementCard } from "./EnforcementCard";
import { Activity, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export const RecentActivity = () => {
  const { data: activities = [], isLoading } = useRecentActivity();

  if (isLoading) {
    return (
      <EnforcementCard title="Recent Activity" icon={Activity}>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-lg" />
          ))}
        </div>
      </EnforcementCard>
    );
  }

  if (activities.length === 0) {
    return (
      <EnforcementCard title="Recent Activity" icon={Activity}>
        <div className="text-center py-8 text-slate-500">
          <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No recent activity</p>
        </div>
      </EnforcementCard>
    );
  }

  return (
    <EnforcementCard title="Recent Activity" icon={Activity}>
      <div className="space-y-3">
        {activities.map((activity: any) => {
          const employeeName = activity.enforcement_cases?.employees
            ? `${activity.enforcement_cases.employees.first_name} ${activity.enforcement_cases.employees.last_name}`
            : 'Unknown';

          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                activity.type === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                activity.type === 'urgent' ? 'bg-rose-100 text-rose-600' :
                'bg-amber-100 text-amber-600'
              )}>
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {activity.event}
                </p>
                <p className="text-xs text-slate-500">
                  {employeeName} • {activity.created_by || 'System'}
                </p>
              </div>
              <span className="text-xs text-slate-400 shrink-0">
                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
              </span>
            </div>
          );
        })}
      </div>
    </EnforcementCard>
  );
};
