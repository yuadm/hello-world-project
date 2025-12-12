import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { Turning16Card } from "@/components/admin/Turning16Card";

interface DashboardMetrics {
  pendingApplications: number;
  activeEmployees: number;
  criticalAlerts: number;
  completionRate: number;
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

      const pending = (applications || []).filter((app: any) => app.status === 'pending').length;

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

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <div className="h-12 w-64 bg-muted rounded animate-shimmer" />
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card border rounded-xl p-8">
                <div className="space-y-4">
                  <div className="h-6 w-32 bg-muted rounded animate-shimmer" />
                  <div className="h-12 w-24 bg-muted rounded animate-shimmer" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Pending Applications */}
          <Card 
            className="border-0 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10 cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => navigate('/admin/applications?status=pending')}
          >
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-amber-500 rounded-xl">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                Pending Review
              </p>
              <p className="text-4xl font-bold text-amber-950 dark:text-amber-50">
                {metrics.pendingApplications}
              </p>
            </CardContent>
          </Card>

          {/* Active Employees */}
          <Card 
            className="border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => navigate('/admin/employees')}
          >
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-500 rounded-xl">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                Active Employees
              </p>
              <p className="text-4xl font-bold text-blue-950 dark:text-blue-50">
                {metrics.activeEmployees}
              </p>
            </CardContent>
          </Card>

          {/* Critical Alerts */}
          <Card 
            className="border-0 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/10 cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => navigate('/admin/employees')}
          >
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-500 rounded-xl">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                Critical Alerts
              </p>
              <p className="text-4xl font-bold text-red-950 dark:text-red-50">
                {metrics.criticalAlerts}
              </p>
            </CardContent>
          </Card>

          {/* Completion Rate */}
          <Card className="border-0 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/10">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-emerald-500 rounded-xl">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100 mb-1">
                DBS Completion
              </p>
              <p className="text-4xl font-bold text-emerald-950 dark:text-emerald-50">
                {metrics.completionRate}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Turning 16 Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Turning16Card />
          
          {/* Quick Actions */}
          <div className="space-y-4">
            <Card 
              className="border hover:border-primary cursor-pointer transition-colors group"
              onClick={() => navigate('/admin/applications')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">Review Applications</h3>
                    <p className="text-sm text-muted-foreground">
                      Process new childminder applications
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>

            <Card 
              className="border hover:border-primary cursor-pointer transition-colors group"
              onClick={() => navigate('/admin/employees')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">Manage Employees</h3>
                    <p className="text-sm text-muted-foreground">
                      View and update employee records
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
