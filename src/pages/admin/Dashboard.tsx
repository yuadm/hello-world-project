import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
      title: "Total Applications",
      value: metrics.totalApplications,
      icon: FileText,
      description: "All time applications",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Pending Review",
      value: metrics.pendingApplications,
      icon: Clock,
      description: "Awaiting review",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Approved",
      value: metrics.approvedApplications,
      icon: CheckCircle,
      description: "Approved applications",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Rejected",
      value: metrics.rejectedApplications,
      icon: XCircle,
      description: "Rejected applications",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Today's Applications",
      value: metrics.todayApplications,
      icon: Users,
      description: "Submitted today",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Welcome back, Admin</h2>
        <p className="text-muted-foreground">
          Here's an overview of childminder applications
        </p>
      </div>

      {/* Global DBS Compliance Dashboard */}
      <div className="mb-8">
        <GlobalComplianceDashboard />
      </div>

      {/* Application Statistics */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Application Statistics</h3>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {metricCards.map((metric) => (
          <Card key={metric.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${metric.bgColor}`}>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage childminder applications</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button onClick={() => navigate('/admin/applications')}>
            <FileText className="mr-2 h-4 w-4" />
            View All Applications
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/applications?status=pending')}>
            <Clock className="mr-2 h-4 w-4" />
            Review Pending
          </Button>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminDashboard;
