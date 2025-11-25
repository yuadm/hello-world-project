import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, AlertCircle, Clock, CheckCircle, Calendar, TrendingUp, Mail } from "lucide-react";
import { ComplianceMetricsCard } from "./ComplianceMetricsCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { differenceInDays, format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface OverdueMember {
  member_id: string;
  member_name: string;
  member_type: string;
  days_overdue: number;
  reminder_count: number;
  last_reminder_date: string | null;
  email: string | null;
  source_table: string;
}

export const GlobalComplianceDashboard = () => {
  const [metrics, setMetrics] = useState({
    criticalCount: 0,
    atRiskCount: 0,
    pendingCount: 0,
    compliantCount: 0,
    overdueCount: 0,
    expiringSoonCount: 0,
    turning16SoonCount: 0,
    totalMembers: 0,
    completionRate: 0,
  });
  const [overdueMembers, setOverdueMembers] = useState<OverdueMember[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadGlobalMetrics();
    loadOverdueMembers();
  }, []);

  const loadOverdueMembers = async () => {
    try {
      const { data, error } = await supabase.rpc('get_overdue_dbs_requests');
      
      if (error) throw error;
      
      setOverdueMembers(data || []);
    } catch (error) {
      console.error("Error loading overdue members:", error);
    }
  };

  const loadGlobalMetrics = async () => {
    try {
      // Fetch from all three tables for complete compliance picture
      const [
        { data: householdMembers, error: hmError },
        { data: employeeHouseholdMembers, error: ehmError },
        { data: employees, error: empError }
      ] = await Promise.all([
        supabase.from('household_member_dbs_tracking').select('*'),
        supabase.from('employee_household_members').select('*'),
        supabase.from('employees').select('*').eq('employment_status', 'active')
      ]);

      if (hmError || ehmError || empError) {
        throw hmError || ehmError || empError;
      }

      // Combine all members who need DBS tracking
      const allMembers: any[] = [];
      
      // Add household members from applicants
      (householdMembers || []).forEach(m => {
        const age = today.getFullYear() - new Date(m.date_of_birth).getFullYear();
        if (m.member_type === 'adult' || age >= 16) {
          allMembers.push(m);
        }
      });
      
      // Add employee household members
      (employeeHouseholdMembers || []).forEach(m => {
        const age = today.getFullYear() - new Date(m.date_of_birth).getFullYear();
        if (m.member_type === 'adult' || age >= 16) {
          allMembers.push(m);
        }
      });
      
      // Add all active employees
      (employees || []).forEach(emp => {
        allMembers.push(emp);
      });

      const today = new Date();
      
      // Calculate metrics
      const criticalCount = allMembers.filter(m => m.risk_level === 'critical').length;
      const atRiskCount = allMembers.filter(m => m.compliance_status === 'at_risk').length;
      const pendingCount = allMembers.filter(m => m.compliance_status === 'pending').length;
      const compliantCount = allMembers.filter(m => m.compliance_status === 'compliant').length;
      const overdueCount = allMembers.filter(m => m.compliance_status === 'overdue').length;
      
      // Calculate expiring soon
      const expiringSoonCount = allMembers.filter(m => {
        if (!m.dbs_certificate_expiry_date) return false;
        const expiryDate = new Date(m.dbs_certificate_expiry_date);
        const daysUntilExpiry = differenceInDays(expiryDate, today);
        return daysUntilExpiry <= 90 && daysUntilExpiry > 0;
      }).length;

      // Calculate approaching 16 (only relevant for household members, not employees)
      const turning16SoonCount = [...(householdMembers || []), ...(employeeHouseholdMembers || [])].filter(m => {
        if (m.member_type !== 'child') return false;
        const birthDate = new Date(m.date_of_birth);
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age >= 16) return false;
        const sixteenthBirthday = new Date(birthDate);
        sixteenthBirthday.setFullYear(birthDate.getFullYear() + 16);
        const daysUntil16 = differenceInDays(sixteenthBirthday, today);
        return daysUntil16 <= 90 && daysUntil16 >= 0;
      }).length;

      // Calculate completion rate
      const completed = allMembers.filter(m => 
        m.dbs_status === 'received'
      ).length;
      const completionRate = allMembers.length > 0 
        ? Math.round((completed / allMembers.length) * 100) 
        : 0;

      setMetrics({
        criticalCount,
        atRiskCount,
        pendingCount,
        compliantCount,
        overdueCount,
        expiringSoonCount,
        turning16SoonCount,
        totalMembers: allMembers.length,
        completionRate,
      });
    } catch (error) {
      console.error("Error loading global compliance metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">DBS Compliance Overview</h2>
        <div className="text-center py-8 text-muted-foreground">Loading compliance data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">DBS Compliance Overview</h2>
          <p className="text-muted-foreground">Monitoring {metrics.totalMembers} household members across all applications</p>
        </div>
        <Button onClick={() => navigate('/admin/applications')} variant="outline">
          View All Applications
        </Button>
      </div>

      {/* Primary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ComplianceMetricsCard
          title="Critical Alerts"
          value={metrics.criticalCount}
          icon={AlertTriangle}
          description="Overdue 30+ days or expired"
          variant="critical"
        />
        <ComplianceMetricsCard
          title="At Risk"
          value={metrics.atRiskCount}
          icon={AlertCircle}
          description="Needs attention soon"
          variant="high"
        />
        <ComplianceMetricsCard
          title="Pending"
          value={metrics.pendingCount}
          icon={Clock}
          description="Awaiting response"
          variant="medium"
        />
        <ComplianceMetricsCard
          title="Compliant"
          value={metrics.compliantCount}
          icon={CheckCircle}
          description="All up to date"
          variant="success"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-900 dark:text-orange-100">Expiring Soon</span>
          </div>
          <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{metrics.expiringSoonCount}</div>
          <p className="text-xs text-orange-700 dark:text-orange-300">Certificates expiring in 90 days</p>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Turning 16 Soon</span>
          </div>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{metrics.turning16SoonCount}</div>
          <p className="text-xs text-purple-700 dark:text-purple-300">Children approaching 16 in 90 days</p>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Completion Rate</span>
          </div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{metrics.completionRate}%</div>
          <p className="text-xs text-blue-700 dark:text-blue-300">Overall DBS completion rate</p>
        </div>
      </div>

      {/* Action Items */}
      {(metrics.criticalCount > 0 || metrics.atRiskCount > 0) && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 p-4 rounded">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900 dark:text-amber-100">
                Action Required
              </h4>
              <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                {metrics.criticalCount > 0 && `${metrics.criticalCount} critical alert${metrics.criticalCount > 1 ? 's' : ''} require immediate attention. `}
                {metrics.atRiskCount > 0 && `${metrics.atRiskCount} member${metrics.atRiskCount > 1 ? 's are' : ' is'} at risk. `}
                Review individual applications for details.
              </p>
              <Button 
                onClick={() => navigate('/admin/applications')} 
                variant="outline" 
                size="sm"
                className="mt-3"
              >
                Review Applications
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Overdue DBS Requests */}
      {overdueMembers.length > 0 && (
        <div className="border rounded-lg">
          <div className="bg-muted p-4 border-b">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-destructive" />
              Overdue DBS Requests ({overdueMembers.length})
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Members with DBS requests overdue by 28+ days
            </p>
          </div>
          <div className="divide-y">
            {overdueMembers.slice(0, 10).map((member) => (
              <div key={member.member_id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{member.member_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {member.member_type}
                      </Badge>
                      <Badge variant="destructive" className="text-xs">
                        {member.days_overdue} days overdue
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      {member.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {member.email}
                        </span>
                      )}
                      <span>Reminders: {member.reminder_count}</span>
                      {member.last_reminder_date && (
                        <span>Last: {format(new Date(member.last_reminder_date), 'dd/MM/yyyy')}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {overdueMembers.length > 10 && (
            <div className="p-4 bg-muted/30 text-center text-sm text-muted-foreground">
              Showing 10 of {overdueMembers.length} overdue requests
            </div>
          )}
        </div>
      )}
    </div>
  );
};
