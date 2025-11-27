import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DBSCertificateHealthCard } from "@/components/admin/DBSCertificateHealthCard";
import { GlobalComplianceDashboard } from "@/components/admin/GlobalComplianceDashboard";
import AdminLayout from "@/components/admin/AdminLayout";

interface DashboardMetrics {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  todayApplications: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    todayApplications: 0,
  });

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const { data: applications, error } = await supabase
        .from('childminder_applications' as any)
        .select('status, created_at');

      if (error) throw error;

      const appData = (applications || []) as unknown as Array<{ status: string; created_at: string }>;
      const today = new Date().toDateString();
      const todayApps = appData.filter(
        app => new Date(app.created_at).toDateString() === today
      ).length || 0;

      const pending = appData.filter(app => app.status === 'pending').length || 0;
      const approved = appData.filter(app => app.status === 'approved').length || 0;
      const rejected = appData.filter(app => app.status === 'rejected').length || 0;

      setMetrics({
        totalApplications: appData.length || 0,
        pendingApplications: pending,
        approvedApplications: approved,
        rejectedApplications: rejected,
        todayApplications: todayApps,
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

  const metricCards = [
    {
      title: "Pending",
      value: metrics.pendingApplications,
      icon: Clock,
      trend: "+12%",
    },
    {
      title: "Approved",
      value: metrics.approvedApplications,
      icon: CheckCircle,
      trend: "+8%",
    },
    {
      title: "Today",
      value: metrics.todayApplications,
      icon: Users,
      trend: "0%",
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <div className="space-y-2">
            <div className="h-9 w-48 bg-muted rounded animate-shimmer" />
            <div className="h-5 w-72 bg-muted rounded animate-shimmer" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card border rounded-lg p-6">
                <div className="space-y-3">
                  <div className="h-4 w-24 bg-muted rounded animate-shimmer" />
                  <div className="h-8 w-16 bg-muted rounded animate-shimmer" />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="h-72 bg-muted rounded animate-shimmer" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor applications and compliance
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {metricCards.map((metric) => (
            <Card key={metric.title} className="border">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {metric.title}
                    </p>
                    <p className="text-3xl font-bold tracking-tight">
                      {metric.value}
                    </p>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <metric.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <DBSCertificateHealthCard />
          <GlobalComplianceDashboard />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
