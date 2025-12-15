import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  AlertOctagon, 
  FileText, 
  User, 
  Search, 
  AlertTriangle,
  ShieldAlert,
  Clock,
  FileCheck,
  Scale
} from "lucide-react";
import { StatsCard } from "@/components/admin/enforcement/StatsCard";
import { EnforcementCard } from "@/components/admin/enforcement/EnforcementCard";
import { EnforcementBadge } from "@/components/admin/enforcement/EnforcementBadge";
import { EnforcementTimeline } from "@/components/admin/enforcement/EnforcementTimeline";
import { SuspensionWorkflow } from "@/components/admin/enforcement/SuspensionWorkflow";
import { CancellationWorkflow } from "@/components/admin/enforcement/CancellationWorkflow";
import { SuspensionReviewWorkflow } from "@/components/admin/enforcement/SuspensionReviewWorkflow";
import { DecisionWorkflow } from "@/components/admin/enforcement/DecisionWorkflow";
import { NotificationWorkflow } from "@/components/admin/enforcement/NotificationWorkflow";
import { EnforcementProvider, EnforcementCase, EnforcementTimeline as TimelineType } from "@/types/enforcement";
import { formatDate } from "@/lib/enforcementUtils";
import { useToast } from "@/hooks/use-toast";

// Mock data for cases (will be replaced with real data later)
const MOCK_CASES: EnforcementCase[] = [
  {
    id: 'CASE-001',
    employee_id: 'emp-1',
    type: 'suspension',
    status: 'in_effect',
    risk_level: 'critical',
    concern: 'Safeguarding concern identified during inspection',
    risk_detail: 'Inadequate supervision of children under 2',
    risk_categories: ['Safeguarding concern', 'Supervision inadequacy'],
    deadline: '2025-01-21',
    date_created: '2024-12-10',
    date_closed: null,
    supervisor_id: 'sup1',
    supervisor_name: 'Jane Director',
    form_data: null,
    created_at: '2024-12-10',
    updated_at: '2024-12-10',
    employee_name: 'Michael Ross',
    employee_local_authority: 'South Gloucestershire'
  },
  {
    id: 'CASE-002',
    employee_id: 'emp-2',
    type: 'cancellation',
    status: 'representations_received',
    risk_level: 'medium',
    concern: 'Failure to meet prescribed requirements',
    risk_detail: 'Ongoing compliance failures',
    risk_categories: ['Compliance / EYFS Failure'],
    deadline: '2025-01-03',
    date_created: '2024-12-20',
    date_closed: null,
    supervisor_id: 'sup2',
    supervisor_name: 'Robert Chief',
    form_data: null,
    created_at: '2024-12-20',
    updated_at: '2024-12-20',
    employee_name: 'Emma Thompson',
    employee_local_authority: 'Bath & NE Somerset'
  }
];

const MOCK_TIMELINES: Record<string, TimelineType[]> = {
  'CASE-001': [
    { id: '1', case_id: 'CASE-001', event: 'Risk Assessment Completed', date: '2024-12-10', type: 'completed', created_by: null, created_at: '' },
    { id: '2', case_id: 'CASE-001', event: 'Suspension Notice Issued', date: '2024-12-10', type: 'completed', created_by: null, created_at: '' },
    { id: '3', case_id: 'CASE-001', event: 'Notifications Sent (Ofsted/LA)', date: '2024-12-11', type: 'completed', created_by: null, created_at: '' },
    { id: '4', case_id: 'CASE-001', event: '6-Week Review Deadline', date: '2025-01-21', type: 'pending', created_by: null, created_at: '' },
  ],
  'CASE-002': [
    { id: '5', case_id: 'CASE-002', event: 'Notice of Intention Issued', date: '2024-12-20', type: 'completed', created_by: null, created_at: '' },
    { id: '6', case_id: 'CASE-002', event: 'Representations Received', date: '2025-01-03', type: 'urgent', created_by: null, created_at: '' },
    { id: '7', case_id: 'CASE-002', event: 'Decision Notice Due', date: '2025-01-17', type: 'pending', created_by: null, created_at: '' },
  ]
};

const Enforcement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<EnforcementProvider | null>(null);
  const [selectedCase, setSelectedCase] = useState<EnforcementCase | null>(null);
  const [workflowAction, setWorkflowAction] = useState<'review' | 'lift'>('review');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationContext, setNotificationContext] = useState<{ provider: any; action: string; caseId: string } | null>(null);

  // Fetch employees as providers
  const { data: employees = [] } = useQuery({
    queryKey: ['employees-enforcement'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('last_name');
      if (error) throw error;
      return data;
    }
  });

  // Transform employees to providers
  const providers: EnforcementProvider[] = employees.map(emp => ({
    id: emp.id,
    name: `${emp.first_name} ${emp.last_name}`,
    type: emp.service_type || 'Early Years',
    status: emp.employment_status === 'active' ? 'active' : 'terminated',
    agencyId: 'CMA-01',
    la: emp.local_authority || 'Unknown',
    email: emp.email
  }));

  const cases = MOCK_CASES;

  const handleStartWorkflow = (type: 'suspension' | 'warning' | 'cancellation', provider: EnforcementProvider) => {
    setSelectedProvider(provider);
    setActiveWorkflow(type);
  };

  const handleCaseAction = (action: string, caseData: EnforcementCase, subAction?: 'review' | 'lift') => {
    setSelectedCase(caseData);
    if (subAction) setWorkflowAction(subAction);
    setActiveWorkflow(action);
  };

  const handleWorkflowComplete = (formData: any, isWarning?: boolean) => {
    setActiveWorkflow(null);
    
    // Show notification workflow
    if (selectedProvider) {
      setNotificationContext({
        provider: selectedProvider,
        action: isWarning ? 'Warning Notice' : 'Suspension',
        caseId: 'new-case'
      });
      setShowNotifications(true);
    }
    
    toast({
      title: "Notice Issued",
      description: "The enforcement notice has been generated successfully.",
    });
  };

  const handleNotificationComplete = (allSent: boolean) => {
    setShowNotifications(false);
    setNotificationContext(null);
    setSelectedProvider(null);
    
    if (allSent) {
      toast({
        title: "Enforcement Action Complete",
        description: "All required agencies have been notified.",
      });
    }
  };

  const filteredProviders = providers.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.la.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Enforcement & Compliance</h1>
            <p className="text-slate-500 mt-1">Manage suspensions, warnings, and cancellations</p>
          </div>
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <Input
              placeholder="Search providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard" className="gap-2">
              <AlertOctagon className="w-4 h-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="cases" className="gap-2">
              <FileText className="w-4 h-4" /> Active Cases
            </TabsTrigger>
            <TabsTrigger value="providers" className="gap-2">
              <User className="w-4 h-4" /> Provider Registry
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Urgent Actions */}
            {cases.some(c => c.status === 'in_effect') && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
                <div className="flex items-center gap-2 text-rose-700 font-bold mb-3">
                  <AlertTriangle className="w-6 h-6" />
                  Urgent Actions Required
                </div>
                {cases.filter(c => c.status === 'in_effect').map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div>
                      <p className="font-bold text-slate-900">{c.employee_name}</p>
                      <p className="text-sm text-slate-500">Suspension Review Due</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleCaseAction('suspension-review', c, 'review')}
                    >
                      Review Now
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <StatsCard 
                title="Active Suspensions" 
                value={cases.filter(c => c.type === 'suspension' && c.status === 'in_effect').length}
                variant="critical"
                icon={ShieldAlert}
              />
              <StatsCard 
                title="Pending Decisions" 
                value={cases.filter(c => c.status === 'representations_received').length}
                subtitle="1 due this week"
                icon={Clock}
              />
              <StatsCard 
                title="Representations" 
                value={2}
                subtitle="Under review"
                icon={FileCheck}
              />
              <StatsCard 
                title="Appeals" 
                value={1}
                subtitle="Hearing scheduled"
                icon={Scale}
              />
              <StatsCard 
                title="Total Providers" 
                value={providers.length}
                variant="success"
                icon={User}
              />
            </div>

            {/* Active Cases Overview */}
            <EnforcementCard title="Active Cases" icon={FileText}>
              <div className="space-y-4">
                {cases.map(c => (
                  <div key={c.id} className="p-4 border rounded-xl hover:bg-slate-50 transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-900">{c.employee_name}</span>
                          <EnforcementBadge variant="type" value={c.type} />
                          <EnforcementBadge variant="status" value={c.status} />
                        </div>
                        <p className="text-sm text-slate-500">{c.employee_local_authority}</p>
                        <p className="text-xs text-slate-400 mt-1">Deadline: {formatDate(c.deadline || '')}</p>
                      </div>
                      <div className="flex gap-2">
                        {c.type === 'suspension' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleCaseAction('suspension-review', c, 'review')}>
                              Review
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleCaseAction('suspension-review', c, 'lift')}>
                              Lift
                            </Button>
                          </>
                        )}
                        {c.type === 'cancellation' && (
                          <Button size="sm" variant="outline" onClick={() => handleCaseAction('decision', c)}>
                            Decision Notice
                          </Button>
                        )}
                      </div>
                    </div>
                    {MOCK_TIMELINES[c.id] && (
                      <div className="mt-4 pt-4 border-t">
                        <EnforcementTimeline events={MOCK_TIMELINES[c.id]} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </EnforcementCard>
          </TabsContent>

          {/* Active Cases Tab */}
          <TabsContent value="cases" className="space-y-4">
            {cases.map(c => (
              <div key={c.id} className="p-6 bg-white border rounded-xl shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{c.employee_name}</h3>
                    <p className="text-sm text-slate-500">{c.id} • {c.employee_local_authority}</p>
                  </div>
                  <div className="flex gap-2">
                    <EnforcementBadge variant="type" value={c.type} />
                    <EnforcementBadge variant="risk" value={c.risk_level} />
                  </div>
                </div>
                <EnforcementTimeline events={MOCK_TIMELINES[c.id] || []} />
              </div>
            ))}
          </TabsContent>

          {/* Provider Registry Tab */}
          <TabsContent value="providers">
            <div className="bg-white border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">ID</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Name</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Local Authority</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Status</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredProviders.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-4 text-sm font-mono text-slate-500">{p.id.slice(0, 8)}</td>
                      <td className="p-4 font-medium text-slate-900">{p.name}</td>
                      <td className="p-4 text-sm text-slate-600">{p.la}</td>
                      <td className="p-4"><EnforcementBadge variant="status" value={p.status} /></td>
                      <td className="p-4">
                        {p.status === 'active' && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="text-amber-700 border-amber-200 hover:bg-amber-50" onClick={() => handleStartWorkflow('warning', p)}>
                              Warning
                            </Button>
                            <Button size="sm" variant="outline" className="text-rose-700 border-rose-200 hover:bg-rose-50" onClick={() => handleStartWorkflow('suspension', p)}>
                              Suspend
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleStartWorkflow('cancellation', p)}>
                              Cancel Reg
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Workflow Modals */}
      {(activeWorkflow === 'suspension' || activeWorkflow === 'warning') && selectedProvider && (
        <SuspensionWorkflow
          provider={selectedProvider}
          initialMode={activeWorkflow}
          onClose={() => setActiveWorkflow(null)}
          onComplete={handleWorkflowComplete}
        />
      )}

      {activeWorkflow === 'cancellation' && selectedProvider && (
        <CancellationWorkflow
          provider={selectedProvider}
          onClose={() => setActiveWorkflow(null)}
          onComplete={(formData) => {
            setActiveWorkflow(null);
            toast({ title: "Notice of Intention Issued", description: "The cancellation process has been initiated." });
          }}
        />
      )}

      {activeWorkflow === 'suspension-review' && selectedCase && (
        <SuspensionReviewWorkflow
          caseDetails={selectedCase}
          initialAction={workflowAction}
          onClose={() => setActiveWorkflow(null)}
          onComplete={(formData) => {
            setActiveWorkflow(null);
            toast({ title: formData.reviewOutcome === 'lift' ? "Suspension Lifted" : "Suspension Extended" });
          }}
        />
      )}

      {activeWorkflow === 'decision' && selectedCase && (
        <DecisionWorkflow
          caseDetails={selectedCase}
          onClose={() => setActiveWorkflow(null)}
          onComplete={(formData) => {
            setActiveWorkflow(null);
            toast({ title: "Decision Notice Issued" });
          }}
        />
      )}

      {showNotifications && notificationContext && (
        <NotificationWorkflow
          provider={notificationContext.provider}
          actionType={notificationContext.action}
          caseId={notificationContext.caseId}
          onClose={handleNotificationComplete}
        />
      )}
    </AdminLayout>
  );
};

export default Enforcement;