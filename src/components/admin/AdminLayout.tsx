import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, FileText, Users, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { NavLink } from "@/components/NavLink";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/admin');
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
      navigate('/admin');
      return;
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "Successfully logged out of admin portal.",
    });
    navigate('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/applications", icon: FileText, label: "Applications" },
    { to: "/admin/employees", icon: Users, label: "Employees" },
    { to: "/admin/enforcement", icon: ShieldAlert, label: "Enforcement" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Floating Navbar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-card/80 backdrop-blur-xl border shadow-lg rounded-full px-2 py-2">
        <div className="flex items-center gap-1">
          <NavLink to="/admin/dashboard" className="px-4 py-2 font-bold text-sm text-logo hover:opacity-80 transition-opacity">
            ReadyKids
          </NavLink>
          <div className="w-px h-6 bg-border mx-2" />
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:bg-muted/50"
              activeClassName="bg-primary text-primary-foreground"
            >
              <item.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </NavLink>
          ))}
          <div className="w-px h-6 bg-border mx-2" />
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleLogout}
            className="gap-2 rounded-full"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </nav>

      <main className="pt-24 px-6 pb-12 max-w-7xl mx-auto animate-fade-up">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
