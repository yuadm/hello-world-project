import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import MetricCard from "@/components/admin/MetricCard";
import { Turning16Card } from "@/components/admin/Turning16Card";
import { Shimmer } from "@/components/ui/shimmer";
import {
  FileText,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Calendar,
  Shield,
  TrendingUp,
  Activity,
} from "lucide-react";
import { format } from "date-fns";

interface DashboardMetrics {
  pendingApplications: number;
  activeEmployees: number;
  criticalAlerts: number;
  completionRate: number;
  totalApplications: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    pendingApplications: 0,
    activeEmployees: 0,
    criticalAlerts: 0,
    completionRate: 0,
    totalApplications: 0,
  });

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      // Fetch applications
      const { data: applications } = await supabase
        .from('childminder_applications')
        .select('status');

      const pending = (applications || []).filter((app: any) => app.status === 'pending' || app.status === 'submitted').length;

      // Fetch employees
      const { data: employees } = await supabase
        .from('employees')
        .select('employment_status');

      const active = (employees || []).filter((emp: any) => emp.employment_status === 'active').length;

      // Fetch household members for compliance (only employee household members)
      const { data: householdMembers } = await supabase
        .from('compliance_household_members')
        .select('dbs_status, compliance_status')
        .not('employee_id', 'is', null);

      const criticalCount = (householdMembers || []).filter((m: any) => 
        m.compliance_status === 'overdue' || m.dbs_status === 'expired'
      ).length;

      const compliant = (householdMembers || []).filter((m: any) => 
        m.dbs_status === 'received'
      ).length;

      const total = householdMembers?.length || 0;
      const rate = total > 0 ? Math.round((compliant / total) * 100) : 0;

      setMetrics({
        pendingApplications: pending,
        activeEmployees: active,
        criticalAlerts: criticalCount,
        completionRate: rate,
        totalApplications: applications?.length || 0,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load metrics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <AdminLayout>
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              {getGreeting()}, Admin
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your childminder registrations today.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card px-4 py-2 rounded-xl border border-[hsl(var(--admin-border))]">
            <Calendar className="w-4 h-4" />
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {loading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Shimmer key={i} className="h-32 rounded-2xl" />
            ))}
          </>
        ) : (
          <>
            <MetricCard
              title="Total Applications"
              value={metrics.totalApplications}
              icon={FileText}
              variant="primary"
              onClick={() => navigate("/admin/applications")}
            />
            <MetricCard
              title="Pending Review"
              value={metrics.pendingApplications}
              subtitle="Awaiting action"
              icon={Clock}
              variant="warning"
              onClick={() => navigate("/admin/applications?status=submitted")}
            />
            <MetricCard
              title="Active Employees"
              value={metrics.activeEmployees}
              icon={Users}
              variant="success"
              onClick={() => navigate("/admin/employees")}
            />
            <MetricCard
              title="Compliance Alerts"
              value={metrics.criticalAlerts}
              subtitle="DBS certificates needed"
              icon={AlertTriangle}
              variant={metrics.criticalAlerts > 0 ? "error" : "default"}
            />
          </>
        )}
      </div>

      {/* Quick Actions & Turning 16 Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <QuickActionCard
              title="Review Applications"
              description="Review pending childminder applications"
              icon={FileText}
              count={metrics.pendingApplications}
              onClick={() => navigate("/admin/applications")}
            />
            <QuickActionCard
              title="Manage Employees"
              description="View and manage registered childminders"
              icon={Users}
              count={metrics.activeEmployees}
              onClick={() => navigate("/admin/employees")}
            />
            <QuickActionCard
              title="DBS Compliance"
              description="Monitor DBS certificate status"
              icon={Shield}
              count={metrics.criticalAlerts}
              variant={metrics.criticalAlerts > 0 ? "warning" : "default"}
              onClick={() => navigate("/admin/employees")}
            />
            <QuickActionCard
              title="Completion Rate"
              description="Overall DBS completion percentage"
              icon={TrendingUp}
              count={metrics.completionRate}
              suffix="%"
              variant="success"
              onClick={() => navigate("/admin/employees")}
            />
          </div>
        </div>

        {/* Turning 16 Card */}
        <div>
          <Turning16Card />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mt-8 p-6 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl border border-[hsl(var(--admin-border))]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {metrics.completionRate}% DBS Compliance Rate
              </h3>
              <p className="text-sm text-muted-foreground">
                Keep up the great work managing your childminder registrations
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="rounded-xl border-primary/20 hover:bg-primary/5"
            onClick={() => navigate("/admin/applications")}
          >
            View All Applications
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  count?: number;
  suffix?: string;
  variant?: "default" | "warning" | "success";
  onClick: () => void;
}

const QuickActionCard = ({
  title,
  description,
  icon: Icon,
  count,
  suffix = "",
  variant = "default",
  onClick,
}: QuickActionCardProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "warning":
        return {
          bg: "bg-[hsl(var(--admin-warning-light))]",
          iconColor: "text-[hsl(var(--admin-warning))]",
          badgeBg: "bg-[hsl(var(--admin-warning))]",
        };
      case "success":
        return {
          bg: "bg-[hsl(var(--admin-success-light))]",
          iconColor: "text-[hsl(var(--admin-success))]",
          badgeBg: "bg-[hsl(var(--admin-success))]",
        };
      default:
        return {
          bg: "bg-primary/10",
          iconColor: "text-primary",
          badgeBg: "bg-primary",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <button
      onClick={onClick}
      className="group flex items-start gap-4 p-5 bg-card rounded-2xl border border-[hsl(var(--admin-border))] hover:border-[hsl(var(--admin-border-hover))] hover:shadow-apple-md transition-all duration-200 text-left w-full"
    >
      <div
        className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${styles.bg}`}
      >
        <Icon className={`w-5 h-5 ${styles.iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="font-semibold text-foreground truncate">{title}</h3>
          {count !== undefined && (
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${styles.badgeBg}`}
            >
              {count}{suffix}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-1">{description}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1 group-hover:translate-x-1 group-hover:text-primary transition-all" />
    </button>
  );
};

export default AdminDashboard;
