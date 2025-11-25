import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, Clock, AlertCircle, AlertTriangle, ArrowRight, Users } from "lucide-react";
import { differenceInDays } from "date-fns";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";

interface HealthMetrics {
  healthScore: number;
  valid: { count: number; percentage: number };
  expiring: { count: number; percentage: number };
  expired: { count: number; percentage: number };
  missing: { count: number; percentage: number };
  total: number;
  totalEmployees: number;
  totalMembers: number;
}

export const DBSCertificateHealthCard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<HealthMetrics>({
    healthScore: 0,
    valid: { count: 0, percentage: 0 },
    expiring: { count: 0, percentage: 0 },
    expired: { count: 0, percentage: 0 },
    missing: { count: 0, percentage: 0 },
    total: 0,
    totalEmployees: 0,
    totalMembers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificateHealth();
  }, []);

  const fetchCertificateHealth = async () => {
    try {
      const today = new Date();

      // Fetch ALL active employees
      const { data: employees } = await supabase
        .from('employees')
        .select('id, dbs_status, dbs_certificate_expiry_date, first_name, last_name')
        .eq('employment_status', 'active');

      // Fetch ALL employee household members (this is what we track for compliance)
      const { data: employeeHousehold } = await supabase
        .from('employee_household_members')
        .select('id, member_type, date_of_birth, dbs_status, dbs_certificate_expiry_date, full_name');

      // Function to check if someone needs DBS
      const needsDBS = (memberType: string, dateOfBirth: string) => {
        if (memberType === 'adult') return true;
        const age = differenceInDays(today, new Date(dateOfBirth)) / 365.25;
        return age >= 16;
      };

      // Categorize employee household members who need DBS
      let validCount = 0;
      let expiringCount = 0;
      let expiredCount = 0;
      let missingCount = 0;

      // Process employee household members only
      const householdMembersNeedingDBS = (employeeHousehold || []).filter(member => 
        needsDBS(member.member_type, member.date_of_birth)
      );

      householdMembersNeedingDBS.forEach(member => {
        if (member.dbs_status === 'received' && member.dbs_certificate_expiry_date) {
          const daysUntilExpiry = differenceInDays(new Date(member.dbs_certificate_expiry_date), today);
          if (daysUntilExpiry < 0) expiredCount++;
          else if (daysUntilExpiry <= 90) expiringCount++;
          else validCount++;
        } else {
          missingCount++;
        }
      });

      const total = householdMembersNeedingDBS.length;

      if (total === 0) {
        setMetrics({
          healthScore: 0,
          valid: { count: 0, percentage: 0 },
          expiring: { count: 0, percentage: 0 },
          expired: { count: 0, percentage: 0 },
          missing: { count: 0, percentage: 0 },
          total: 0,
          totalEmployees: employees?.length || 0,
          totalMembers: 0,
        });
        setLoading(false);
        return;
      }

      // Health score = (valid certificates / total people needing DBS) * 100
      const healthScore = Math.round((validCount / total) * 100);

      setMetrics({
        healthScore,
        valid: { 
          count: validCount, 
          percentage: Math.round((validCount / total) * 100) 
        },
        expiring: { 
          count: expiringCount, 
          percentage: Math.round((expiringCount / total) * 100) 
        },
        expired: { 
          count: expiredCount, 
          percentage: Math.round((expiredCount / total) * 100) 
        },
        missing: { 
          count: missingCount, 
          percentage: Math.round((missingCount / total) * 100) 
        },
        total,
        totalEmployees: employees?.length || 0,
        totalMembers: employeeHousehold?.length || 0,
      });
    } catch (error) {
      console.error("Error fetching certificate health:", error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = () => {
    if (metrics.healthScore >= 80) return "hsl(var(--chart-2))"; // Green
    if (metrics.healthScore >= 50) return "hsl(var(--chart-3))"; // Amber
    return "hsl(var(--chart-1))"; // Red
  };

  const chartData = [
    {
      name: 'Health',
      value: metrics.healthScore,
      fill: getHealthColor(),
    },
  ];

  if (loading) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            DBS Certificate Health
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/admin/employees')}
          >
            View All Employees
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Loading certificate data...</div>
        </CardContent>
      </Card>
    );
  }

  if (metrics.total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              DBS Certificate Health
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/admin/employees')}
            >
              View Employees
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No employees or household members tracked yet</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => navigate('/admin/employees')}
            >
              Go to Employees
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          DBS Certificate Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-[200px_1fr] gap-6 items-center">
          {/* Circular Progress */}
          <div className="flex flex-col items-center justify-center">
            <ResponsiveContainer width={180} height={180}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="70%"
                outerRadius="100%"
                barSize={20}
                data={chartData}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  background={{ fill: 'hsl(var(--muted))' }}
                  dataKey="value"
                  cornerRadius={10}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute">
              <div className="text-center">
                <div className="text-4xl font-bold" style={{ color: getHealthColor() }}>
                  {metrics.healthScore}%
                </div>
                <div className="text-sm text-muted-foreground">Health Score</div>
              </div>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="space-y-3">
            {/* Valid */}
            <button
              onClick={() => navigate('/admin/employees')}
              className="w-full bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-4 rounded-lg hover:bg-green-100 dark:hover:bg-green-950/30 transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-sm font-medium text-green-900 dark:text-green-100">Valid</div>
                    <div className="text-xs text-green-700 dark:text-green-300">Valid for 90+ days</div>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {metrics.valid.count}
                    </div>
                    <div className="text-xs text-green-700 dark:text-green-300">
                      {metrics.valid.percentage}%
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </button>

            {/* Expiring */}
            <button
              onClick={() => navigate('/admin/employees')}
              className="w-full bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-950/30 transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-amber-600" />
                  <div>
                    <div className="text-sm font-medium text-amber-900 dark:text-amber-100">Expiring Soon</div>
                    <div className="text-xs text-amber-700 dark:text-amber-300">Within 90 days</div>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                      {metrics.expiring.count}
                    </div>
                    <div className="text-xs text-amber-700 dark:text-amber-300">
                      {metrics.expiring.percentage}%
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-amber-600" />
                </div>
              </div>
            </button>

            {/* Expired */}
            <button
              onClick={() => navigate('/admin/employees')}
              className="w-full bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-4 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <div className="text-sm font-medium text-red-900 dark:text-red-100">Expired</div>
                    <div className="text-xs text-red-700 dark:text-red-300">Past expiry date</div>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <div className="text-2xl font-bold text-red-900 dark:text-red-100">
                      {metrics.expired.count}
                    </div>
                    <div className="text-xs text-red-700 dark:text-red-300">
                      {metrics.expired.percentage}%
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-red-600" />
                </div>
              </div>
            </button>

            {/* Missing/Not Requested */}
            <button
              onClick={() => navigate('/admin/employees')}
              className="w-full bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 p-4 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-950/30 transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div>
                    <div className="text-sm font-medium text-orange-900 dark:text-orange-100">Missing DBS</div>
                    <div className="text-xs text-orange-700 dark:text-orange-300">Not requested or pending</div>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                      {metrics.missing.count}
                    </div>
                    <div className="text-xs text-orange-700 dark:text-orange-300">
                      {metrics.missing.percentage}%
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-orange-600" />
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-foreground">{metrics.totalEmployees}</div>
              <div className="text-xs text-muted-foreground">Active Employees</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{metrics.totalMembers}</div>
              <div className="text-xs text-muted-foreground">Household Members</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{metrics.total}</div>
              <div className="text-xs text-muted-foreground">Requiring DBS</div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        {(metrics.expired.count > 0 || metrics.missing.count > 0) && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                    Action Required
                  </h4>
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    {metrics.expired.count > 0 && `${metrics.expired.count} expired certificate${metrics.expired.count > 1 ? 's' : ''} need renewal. `}
                    {metrics.missing.count > 0 && `${metrics.missing.count} individual${metrics.missing.count > 1 ? 's' : ''} need${metrics.missing.count === 1 ? 's' : ''} DBS checks initiated.`}
                  </p>
                  <Button
                    onClick={() => navigate('/admin/employees')}
                    variant="outline"
                    size="sm"
                    className="mt-3 border-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/40"
                  >
                    Review & Take Action
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
