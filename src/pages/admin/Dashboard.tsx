import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Clock, CheckCircle, XCircle, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GlobalComplianceDashboard } from "@/components/admin/GlobalComplianceDashboard";

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
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/admin/login');
      return;
    }

    const { data: roles } = await supabase
      .from('user_roles' as any)
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roles) {
      toast({
        title: "Access Denied",
        description: "You do not have admin privileges.",
        variant: "destructive",
      });
      navigate('/admin/login');
      return;
    }

    fetchMetrics();
  };

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "Successfully logged out of admin portal.",
    });
    navigate('/admin/login');
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
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
      </main>
    </div>
  );
};

export default AdminDashboard;
