import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, AlertCircle, CheckCircle, Clock, FileText, Send, AlertTriangle, UserPlus, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { EmployeeRecordCertificateModal } from "./EmployeeRecordCertificateModal";
import { EmployeeRequestDBSModal } from "./EmployeeRequestDBSModal";
import { EmployeeBatchDBSRequestModal } from "./EmployeeBatchDBSRequestModal";
import { AddEditHouseholdMemberModal } from "./AddEditHouseholdMemberModal";
import { SendHouseholdFormModal } from "./SendHouseholdFormModal";
import { ComplianceFilters } from "./ComplianceFilters";
import { MemberActionsDropdown } from "./MemberActionsDropdown";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format, differenceInYears, addYears, differenceInDays } from "date-fns";
import { pdf } from "@react-pdf/renderer";
import { HouseholdFormPDF } from "./HouseholdFormPDF";

interface DBSMember {
  id: string;
  employee_id: string;
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
  form_token: string | null;
  application_submitted: boolean;
  response_received: boolean;
  form_data?: any;
}

interface EmployeeDBSComplianceSectionProps {
  employeeId: string;
  employeeEmail: string;
  employeeName: string;
}

export const EmployeeDBSComplianceSection = ({ employeeId, employeeEmail, employeeName }: EmployeeDBSComplianceSectionProps) => {
  const [members, setMembers] = useState<DBSMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<DBSMember | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showBatchRequestModal, setShowBatchRequestModal] = useState(false);
  const [requestMember, setRequestMember] = useState<DBSMember | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState<DBSMember | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingMember, setDeletingMember] = useState<DBSMember | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "adults" | "children">("all");
  const [showSendFormModal, setShowSendFormModal] = useState(false);
  const [formMember, setFormMember] = useState<DBSMember | null>(null);
  const { toast: toastHook } = useToast();

  useEffect(() => {
    loadMembers();
  }, [employeeId]);

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_household_members')
        .select('*')
        .eq('employee_id', employeeId)
        .order('member_type')
        .order('full_name');

      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      toastHook({
        title: "Error",
        description: "Failed to load household members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestDBS = (member: DBSMember) => {
    setRequestMember(member);
    setShowRequestModal(true);
  };

  const handleSendForm = (member: DBSMember) => {
    setFormMember(member);
    setShowSendFormModal(true);
  };

  const handleDownloadFormPDF = async (member: DBSMember) => {
    try {
      // Query the household_member_forms table for this member's form
      const { data: formData, error } = await supabase
        .from("household_member_forms")
        .select("*")
        .eq("member_id", member.id)
        .eq("status", "submitted")
        .single();

      if (error || !formData) {
        toastHook({
          title: "Error",
          description: "No completed form found for this household member",
          variant: "destructive",
        });
        return;
      }

      // Generate the PDF
      const blob = await pdf(
        <HouseholdFormPDF
          formData={formData}
          memberName={member.full_name}
          applicantName={employeeName}
        />
      ).toBlob();

      // Download the PDF
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `household-form-${member.full_name.replace(/\s+/g, "-")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toastHook({
        title: "Success",
        description: "PDF downloaded successfully",
      });
    } catch (error: any) {
      console.error("Error downloading PDF:", error);
      toastHook({
        title: "Error",
        description: "Failed to download PDF",
        variant: "destructive",
      });
    }
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
          employeeEmail,
          employeeName,
          employeeId,
          isEmployee: true,
        },
      });

      if (error) throw error;

      toastHook({
        title: "Alert Sent",
        description: `Birthday alert sent to ${employeeName}`,
      });

      loadMembers();
    } catch (error: any) {
      toastHook({
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

  const handleAddMember = () => {
    setEditingMember(null);
    setShowAddEditModal(true);
  };

  const handleEditMember = (member: DBSMember) => {
    setEditingMember(member);
    setShowAddEditModal(true);
  };

  const handleDeleteMember = (member: DBSMember) => {
    setDeletingMember(member);
    setShowDeleteDialog(true);
  };

  const confirmDeleteMember = async () => {
    if (!deletingMember) return;
    
    try {
      const { error } = await supabase
        .from('employee_household_members')
        .delete()
        .eq('id', deletingMember.id);

      if (error) throw error;

      toastHook({
        title: "Member Deleted",
        description: `${deletingMember.full_name} has been removed from the household.`,
      });

      loadMembers();
      setShowDeleteDialog(false);
      setDeletingMember(null);
    } catch (error: any) {
      toastHook({
        title: "Failed to Delete",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleMemberSaved = () => {
    setShowAddEditModal(false);
    setEditingMember(null);
    loadMembers();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      not_requested: { label: "Not Requested", variant: "destructive" as const, icon: AlertCircle },
      requested: { label: "Requested", variant: "secondary" as const, icon: Mail },
      received: { label: "Received", variant: "default" as const, icon: CheckCircle },
      expired: { label: "Expired", variant: "destructive" as const, icon: AlertTriangle },
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
      const age = calculateAge(m.date_of_birth);
      if (age >= 16) return false;
      const daysUntil16 = differenceInDays(addYears(new Date(m.date_of_birth), 16), new Date());
      return daysUntil16 <= 90;
    });
  };

  const filterMembers = (membersList: DBSMember[]) => {
    return membersList.filter(member => {
      // Search filter
      if (searchQuery && !member.full_name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Status filter
      if (statusFilter !== "all" && member.dbs_status !== statusFilter) {
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
  
  // Filter members by age (recalculated to handle aging children)
  const allMembers = filterMembers(members);
  const adults = allMembers.filter(m => {
    const age = differenceInYears(new Date(), new Date(m.date_of_birth));
    return age >= 16;
  });
  const children = allMembers.filter(m => {
    const age = differenceInYears(new Date(), new Date(m.date_of_birth));
    return age < 16;
  });

  if (loading) {
    return (
      <div className="rounded-2xl border-0 bg-card shadow-apple-sm p-6">
        <div className="space-y-4">
          <div className="h-6 w-48 bg-muted rounded-lg animate-shimmer" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-xl animate-shimmer" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const renderAdultsTable = () => (
    <div className="border border-border/40 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr className="border-b border-border/50">
              <th className="w-12 px-4 py-3">
                <Checkbox
                  checked={adults.length > 0 && adults.every(m => selectedMemberIds.has(m.id))}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedMemberIds(new Set([...selectedMemberIds, ...adults.map(m => m.id)]));
                    } else {
                      const newSet = new Set(selectedMemberIds);
                      adults.forEach(m => newSet.delete(m.id));
                      setSelectedMemberIds(newSet);
                    }
                  }}
                />
              </th>
              <th className="text-left px-4 py-3 font-semibold text-sm">Name</th>
              <th className="text-left px-4 py-3 font-semibold text-sm">Relationship</th>
              <th className="text-left px-4 py-3 font-semibold text-sm">DBS Status</th>
              <th className="text-left px-4 py-3 font-semibold text-sm">Form Status</th>
              <th className="w-12 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-card">
            {adults.map(member => {
              const isCompliant = member.dbs_status === 'received' && member.application_submitted;
              const isCritical = member.dbs_status !== 'received' || !member.application_submitted;
              
              return (
                <tr 
                  key={member.id} 
                  className={`border-b border-border/30 hover:opacity-90 transition-all ${
                    isCompliant 
                      ? 'bg-green-50/50 dark:bg-green-950/20 hover:bg-green-50/70 dark:hover:bg-green-950/30' 
                      : 'bg-red-50/50 dark:bg-red-950/20 hover:bg-red-50/70 dark:hover:bg-red-950/30'
                  }`}
                >
                  <td className="px-4 py-4">
                    <Checkbox
                      checked={selectedMemberIds.has(member.id)}
                      onCheckedChange={() => handleToggleMemberSelection(member.id)}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <div className="font-semibold text-foreground">{member.full_name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        DOB: {format(new Date(member.date_of_birth), 'dd/MM/yyyy')} ({calculateAge(member.date_of_birth)} years)
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    {member.relationship || member.member_type}
                  </td>
                  <td className="px-4 py-4">{getStatusBadge(member.dbs_status)}</td>
                  <td className="px-4 py-4">
                    {member.application_submitted ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDownloadFormPDF(member)}
                        className="gap-1"
                      >
                        <FileText className="h-3 w-3" />
                        Download PDF
                      </Button>
                    ) : member.form_token ? (
                      <Badge variant="secondary" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Pending
                      </Badge>
                    ) : (
                      <Badge variant="outline">Not Sent</Badge>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <MemberActionsDropdown
                      member={member}
                      onRequestDBS={() => handleRequestDBS(member)}
                      onRecordCertificate={() => handleRecordCertificate(member)}
                      onSendForm={() => handleSendForm(member)}
                      onDownloadForm={() => handleDownloadFormPDF(member)}
                      onEdit={() => handleEditMember(member)}
                      onDelete={() => handleDeleteMember(member)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderChildrenTable = () => (
    <div className="border border-border/40 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr className="border-b border-border/50">
              <th className="text-left px-4 py-3 font-semibold text-sm">Name</th>
              <th className="text-left px-4 py-3 font-semibold text-sm">Relationship</th>
              <th className="text-left px-4 py-3 font-semibold text-sm">Certificate</th>
              <th className="w-12 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-card">
            {children.map(child => {
              const age = differenceInYears(new Date(), new Date(child.date_of_birth));
              const is16Plus = age >= 16;
              
              return (
                <tr key={child.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-4">
                    <div>
                      <div className="font-semibold text-foreground">{child.full_name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        DOB: {format(new Date(child.date_of_birth), 'dd/MM/yyyy')} ({age} years)
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    {child.relationship || child.member_type}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {child.dbs_certificate_number ? (
                      <span className="font-mono text-xs">{child.dbs_certificate_number}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <MemberActionsDropdown
                      member={child}
                      onRequestDBS={() => {}}
                      onRecordCertificate={() => handleRecordCertificate(child)}
                      onSendForm={() => {}}
                      onDownloadForm={() => {}}
                      onEdit={() => handleEditMember(child)}
                      onDelete={() => handleDeleteMember(child)}
                      isChild={!is16Plus}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Household Compliance Management</h2>
          <p className="text-muted-foreground mt-2">
            Track and manage DBS checks and household forms for all household members
          </p>
        </div>
        {selectedMemberIds.size > 0 && (
          <Button onClick={handleSendBatchRequests} size="default" className="rounded-lg shadow-sm">
            <Send className="h-4 w-4 mr-2" />
            Send {selectedMemberIds.size} Request{selectedMemberIds.size > 1 ? 's' : ''}
          </Button>
        )}
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

      {/* Tabs for All/Adults/Children */}
      {allMembers.length > 0 ? (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "adults" | "children")} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-12 p-1 bg-muted/50 rounded-xl">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-medium rounded-lg transition-all"
            >
              All ({allMembers.length})
            </TabsTrigger>
            <TabsTrigger 
              value="adults" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-medium rounded-lg transition-all"
            >
              Adults ({adults.length})
            </TabsTrigger>
            <TabsTrigger 
              value="children" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-medium rounded-lg transition-all"
            >
              Children ({children.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {adults.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Adults & Assistants (16+)</h3>
                  <Button onClick={handleAddMember} variant="outline" size="sm" className="rounded-lg">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </div>
                {renderAdultsTable()}
              </div>
            )}
            {children.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Children (Under 16)</h3>
                {renderChildrenTable()}
              </div>
            )}
          </TabsContent>

          <TabsContent value="adults" className="space-y-4">
            {adults.length > 0 ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Adults & Assistants (16+)</h3>
                  <Button onClick={handleAddMember} variant="outline" size="sm" className="rounded-lg">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </div>
                {renderAdultsTable()}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg bg-muted/30">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No Adults</p>
                <p className="text-sm text-muted-foreground">No household members aged 16 or over.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="children" className="space-y-4">
            {children.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold mb-4">Children (Under 16)</h3>
                {renderChildrenTable()}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg bg-muted/30">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No Children</p>
                <p className="text-sm text-muted-foreground">No household members under 16 years old.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-muted/30">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">No Household Members</p>
          <p className="text-sm text-muted-foreground mb-4">
            Add adults and children living in the same household as the employee.
          </p>
          <Button onClick={handleAddMember}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add First Member
          </Button>
        </div>
      )}

      {/* Modals */}
      <AddEditHouseholdMemberModal
        open={showAddEditModal}
        onOpenChange={setShowAddEditModal}
        member={editingMember}
        employeeId={employeeId}
        onSave={handleMemberSaved}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Household Member?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{deletingMember?.full_name}</strong> from the household?
              This will permanently delete their DBS tracking records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteMember} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedMember && (
        <EmployeeRecordCertificateModal
          open={showCertificateModal}
          onOpenChange={setShowCertificateModal}
          member={selectedMember}
          onSave={handleCertificateSaved}
        />
      )}

      {requestMember && (
        <EmployeeRequestDBSModal
          open={showRequestModal}
          onOpenChange={setShowRequestModal}
          memberId={requestMember.id}
          memberName={requestMember.full_name}
          employeeId={employeeId}
          employeeName={employeeName}
          employeeEmail={requestMember.email || ''}
          originalEmployeeEmail={employeeEmail}
          onSuccess={loadMembers}
        />
      )}

      {selectedMemberIds.size > 0 && (
        <EmployeeBatchDBSRequestModal
          open={showBatchRequestModal}
          onOpenChange={setShowBatchRequestModal}
          members={getSelectedMembers()}
          employeeId={employeeId}
          employeeEmail={employeeEmail}
          employeeName={employeeName}
          onSuccess={handleBatchRequestSuccess}
        />
      )}

      {formMember && (
        <SendHouseholdFormModal
          isOpen={showSendFormModal}
          onClose={() => setShowSendFormModal(false)}
          member={formMember}
          applicantEmail={employeeEmail}
          applicantName={employeeName}
          onSuccess={loadMembers}
          isEmployee={true}
          employeeId={employeeId}
        />
      )}
    </div>
  );
};
