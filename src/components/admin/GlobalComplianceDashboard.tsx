import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, AlertCircle, Clock, CheckCircle, Calendar, TrendingUp } from "lucide-react";
import { ComplianceMetricsCard } from "./ComplianceMetricsCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { differenceInDays } from "date-fns";

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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadGlobalMetrics();
  }, []);

  const loadGlobalMetrics = async () => {
    try {
      // Fetch all household members across all applications
      const { data: members, error } = await supabase
        .from('household_member_dbs_tracking')
        .select('*');

      if (error) throw error;

      const today = new Date();
      
      // Calculate metrics
      const criticalCount = members?.filter(m => m.risk_level === 'critical').length || 0;
      const atRiskCount = members?.filter(m => m.compliance_status === 'at_risk').length || 0;
      const pendingCount = members?.filter(m => m.compliance_status === 'pending').length || 0;
      const compliantCount = members?.filter(m => m.compliance_status === 'compliant').length || 0;
      const overdueCount = members?.filter(m => m.compliance_status === 'overdue').length || 0;
      
      // Calculate expiring soon
      const expiringSoonCount = members?.filter(m => {
        if (!m.dbs_certificate_expiry_date) return false;
        const expiryDate = new Date(m.dbs_certificate_expiry_date);
        const daysUntilExpiry = differenceInDays(expiryDate, today);
        return daysUntilExpiry <= 90 && daysUntilExpiry > 0;
      }).length || 0;

      // Calculate approaching 16
      const turning16SoonCount = members?.filter(m => {
        if (m.member_type !== 'child') return false;
        const birthDate = new Date(m.date_of_birth);
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age >= 16) return false;
        const sixteenthBirthday = new Date(birthDate);
        sixteenthBirthday.setFullYear(birthDate.getFullYear() + 16);
        const daysUntil16 = differenceInDays(sixteenthBirthday, today);
        return daysUntil16 <= 90 && daysUntil16 >= 0;
      }).length || 0;

      // Calculate completion rate
      const adultsAndOlder = members?.filter(m => {
        if (m.member_type === 'adult' || m.member_type === 'assistant') return true;
        // Include children 16+
        const birthDate = new Date(m.date_of_birth);
        const age = today.getFullYear() - birthDate.getFullYear();
        return age >= 16;
      }) || [];

      const completed = adultsAndOlder.filter(m => 
        m.dbs_status === 'certificate_received' || m.dbs_status === 'exempt'
      ).length;
      const completionRate = adultsAndOlder.length > 0 
        ? Math.round((completed / adultsAndOlder.length) * 100) 
        : 0;

      setMetrics({
        criticalCount,
        atRiskCount,
        pendingCount,
        compliantCount,
        overdueCount,
        expiringSoonCount,
        turning16SoonCount,
        totalMembers: members?.length || 0,
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
    </div>
  );
};
