import { useState, useEffect } from "react";
import { AppleCard } from "@/components/admin/AppleCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Download, FileCheck, Plus, Trash2 } from "lucide-react";
import { AddEditHouseholdMemberModal } from "@/components/admin/AddEditHouseholdMemberModal";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DualTrafficLightIndicator } from "@/components/admin/application-detail/DualTrafficLightIndicator";
import { UnifiedSendHouseholdFormModal } from "./UnifiedSendHouseholdFormModal";
import { UnifiedRequestDBSModal } from "./UnifiedRequestDBSModal";
import { UnifiedRecordCertificateModal } from "./UnifiedRecordCertificateModal";
import { pdf } from "@react-pdf/renderer";
import { HouseholdFormPDF } from "@/components/admin/HouseholdFormPDF";
import { format, differenceInYears, addYears, differenceInDays } from "date-fns";

interface HouseholdMember {
  id: string;
  full_name: string;
  date_of_birth: string;
  member_type: string;
  relationship: string | null;
  email: string | null;
  dbs_status: string;
  dbs_certificate_number: string | null;
  dbs_certificate_date: string | null;
  dbs_certificate_expiry_date: string | null;
  form_token: string | null;
  notes: string | null;
}

interface HouseholdFormData {
  id: string;
  form_token: string;
  member_id: string;
  title?: string;
  first_name?: string;
  middle_names?: string;
  last_name?: string;
  previous_names?: any;
  date_of_birth?: string;
  birth_town?: string;
  sex?: string;
  ni_number?: string;
  current_address?: any;
  address_history?: any;
  lived_outside_uk?: string;
  outside_uk_details?: string;
  previous_registration?: string;
  previous_registration_details?: any;
  has_dbs?: string;
  dbs_number?: string;
  dbs_update_service?: string;
  criminal_history?: string;
  criminal_history_details?: string;
  disqualified?: string;
  social_services?: string;
  social_services_details?: string;
  health_conditions?: string;
  health_conditions_details?: string;
  smoker?: string;
  consent_checks?: boolean;
  declaration_truth?: boolean;
  declaration_notify?: boolean;
  signature_name?: string;
  signature_date?: string;
  submitted_at?: string;
  status?: string;
}

interface UnifiedHouseholdComplianceCardProps {
  parentId: string;
  parentType: 'application' | 'employee';
  parentEmail: string;
  parentName: string;
}

export const UnifiedHouseholdComplianceCard = ({
  parentId,
  parentType,
  parentEmail,
  parentName,
}: UnifiedHouseholdComplianceCardProps) => {
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [forms, setForms] = useState<Map<string, HouseholdFormData>>(new Map());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Modal states
  const [showSendFormModal, setShowSendFormModal] = useState(false);
  const [showDBSModal, setShowDBSModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<HouseholdMember | null>(null);

  useEffect(() => {
    loadMembers();
  }, [parentId, parentType]);

  const loadMembers = async () => {
    try {
      // Query compliance_household_members using polymorphic reference
      const query = supabase
        .from("compliance_household_members")
        .select("*")
        .order("member_type", { ascending: false })
        .order("full_name");

      if (parentType === 'application') {
        query.eq("application_id", parentId);
      } else {
        query.eq("employee_id", parentId);
      }

      const { data: membersData, error: membersError } = await query;
      if (membersError) throw membersError;

      // Query compliance_household_forms for submitted forms
      const formsQuery = supabase
        .from("compliance_household_forms")
        .select("*")
        .eq("status", "submitted");

      if (parentType === 'application') {
        formsQuery.eq("application_id", parentId);
      } else {
        formsQuery.eq("employee_id", parentId);
      }

      const { data: formsData, error: formsError } = await formsQuery;
      if (formsError) throw formsError;

      const formsMap = new Map(formsData?.map((f) => [f.member_id, f]) || []);

      setMembers(membersData || []);
      setForms(formsMap);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load household members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFormStatus = (member: HouseholdMember, hasForm: boolean): "compliant" | "pending" | "critical" => {
    if (hasForm) return "compliant";
    if (member.form_token) return "pending";
    return "critical";
  };

  const getDBSStatus = (member: HouseholdMember): "compliant" | "pending" | "critical" => {
    const age = differenceInYears(new Date(), new Date(member.date_of_birth));

    // Under 16 - DBS not required, show as pending (N/A)
    if (age < 16) return "pending";

    if (member.dbs_status === "received" && member.dbs_certificate_expiry_date) {
      const daysUntilExpiry = differenceInDays(new Date(member.dbs_certificate_expiry_date), new Date());
      if (daysUntilExpiry < 0) return "critical"; // Expired
      if (daysUntilExpiry < 30) return "pending"; // Expiring soon
      return "compliant";
    }

    if (member.dbs_status === "requested") return "pending";

    return "critical";
  };

  const getOverallStatus = (member: HouseholdMember): "compliant" | "pending" | "critical" | "not_applicable" => {
    const age = differenceInYears(new Date(), new Date(member.date_of_birth));
    if (age < 16) return "not_applicable";
    
    const dbsStatus = getDBSStatus(member);
    if (dbsStatus === "critical") return "critical";
    if (dbsStatus === "pending") return "pending";
    return "compliant";
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      compliant: { variant: "default", label: "Compliant" },
      pending: { variant: "secondary", label: "Pending" },
      critical: { variant: "destructive", label: "Critical" },
      not_applicable: { variant: "outline", label: "N/A" },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleDownloadPDF = async (member: HouseholdMember) => {
    const form = forms.get(member.id);
    if (!form) {
      toast({ title: "Error", description: "Form not found", variant: "destructive" });
      return;
    }

    try {
      const blob = await pdf(
        <HouseholdFormPDF
          formData={form}
          memberName={member.full_name}
          applicantName={parentName}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `household-form-${member.full_name.replace(/\s+/g, "-")}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate PDF", variant: "destructive" });
    }
  };

  const getStatusCounts = () => {
    let compliant = 0;
    let pending = 0;
    let critical = 0;

    members.forEach((member) => {
      const status = getOverallStatus(member);
      if (status === "compliant") compliant++;
      else if (status === "pending") pending++;
      else if (status === "critical") critical++;
    });

    return { compliant, pending, critical };
  };

  const counts = getStatusCounts();

  const handleDeleteMember = async () => {
    if (!selectedMember) return;

    try {
      const { error } = await supabase
        .from("compliance_household_members")
        .delete()
        .eq("id", selectedMember.id);

      if (error) throw error;

      toast({
        title: "Member Deleted",
        description: `${selectedMember.full_name} has been removed.`,
      });

      loadMembers();
      setShowDeleteDialog(false);
      setSelectedMember(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete member",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <AppleCard className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      </AppleCard>
    );
  }

  return (
    <>
      <AppleCard className="p-6">
        <div className="flex items-start justify-between gap-6 mb-6">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight mb-1">🏠 Household Members</h2>
              <p className="text-sm text-muted-foreground">
                {members.length} member{members.length !== 1 ? "s" : ""}
              </p>
            </div>
            {parentType === 'employee' && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  setSelectedMember(null);
                  setShowAddEditModal(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Add Member
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {counts.compliant > 0 && (
              <span className="inline-flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                {counts.compliant} Compliant
              </span>
            )}
            {counts.pending > 0 && (
              <span className="inline-flex items-center gap-1 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                {counts.pending} Pending
              </span>
            )}
            {counts.critical > 0 && (
              <span className="inline-flex items-center gap-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                {counts.critical} Critical
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No household members found.
            </div>
          ) : (
            members.map((member) => {
              const age = differenceInYears(new Date(), new Date(member.date_of_birth));
              const status = getOverallStatus(member);
              const hasForm = forms.has(member.id);
              const formStatus = getFormStatus(member, hasForm);
              const dbsStatus = getDBSStatus(member);

              return (
                <div key={member.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{member.full_name}</span>
                        <span className="text-sm text-muted-foreground">
                          ({member.relationship || member.member_type}, {age})
                        </span>
                        {getStatusBadge(status)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">
                        {status === "not_applicable" && (
                          <>Under 16 - Turns 16: {format(addYears(new Date(member.date_of_birth), 16), "dd MMM yyyy")}</>
                        )}
                        {status === "compliant" && member.dbs_certificate_number && (
                          <>DBS: Valid until {format(new Date(member.dbs_certificate_expiry_date!), "dd MMM yyyy")} • {member.dbs_certificate_number}</>
                        )}
                        {status === "pending" && member.dbs_status === "requested" && (
                          <>DBS: Requested - Awaiting response</>
                        )}
                        {status === "critical" && age >= 16 && member.dbs_status === "not_requested" && (
                          <>DBS: Not requested - Action required</>
                        )}
                      </div>
                      {age >= 16 && (
                        <DualTrafficLightIndicator 
                          formStatus={formStatus}
                          dbsStatus={dbsStatus}
                          className="mt-2"
                        />
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-muted-foreground">Email:</span> {member.email || "Not provided"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">DOB:</span> {format(new Date(member.date_of_birth), "dd/MM/yyyy")}
                      </div>
                      <div>
                        <span className="text-muted-foreground">DBS Status:</span> {member.dbs_status.replace("_", " ")}
                      </div>
                      {member.dbs_certificate_number && (
                        <div>
                          <span className="text-muted-foreground">Certificate:</span> {member.dbs_certificate_number}
                        </div>
                      )}
                    </div>
                    {member.notes && (
                      <div className="mt-2 p-2 bg-muted rounded text-xs">
                        <span className="font-medium">Notes:</span> {member.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {parentType === 'employee' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => {
                            setSelectedMember(member);
                            setShowAddEditModal(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 text-destructive hover:text-destructive"
                          onClick={() => {
                            setSelectedMember(member);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </>
                    )}
                    
                    {age >= 16 && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => {
                            setSelectedMember(member);
                            setShowSendFormModal(true);
                          }}
                        >
                          <Mail className="h-4 w-4" />
                          Send Form
                        </Button>

                        {hasForm && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleDownloadPDF(member)}
                          >
                            <Download className="h-4 w-4" />
                            Download PDF
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => {
                            setSelectedMember(member);
                            setShowDBSModal(true);
                          }}
                        >
                          <Mail className="h-4 w-4" />
                          Request DBS
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => {
                            setSelectedMember(member);
                            setShowCertModal(true);
                          }}
                        >
                          <FileCheck className="h-4 w-4" />
                          Record Certificate
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </AppleCard>

      <AddEditHouseholdMemberModal
        open={showAddEditModal}
        onOpenChange={setShowAddEditModal}
        member={selectedMember}
        parentId={parentId}
        parentType={parentType}
        onSave={() => {
          loadMembers();
          setSelectedMember(null);
        }}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Household Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedMember?.full_name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMember} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedMember && (
        <>
          <UnifiedSendHouseholdFormModal
            isOpen={showSendFormModal}
            onClose={() => {
              setShowSendFormModal(false);
              setSelectedMember(null);
            }}
            member={selectedMember}
            parentEmail={parentEmail}
            parentName={parentName}
            parentType={parentType}
            parentId={parentId}
            onSuccess={loadMembers}
          />

          <UnifiedRequestDBSModal
            open={showDBSModal}
            onOpenChange={(open) => {
              setShowDBSModal(open);
              if (!open) setSelectedMember(null);
            }}
            memberId={selectedMember.id}
            memberName={selectedMember.full_name}
            parentId={parentId}
            parentType={parentType}
            parentName={parentName}
            parentEmail={parentEmail}
            onSuccess={loadMembers}
          />

          <UnifiedRecordCertificateModal
            open={showCertModal}
            onOpenChange={(open) => {
              setShowCertModal(open);
              if (!open) setSelectedMember(null);
            }}
            member={selectedMember}
            onSave={loadMembers}
          />
        </>
      )}
    </>
  );
};
