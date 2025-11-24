import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, AlertCircle, CheckCircle, Clock, FileText, Send, AlertTriangle, Calendar, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RecordCertificateModal } from "./RecordCertificateModal";
import { RequestDBSModal } from "./RequestDBSModal";
import { BatchDBSRequestModal } from "./BatchDBSRequestModal";
import { ComplianceMetricsCard } from "./ComplianceMetricsCard";
import { ComplianceFilters } from "./ComplianceFilters";
import { format, differenceInYears, addYears, differenceInDays } from "date-fns";

interface DBSMember {
  id: string;
  application_id: string;
  member_type: string;
  full_name: string;
  date_of_birth: string;
  relationship: string | null;
  email: string | null;
  dbs_status: string;
  dbs_request_date: string | null;
  dbs_certificate_number: string | null;
  dbs_certificate_date: string | null;
  dbs_certificate_expiry_date: string | null;
  turning_16_notification_sent: boolean;
  notes: string | null;
  reminder_count: number;
  last_reminder_date: string | null;
  compliance_status: string;
  risk_level: string;
  last_contact_date: string | null;
}

interface DBSComplianceSectionProps {
  applicationId: string;
  applicantEmail: string;
  applicantName: string;
}

export const DBSComplianceSection = ({ applicationId, applicantEmail, applicantName }: DBSComplianceSectionProps) => {
  const [members, setMembers] = useState<DBSMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedMember, setSelectedMember] = useState<DBSMember | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showBatchRequestModal, setShowBatchRequestModal] = useState(false);
  const [requestMember, setRequestMember] = useState<DBSMember | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadMembers();
  }, [applicationId]);

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('household_member_dbs_tracking')
        .select('*')
        .eq('application_id', applicationId)
        .order('member_type')
        .order('full_name');

      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load DBS tracking data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const syncMembers = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-household-members', {
        body: { applicationId },
      });

      if (error) throw error;

      toast({
        title: "Sync Complete",
        description: `Synced ${data.total} household members`,
      });

      loadMembers();
    } catch (error: any) {
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleRequestDBS = (member: DBSMember) => {
    setRequestMember(member);
    setShowRequestModal(true);
  };

  const handleToggleMemberSelection = (memberId: string) => {
    const newSelection = new Set(selectedMemberIds);
    if (newSelection.has(memberId)) {
      newSelection.delete(memberId);
    } else {
      newSelection.add(memberId);
    }
    setSelectedMemberIds(newSelection);
  };

  const handleSendBatchRequests = () => {
    setShowBatchRequestModal(true);
  };

  const handleBatchRequestSuccess = () => {
    setSelectedMemberIds(new Set());
    loadMembers();
  };

  const sendBirthdayAlert = async (member: DBSMember) => {
    const daysUntil16 = differenceInDays(addYears(new Date(member.date_of_birth), 16), new Date());

    try {
      const { error } = await supabase.functions.invoke('send-16th-birthday-alert', {
        body: {
          memberId: member.id,
          childName: member.full_name,
          dateOfBirth: member.date_of_birth,
          daysUntil16,
          applicantEmail,
          applicantName,
          applicationId,
        },
      });

      if (error) throw error;

      toast({
        title: "Alert Sent",
        description: `Birthday alert sent to ${applicantName}`,
      });

      loadMembers();
    } catch (error: any) {
      toast({
        title: "Failed to Send Alert",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRecordCertificate = (member: DBSMember) => {
    setSelectedMember(member);
    setShowCertificateModal(true);
  };

  const handleCertificateSaved = () => {
    setShowCertificateModal(false);
    setSelectedMember(null);
    loadMembers();
  };

  const getSelectedMembers = () => {
    return members.filter(m => selectedMemberIds.has(m.id));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      not_requested: { label: "Not Requested", variant: "destructive" as const, icon: AlertCircle },
      requested: { label: "Requested", variant: "secondary" as const, icon: Mail },
      applied: { label: "Applied", variant: "secondary" as const, icon: Clock },
      certificate_received: { label: "Received", variant: "default" as const, icon: CheckCircle },
      exempt: { label: "Exempt", variant: "outline" as const, icon: FileText },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.not_requested;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const calculateAge = (dob: string) => {
    return differenceInYears(new Date(), new Date(dob));
  };

  const getApproaching16 = () => {
    return members.filter(m => {
      if (m.member_type !== 'child') return false;
      const age = calculateAge(m.date_of_birth);
      if (age >= 16) return false;
      const daysUntil16 = differenceInDays(addYears(new Date(m.date_of_birth), 16), new Date());
      return daysUntil16 <= 90;
    });
  };

  const getComplianceStats = () => {
    const adults = members.filter(m => {
      if (m.member_type === 'child') {
        return calculateAge(m.date_of_birth) >= 16;
      }
      return m.member_type === 'adult' || m.member_type === 'assistant';
    });

    const completed = adults.filter(m => m.dbs_status === 'certificate_received' || m.dbs_status === 'exempt').length;
    const total = adults.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Calculate compliance metrics
    const criticalCount = members.filter(m => m.risk_level === 'critical').length;
    const highCount = members.filter(m => m.risk_level === 'high').length;
    const mediumCount = members.filter(m => m.risk_level === 'medium').length;
    const compliantCount = members.filter(m => m.compliance_status === 'compliant').length;
    const pendingCount = members.filter(m => m.compliance_status === 'pending').length;
    const overdueCount = members.filter(m => m.compliance_status === 'overdue').length;
    const atRiskCount = members.filter(m => m.compliance_status === 'at_risk').length;
    
    // Calculate expiring soon count
    const today = new Date();
    const expiringSoonCount = members.filter(m => {
      if (!m.dbs_certificate_expiry_date) return false;
      const expiryDate = new Date(m.dbs_certificate_expiry_date);
      const daysUntilExpiry = differenceInDays(expiryDate, today);
      return daysUntilExpiry <= 90 && daysUntilExpiry > 0;
    }).length;

    return { 
      completed, 
      total, 
      percentage,
      criticalCount,
      highCount,
      mediumCount,
      compliantCount,
      pendingCount,
      overdueCount,
      atRiskCount,
      expiringSoonCount,
    };
  };

  const filterMembers = (membersList: DBSMember[]) => {
    return membersList.filter(member => {
      // Search filter
      if (searchQuery && !member.full_name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Status filter
      if (statusFilter !== "all" && member.compliance_status !== statusFilter) {
        return false;
      }
      
      // Risk filter
      if (riskFilter !== "all" && member.risk_level !== riskFilter) {
        return false;
      }
      
      return true;
    });
  };

  const getRiskBadge = (riskLevel: string) => {
    const riskConfig = {
      critical: { label: "Critical", variant: "destructive" as const, icon: AlertTriangle },
      high: { label: "High", variant: "destructive" as const, icon: AlertCircle },
      medium: { label: "Medium", variant: "secondary" as const, icon: Clock },
      low: { label: "Low", variant: "outline" as const, icon: CheckCircle },
    };

    const config = riskConfig[riskLevel as keyof typeof riskConfig] || riskConfig.low;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const approaching16 = getApproaching16();
  const stats = getComplianceStats();
  const allAdults = members.filter(m => m.member_type === 'adult' || m.member_type === 'assistant');
  const allChildren = members.filter(m => m.member_type === 'child');
  const adults = filterMembers(allAdults);
  const children = filterMembers(allChildren);

  if (loading) {
    return <div className="text-center py-8">Loading DBS compliance data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Compliance Metrics Dashboard */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ComplianceMetricsCard
          title="Critical Alerts"
          value={stats.criticalCount}
          icon={AlertTriangle}
          description="Overdue 30+ days or expired"
          variant="critical"
        />
        <ComplianceMetricsCard
          title="At Risk"
          value={stats.atRiskCount}
          icon={AlertCircle}
          description="Needs attention soon"
          variant="high"
        />
        <ComplianceMetricsCard
          title="Pending"
          value={stats.pendingCount}
          icon={Clock}
          description="Awaiting response"
          variant="medium"
        />
        <ComplianceMetricsCard
          title="Compliant"
          value={stats.compliantCount}
          icon={CheckCircle}
          description="All up to date"
          variant="success"
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-900 dark:text-orange-100">Expiring Soon</span>
          </div>
          <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.expiringSoonCount}</div>
          <p className="text-xs text-orange-700 dark:text-orange-300">Certificates expiring in 90 days</p>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Turning 16 Soon</span>
          </div>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{approaching16.length}</div>
          <p className="text-xs text-purple-700 dark:text-purple-300">Children approaching 16 in 90 days</p>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Completion Rate</span>
          </div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.percentage}%</div>
          <p className="text-xs text-blue-700 dark:text-blue-300">{stats.completed} of {stats.total} completed</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-muted/30 p-4 rounded-lg border flex justify-between items-center">
        <div>
          <h3 className="font-semibold">DBS Compliance Management</h3>
          <p className="text-sm text-muted-foreground">
            Track and manage DBS checks for all household members
          </p>
        </div>
        <div className="flex gap-2">
          {selectedMemberIds.size > 0 && (
            <Button onClick={handleSendBatchRequests} variant="default" size="sm">
              <Send className="h-4 w-4 mr-2" />
              Send {selectedMemberIds.size} Request{selectedMemberIds.size > 1 ? 's' : ''}
            </Button>
          )}
          <Button onClick={syncMembers} disabled={syncing} variant="outline" size="sm">
            {syncing ? "Syncing..." : "Sync from Application"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <ComplianceFilters
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        riskFilter={riskFilter}
        setRiskFilter={setRiskFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Children Approaching 16 Alert */}
      {approaching16.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-950/20 border-l-4 border-orange-500 p-4 rounded">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-orange-900 dark:text-orange-100">
                Children Approaching 16
              </h4>
              <div className="mt-2 space-y-2">
                {approaching16.map(child => {
                  const daysUntil16 = differenceInDays(addYears(new Date(child.date_of_birth), 16), new Date());
                  return (
                    <div key={child.id} className="flex items-center justify-between bg-white dark:bg-gray-900 p-3 rounded">
                      <div>
                        <p className="font-medium">{child.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Turns 16 in <strong>{daysUntil16} days</strong> - {format(addYears(new Date(child.date_of_birth), 16), 'dd/MM/yyyy')}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant={child.turning_16_notification_sent ? "outline" : "default"}
                        onClick={() => sendBirthdayAlert(child)}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        {child.turning_16_notification_sent ? "Resend Alert" : "Send Alert"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Adults & Assistants Table */}
      {adults.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Adults & Assistants (16+)</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="w-12 p-3"></th>
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium">Relationship</th>
                  <th className="text-left p-3 font-medium">DOB / Age</th>
                  <th className="text-left p-3 font-medium">Risk Level</th>
                  <th className="text-left p-3 font-medium">DBS Status</th>
                  <th className="text-left p-3 font-medium">Reminders</th>
                  <th className="text-left p-3 font-medium">Certificate #</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {adults.map(member => {
                  const daysSinceContact = member.last_contact_date 
                    ? differenceInDays(new Date(), new Date(member.last_contact_date))
                    : null;
                  
                  return (
                    <tr 
                      key={member.id} 
                      className={`border-t ${member.risk_level === 'critical' ? 'bg-red-50/50 dark:bg-red-950/10' : ''}`}
                    >
                      <td className="p-3">
                        <Checkbox
                          checked={selectedMemberIds.has(member.id)}
                          onCheckedChange={() => handleToggleMemberSelection(member.id)}
                        />
                      </td>
                      <td className="p-3 font-medium">{member.full_name}</td>
                      <td className="p-3 text-sm">{member.relationship || member.member_type}</td>
                      <td className="p-3 text-sm">
                        {format(new Date(member.date_of_birth), 'dd/MM/yyyy')}
                        <br />
                        <span className="text-muted-foreground">({calculateAge(member.date_of_birth)} years)</span>
                      </td>
                      <td className="p-3">{getRiskBadge(member.risk_level)}</td>
                      <td className="p-3">{getStatusBadge(member.dbs_status)}</td>
                      <td className="p-3">
                        <div className="text-sm">
                          <div className="font-medium">{member.reminder_count || 0} sent</div>
                          {daysSinceContact !== null && (
                            <div className="text-xs text-muted-foreground">
                              Last: {daysSinceContact}d ago
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        <div>
                          {member.dbs_certificate_number || "-"}
                        </div>
                        {member.dbs_certificate_expiry_date && (
                          <div className="text-xs text-muted-foreground">
                            Expires: {format(new Date(member.dbs_certificate_expiry_date), 'dd/MM/yyyy')}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          {(member.dbs_status === 'not_requested' || member.dbs_status === 'requested') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRequestDBS(member)}
                            >
                              <Mail className="h-4 w-4 mr-1" />
                              {member.dbs_status === 'requested' ? 'Resend' : 'Request'}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleRecordCertificate(member)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            {member.dbs_certificate_number ? 'Update' : 'Record'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Children Table */}
      {children.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Children in Household</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium">DOB / Age</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {children.map(child => {
                  const age = calculateAge(child.date_of_birth);
                  const is16Plus = age >= 16;
                  return (
                    <tr key={child.id} className="border-t">
                      <td className="p-3 font-medium">{child.full_name}</td>
                      <td className="p-3 text-sm">
                        {format(new Date(child.date_of_birth), 'dd/MM/yyyy')}
                        <br />
                        <span className="text-muted-foreground">({age} years)</span>
                      </td>
                      <td className="p-3">
                        {is16Plus ? getStatusBadge(child.dbs_status) : (
                          <Badge variant="outline">Under 16 - No DBS Required</Badge>
                        )}
                      </td>
                      <td className="p-3">
                        {is16Plus && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleRecordCertificate(child)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            {child.dbs_certificate_number ? 'Update' : 'Record'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {members.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No household members found.</p>
          <Button onClick={syncMembers} className="mt-4" disabled={syncing}>
            {syncing ? "Syncing..." : "Sync from Application Data"}
          </Button>
        </div>
      )}

      {selectedMember && (
        <RecordCertificateModal
          open={showCertificateModal}
          onOpenChange={setShowCertificateModal}
          member={selectedMember}
          onSave={handleCertificateSaved}
        />
      )}

      {requestMember && (
        <RequestDBSModal
          open={showRequestModal}
          onOpenChange={setShowRequestModal}
          memberId={requestMember.id}
          memberName={requestMember.full_name}
          applicationId={applicationId}
          applicantName={applicantName}
          applicantEmail={applicantEmail}
          originalApplicantEmail={applicantEmail}
          onSuccess={loadMembers}
        />
      )}

      <BatchDBSRequestModal
        open={showBatchRequestModal}
        onOpenChange={setShowBatchRequestModal}
        members={getSelectedMembers()}
        applicationId={applicationId}
        applicantEmail={applicantEmail}
        applicantName={applicantName}
        onSuccess={handleBatchRequestSuccess}
      />
    </div>
  );
};
