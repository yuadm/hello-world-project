import { useState, useEffect } from "react";
import { AppleCard } from "@/components/admin/AppleCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Download, FileCheck, Plus, Trash2, FileText } from "lucide-react";
import { AddEditEmployeeAssistantModal } from "@/components/admin/AddEditEmployeeAssistantModal";
import { SendOfstedFormModal } from "@/components/admin/SendOfstedFormModal";
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
import { TrafficLightIndicator } from "@/components/admin/application-detail/TrafficLightIndicator";
import { DualTrafficLightIndicator } from "@/components/admin/application-detail/DualTrafficLightIndicator";
import { UnifiedSendAssistantFormModal } from "./UnifiedSendAssistantFormModal";
import { UnifiedRequestAssistantDBSModal } from "./UnifiedRequestAssistantDBSModal";
import { UnifiedRecordAssistantCertificateModal } from "./UnifiedRecordAssistantCertificateModal";
import { pdf } from "@react-pdf/renderer";
import { AssistantFormPDF } from "@/components/admin/AssistantFormPDF";
import { format, differenceInDays } from "date-fns";

interface Assistant {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  role: string;
  email: string | null;
  phone: string | null;
  dbs_status: string;
  dbs_certificate_number: string | null;
  dbs_certificate_date: string | null;
  dbs_certificate_expiry_date: string | null;
  form_token: string | null;
  form_status: string | null;
  notes: string | null;
}

interface AssistantFormData {
  id: string;
  form_token: string;
  assistant_id: string;
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
  employment_history?: any;
  employment_gaps?: string;
  pfa_completed?: string;
  safeguarding_completed?: string;
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

interface UnifiedAssistantComplianceCardProps {
  parentId: string;
  parentType: 'application' | 'employee';
  parentEmail: string;
  parentName: string;
}

export const UnifiedAssistantComplianceCard = ({
  parentId,
  parentType,
  parentEmail,
  parentName,
}: UnifiedAssistantComplianceCardProps) => {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [forms, setForms] = useState<Map<string, AssistantFormData>>(new Map());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Modal states
  const [showSendFormModal, setShowSendFormModal] = useState(false);
  const [showDBSModal, setShowDBSModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showOfstedModal, setShowOfstedModal] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);

  useEffect(() => {
    loadAssistants();
  }, [parentId, parentType]);

  const loadAssistants = async () => {
    try {
      // Query compliance_assistants using polymorphic reference
      const query = supabase
        .from("compliance_assistants")
        .select("*")
        .order("first_name");

      if (parentType === 'application') {
        query.eq("application_id", parentId);
      } else {
        query.eq("employee_id", parentId);
      }

      const { data: assistantsData, error: assistantsError } = await query;
      if (assistantsError) throw assistantsError;

      // Query compliance_assistant_forms for submitted forms
      const formsQuery = supabase
        .from("compliance_assistant_forms")
        .select("*")
        .eq("status", "submitted");

      if (parentType === 'application') {
        formsQuery.eq("application_id", parentId);
      } else {
        formsQuery.eq("employee_id", parentId);
      }

      const { data: formsData, error: formsError } = await formsQuery;
      if (formsError) throw formsError;

      const formsMap = new Map(formsData?.map((f) => [f.assistant_id, f]) || []);

      setAssistants(assistantsData || []);
      setForms(formsMap);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load assistants",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTrafficLightStatus = (assistant: Assistant): "compliant" | "pending" | "critical" | "not_applicable" => {
    if (assistant.dbs_status === "received" && assistant.dbs_certificate_expiry_date) {
      const daysUntilExpiry = differenceInDays(new Date(assistant.dbs_certificate_expiry_date), new Date());
      if (daysUntilExpiry < 0) return "critical"; // Expired
      if (daysUntilExpiry < 30) return "pending"; // Expiring soon
      return "compliant";
    }

    if (assistant.dbs_status === "requested") return "pending";

    return "critical";
  };

  const getFormStatus = (assistant: Assistant, hasForm: boolean): "compliant" | "pending" | "critical" => {
    if (hasForm) return "compliant";
    if (assistant.form_status === "sent" || assistant.form_token) return "pending";
    return "critical";
  };

  const getDBSStatus = (assistant: Assistant): "compliant" | "pending" | "critical" => {
    if (assistant.dbs_status === "received" && assistant.dbs_certificate_expiry_date) {
      const daysUntilExpiry = differenceInDays(new Date(assistant.dbs_certificate_expiry_date), new Date());
      if (daysUntilExpiry < 0) return "critical";
      if (daysUntilExpiry < 30) return "pending";
      return "compliant";
    }
    if (assistant.dbs_status === "requested") return "pending";
    return "critical";
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      compliant: { variant: "default", label: "Compliant" },
      pending: { variant: "secondary", label: "Pending" },
      critical: { variant: "destructive", label: "Critical" },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleDownloadPDF = async (assistant: Assistant) => {
    const form = forms.get(assistant.id);
    if (!form) {
      toast({ title: "Error", description: "Form not found", variant: "destructive" });
      return;
    }

    try {
      const blob = await pdf(
        <AssistantFormPDF
          formData={form}
          assistantName={`${assistant.first_name} ${assistant.last_name}`}
          applicantName={parentName}
          assistantRole={assistant.role}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `assistant-form-${assistant.first_name}-${assistant.last_name}.pdf`;
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

    assistants.forEach((assistant) => {
      const status = getTrafficLightStatus(assistant);
      if (status === "compliant") compliant++;
      else if (status === "pending") pending++;
      else if (status === "critical") critical++;
    });

    return { compliant, pending, critical };
  };

  const counts = getStatusCounts();

  const handleDeleteAssistant = async () => {
    if (!selectedAssistant) return;

    try {
      const { error } = await supabase
        .from("compliance_assistants")
        .delete()
        .eq("id", selectedAssistant.id);

      if (error) throw error;

      toast({
        title: "Assistant Deleted",
        description: `${selectedAssistant.first_name} ${selectedAssistant.last_name} has been removed.`,
      });

      loadAssistants();
      setShowDeleteDialog(false);
      setSelectedAssistant(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete assistant",
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
              <h2 className="text-lg font-semibold tracking-tight mb-1">👥 Assistants</h2>
              <p className="text-sm text-muted-foreground">
                {assistants.length} assistant{assistants.length !== 1 ? "s" : ""}
              </p>
            </div>
            {parentType === 'employee' && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  setSelectedAssistant(null);
                  setShowAddEditModal(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Add Assistant
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1">
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
        </div>

        <div className="space-y-3">
          {assistants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No assistants found.
            </div>
          ) : (
            assistants.map((assistant) => {
              const status = getTrafficLightStatus(assistant);
              const hasForm = forms.has(assistant.id);

              return (
                <div key={assistant.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <TrafficLightIndicator status={status} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{assistant.first_name} {assistant.last_name}</span>
                          <span className="text-sm text-muted-foreground">({assistant.role})</span>
                          {getStatusBadge(status)}
                        </div>
                        <DualTrafficLightIndicator 
                          formStatus={getFormStatus(assistant, hasForm)}
                          dbsStatus={getDBSStatus(assistant)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border space-y-2 text-sm">
                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <span className="text-muted-foreground">Email:</span> {assistant.email || "Not provided"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Phone:</span> {assistant.phone || "Not provided"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">DOB:</span> {format(new Date(assistant.date_of_birth), "dd/MM/yyyy")}
                      </div>
                      <div>
                        <span className="text-muted-foreground">DBS Status:</span> {assistant.dbs_status.replace("_", " ")}
                      </div>
                      {assistant.dbs_certificate_number && (
                        <div>
                          <span className="text-muted-foreground">Certificate:</span> {assistant.dbs_certificate_number}
                        </div>
                      )}
                    </div>
                    {assistant.notes && (
                      <div className="mt-2 p-2 bg-muted rounded text-xs">
                        <span className="font-medium">Notes:</span> {assistant.notes}
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
                            setSelectedAssistant(assistant);
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
                            setSelectedAssistant(assistant);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        setSelectedAssistant(assistant);
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
                        onClick={() => handleDownloadPDF(assistant)}
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
                        setSelectedAssistant(assistant);
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
                        setSelectedAssistant(assistant);
                        setShowCertModal(true);
                      }}
                    >
                      <FileCheck className="h-4 w-4" />
                      Record Certificate
                    </Button>

                    {hasForm && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                          setSelectedAssistant(assistant);
                          setShowOfstedModal(true);
                        }}
                      >
                        <FileText className="h-4 w-4" />
                        Ofsted Check
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </AppleCard>

      <AddEditEmployeeAssistantModal
        open={showAddEditModal}
        onOpenChange={setShowAddEditModal}
        assistant={selectedAssistant}
        parentId={parentId}
        parentType={parentType}
        onSave={() => {
          loadAssistants();
          setSelectedAssistant(null);
        }}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assistant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedAssistant?.first_name} {selectedAssistant?.last_name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAssistant} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {showSendFormModal && selectedAssistant && (
        <UnifiedSendAssistantFormModal
          onClose={() => {
            setShowSendFormModal(false);
            setSelectedAssistant(null);
          }}
          assistant={{
            id: selectedAssistant.id,
            first_name: selectedAssistant.first_name,
            last_name: selectedAssistant.last_name,
            email: selectedAssistant.email,
          }}
          parentEmail={parentEmail}
          parentName={parentName}
          parentType={parentType}
          parentId={parentId}
          onSuccess={loadAssistants}
        />
      )}

      {showDBSModal && selectedAssistant && (
        <UnifiedRequestAssistantDBSModal
          open={showDBSModal}
          onOpenChange={(open) => {
            setShowDBSModal(open);
            if (!open) setSelectedAssistant(null);
          }}
          assistantId={selectedAssistant.id}
          assistantName={`${selectedAssistant.first_name} ${selectedAssistant.last_name}`}
          assistantEmail={selectedAssistant.email || ""}
          parentEmail={parentEmail}
          onSuccess={loadAssistants}
        />
      )}

      {showCertModal && selectedAssistant && (
        <UnifiedRecordAssistantCertificateModal
          open={showCertModal}
          onOpenChange={(open) => {
            setShowCertModal(open);
            if (!open) setSelectedAssistant(null);
          }}
          assistant={{
            id: selectedAssistant.id,
            first_name: selectedAssistant.first_name,
            last_name: selectedAssistant.last_name,
            dbs_status: selectedAssistant.dbs_status,
            dbs_certificate_number: selectedAssistant.dbs_certificate_number,
            dbs_certificate_date: selectedAssistant.dbs_certificate_date,
            dbs_certificate_expiry_date: selectedAssistant.dbs_certificate_expiry_date,
          }}
          onSuccess={loadAssistants}
        />
      )}

      {showOfstedModal && selectedAssistant && (() => {
        const form = forms.get(selectedAssistant.id);
        if (!form) return null;
        
        return (
          <SendOfstedFormModal
            open={showOfstedModal}
            onOpenChange={(open) => {
              setShowOfstedModal(open);
              if (!open) setSelectedAssistant(null);
            }}
            applicantName={`${selectedAssistant.first_name} ${selectedAssistant.last_name}`}
            dateOfBirth={selectedAssistant.date_of_birth}
            currentAddress={{
              line1: form.current_address?.line1 || '',
              line2: form.current_address?.line2,
              town: form.current_address?.town || '',
              postcode: form.current_address?.postcode || '',
              moveInDate: form.current_address?.moveInDate || '',
            }}
            previousAddresses={form.address_history?.map((addr: any) => ({
              address: addr.address || '',
              dateFrom: addr.moveIn || '',
              dateTo: addr.moveOut || '',
            }))}
            previousNames={form.previous_names?.map((prev: any) => ({
              name: prev.fullName || '',
              dateFrom: prev.dateFrom || '',
              dateTo: prev.dateTo || '',
            }))}
            role="assistant"
            parentId={parentId}
            parentType={parentType}
          />
        );
      })()}
    </>
  );
};
