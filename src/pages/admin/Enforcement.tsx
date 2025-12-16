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
import { RecentActivity } from "@/components/admin/enforcement/RecentActivity";
import { RecordRepresentationsModal } from "@/components/admin/enforcement/RecordRepresentationsModal";
import { EnforcementProvider, EnforcementCase, EnforcementTimeline as TimelineType } from "@/types/enforcement";
import { formatDate, getSupervisorName } from "@/lib/enforcementUtils";
import { useToast } from "@/hooks/use-toast";
import { 
  useEnforcementCases, 
  useAllTimelines,
  useCreateEnforcementCase 
} from "@/hooks/useEnforcementData";

const Enforcement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<EnforcementProvider | null>(null);
  const [selectedCase, setSelectedCase] = useState<EnforcementCase | null>(null);
  const [workflowAction, setWorkflowAction] = useState<'review' | 'lift'>('review');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationContext, setNotificationContext] = useState<{ provider: any; action: string; caseId: string } | null>(null);
  const [showRecordReps, setShowRecordReps] = useState(false);

  // Fetch enforcement cases from database
  const { data: cases = [], isLoading: casesLoading } = useEnforcementCases();
  
  // Fetch timelines for all cases
  const caseIds = cases.map(c => c.id);
  const { data: timelines = {} } = useAllTimelines(caseIds);

  // Create case mutation
  const createCase = useCreateEnforcementCase();

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
    email: emp.email,
    address: {
      addressLine1: emp.address_line_1,
      addressLine2: emp.address_line_2,
      townCity: emp.town_city,
      county: emp.county,
      postcode: emp.postcode
    }
  }));

  const handleStartWorkflow = (type: 'suspension' | 'warning' | 'cancellation', provider: EnforcementProvider) => {
    setSelectedProvider(provider);
    setActiveWorkflow(type);
  };

  const handleCaseAction = (action: string, caseData: EnforcementCase, subAction?: 'review' | 'lift') => {
    setSelectedCase(caseData);
    if (subAction) setWorkflowAction(subAction);
    setActiveWorkflow(action);
  };

  const handleRecordRepresentations = (caseData: EnforcementCase) => {
    setSelectedCase(caseData);
    setShowRecordReps(true);
  };

  const handleWorkflowComplete = async (formData: any, isWarning?: boolean) => {
    if (selectedProvider) {
      try {
        const result = await createCase.mutateAsync({
          employeeId: selectedProvider.id,
          type: isWarning ? 'warning' : 'suspension',
          formData,
          supervisorId: formData.supervisor,
          supervisorName: getSupervisorName(formData.supervisor)
        });

        setActiveWorkflow(null);
        
        // Show notification workflow
        setNotificationContext({
          provider: selectedProvider,
          action: isWarning ? 'Warning Notice' : 'Suspension',
          caseId: result.id
        });
        setShowNotifications(true);
        
        toast({
          title: "Notice Issued",
          description: "The enforcement notice has been generated successfully.",
        });
      } catch (error) {
        console.error('Failed to create case:', error);
      }
    }
  };

  const handleCancellationComplete = async (formData: any) => {
    if (selectedProvider) {
      try {
        const result = await createCase.mutateAsync({
          employeeId: selectedProvider.id,
          type: 'cancellation',
          formData,
          supervisorId: formData.supervisor,
          supervisorName: getSupervisorName(formData.supervisor)
        });

        setActiveWorkflow(null);
        toast({ 
          title: "Notice of Intention Issued", 
          description: "The cancellation process has been initiated." 
        });
      } catch (error) {
        console.error('Failed to create cancellation case:', error);
      }
    }
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

  // Calculate stats
  const activeSuspensions = cases.filter(c => c.type === 'suspension' && c.status === 'in_effect').length;
  const pendingDecisions = cases.filter(c => c.status === 'representations_received' || c.status === 'decision_pending').length;
  const representationsReceived = cases.filter(c => c.status === 'representations_received').length;

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
            {cases.some(c => c.status === 'in_effect' && c.type === 'suspension') && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
                <div className="flex items-center gap-2 text-rose-700 font-bold mb-3">
                  <AlertTriangle className="w-6 h-6" />
                  Urgent Actions Required
                </div>
                {cases.filter(c => c.status === 'in_effect' && c.type === 'suspension').map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div>
                      <p className="font-bold text-slate-900">{c.employee_name}</p>
                      <p className="text-sm text-slate-500">Suspension Review Due: {c.deadline ? formatDate(c.deadline) : 'N/A'}</p>
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
                value={activeSuspensions}
                variant="critical"
                icon={ShieldAlert}
              />
              <StatsCard 
                title="Pending Decisions" 
                value={pendingDecisions}
                subtitle={pendingDecisions > 0 ? "Review required" : undefined}
                icon={Clock}
              />
              <StatsCard 
                title="Representations" 
                value={representationsReceived}
                subtitle="Under review"
                icon={FileCheck}
              />
              <StatsCard 
                title="Total Cases" 
                value={cases.length}
                icon={Scale}
              />
              <StatsCard 
                title="Total Providers" 
                value={providers.length}
                variant="success"
                icon={User}
              />
            </div>

            {/* Two column layout for Active Cases and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Active Cases Overview */}
              <div className="lg:col-span-2">
                <EnforcementCard title="Active Cases" icon={FileText}>
                  {casesLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-xl" />
                      ))}
                    </div>
                  ) : cases.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No active enforcement cases</p>
                      <p className="text-sm mt-1">Use the Provider Registry to initiate actions</p>
                    </div>
                  ) : (
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
                              <p className="text-xs text-slate-400 mt-1">Deadline: {c.deadline ? formatDate(c.deadline) : 'N/A'}</p>
                            </div>
                            <div className="flex gap-2">
                              {c.type === 'suspension' && c.status === 'in_effect' && (
                                <>
                                  <Button size="sm" variant="outline" onClick={() => handleCaseAction('suspension-review', c, 'review')}>
                                    Review
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => handleCaseAction('suspension-review', c, 'lift')}>
                                    Lift
                                  </Button>
                                </>
                              )}
                              {c.type === 'cancellation' && c.status === 'pending' && (
                                <Button size="sm" variant="outline" onClick={() => handleRecordRepresentations(c)}>
                                  Record Reps
                                </Button>
                              )}
                              {c.type === 'cancellation' && (c.status === 'representations_received' || c.status === 'decision_pending') && (
                                <Button size="sm" variant="outline" onClick={() => handleCaseAction('decision', c)}>
                                  Decision Notice
                                </Button>
                              )}
                            </div>
                          </div>
                          {timelines[c.id] && timelines[c.id].length > 0 && (
                            <div className="mt-4 pt-4 border-t">
                              <EnforcementTimeline events={timelines[c.id].map(t => ({
                                ...t,
                                created_at: t.created_at
                              }))} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </EnforcementCard>
              </div>

              {/* Recent Activity */}
              <div className="lg:col-span-1">
                <RecentActivity />
              </div>
            </div>
          </TabsContent>

          {/* Active Cases Tab */}
          <TabsContent value="cases" className="space-y-4">
            {casesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : cases.length === 0 ? (
              <div className="text-center py-12 bg-white border rounded-xl">
                <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-lg font-medium text-slate-700">No Active Cases</p>
                <p className="text-sm text-slate-500 mt-1">Go to Provider Registry to initiate enforcement actions</p>
              </div>
            ) : (
              cases.map(c => (
                <div key={c.id} className="p-6 bg-white border rounded-xl shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{c.employee_name}</h3>
                      <p className="text-sm text-slate-500">{c.id.slice(0, 8)} • {c.employee_local_authority}</p>
                    </div>
                    <div className="flex gap-2">
                      <EnforcementBadge variant="type" value={c.type} />
                      <EnforcementBadge variant="risk" value={c.risk_level} />
                    </div>
                  </div>
                  {c.concern && (
                    <p className="text-sm text-slate-600 mb-4 p-3 bg-slate-50 rounded-lg">{c.concern}</p>
                  )}
                  <EnforcementTimeline events={(timelines[c.id] || []).map(t => ({
                    ...t,
                    created_at: t.created_at
                  }))} />
                </div>
              ))
            )}
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
                  {filteredProviders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        No providers found
                      </td>
                    </tr>
                  ) : (
                    filteredProviders.map(p => (
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
                    ))
                  )}
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
          onComplete={handleCancellationComplete}
        />
      )}

      {activeWorkflow === 'suspension-review' && selectedCase && (
        <SuspensionReviewWorkflow
          caseDetails={selectedCase}
          initialAction={workflowAction}
          onClose={() => {
            setActiveWorkflow(null);
            setSelectedCase(null);
          }}
          onComplete={(formData) => {
            setActiveWorkflow(null);
            setSelectedCase(null);
            toast({ title: formData.reviewOutcome === 'lift' ? "Suspension Lifted" : "Suspension Extended" });
          }}
        />
      )}

      {activeWorkflow === 'decision' && selectedCase && (
        <DecisionWorkflow
          caseDetails={selectedCase}
          onClose={() => {
            setActiveWorkflow(null);
            setSelectedCase(null);
          }}
          onComplete={(formData) => {
            setActiveWorkflow(null);
            setSelectedCase(null);
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

      {showRecordReps && selectedCase && (
        <RecordRepresentationsModal
          caseDetails={selectedCase}
          onClose={() => {
            setShowRecordReps(false);
            setSelectedCase(null);
          }}
        />
      )}
    </AdminLayout>
  );
};

export default Enforcement;
