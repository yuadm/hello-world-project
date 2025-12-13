import { useState, useEffect } from "react";
import { AppleCard } from "@/components/admin/AppleCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Download, FileCheck, Trash2, ChevronDown, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { UnifiedSendCochildminderFormModal } from "./UnifiedSendCochildminderFormModal";
import { UnifiedRequestCochildminderDBSModal } from "./UnifiedRequestCochildminderDBSModal";
import { UnifiedRecordCochildminderCertificateModal } from "./UnifiedRecordCochildminderCertificateModal";
import { pdf } from "@react-pdf/renderer";
import { CochildminderFormPDF } from "@/components/admin/CochildminderFormPDF";
import { format, differenceInDays } from "date-fns";

interface Cochildminder {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
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

interface CochildminderFormData {
  id: string;
  form_token: string;
  cochildminder_id: string;
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
  premises_address?: any;
  local_authority?: string;
  premises_type?: string;
  service_age_groups?: any;
  service_hours?: any;
  first_aid_completed?: string;
  first_aid_provider?: string;
  first_aid_date?: string;
  safeguarding_completed?: string;
  safeguarding_provider?: string;
  safeguarding_date?: string;
  pfa_completed?: string;
  level_2_qualification?: string;
  level_2_provider?: string;
  level_2_date?: string;
  eyfs_completed?: string;
  eyfs_provider?: string;
  eyfs_date?: string;
  other_qualifications?: string;
  has_dbs?: string;
  dbs_number?: string;
  dbs_update_service?: string;
  employment_history?: any;
  employment_gaps?: string;
  reference_1_name?: string;
  reference_1_relationship?: string;
  reference_1_email?: string;
  reference_1_phone?: string;
  reference_1_childcare?: boolean;
  reference_2_name?: string;
  reference_2_relationship?: string;
  reference_2_email?: string;
  reference_2_phone?: string;
  reference_2_childcare?: boolean;
  previous_registration?: string;
  previous_registration_details?: any;
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

interface UnifiedCochildminderComplianceCardProps {
  parentId: string;
  parentType: 'application' | 'employee';
  parentEmail: string;
  parentName: string;
}

export const UnifiedCochildminderComplianceCard = ({
  parentId,
  parentType,
  parentEmail,
  parentName,
}: UnifiedCochildminderComplianceCardProps) => {
  const [cochildminders, setCochildminders] = useState<Cochildminder[]>([]);
  const [forms, setForms] = useState<Map<string, CochildminderFormData>>(new Map());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Modal states
  const [showSendFormModal, setShowSendFormModal] = useState(false);
  const [showDBSModal, setShowDBSModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCochildminder, setSelectedCochildminder] = useState<Cochildminder | null>(null);

  useEffect(() => {
    loadCochildminders();
  }, [parentId, parentType]);

  const loadCochildminders = async () => {
    try {
      // Query compliance_cochildminders using polymorphic reference
      const query = supabase
        .from("compliance_cochildminders")
        .select("*")
        .order("first_name");

      if (parentType === 'application') {
        query.eq("application_id", parentId);
      } else {
        query.eq("employee_id", parentId);
      }

      const { data: cochildmindersData, error: cochildmindersError } = await query;
      if (cochildmindersError) throw cochildmindersError;

      // Query cochildminder_applications for submitted forms, ordered by most recent first
      const formsQuery = supabase
        .from("cochildminder_applications")
        .select("*")
        .eq("status", "submitted")
        .order("submitted_at", { ascending: false });

      if (parentType === 'application') {
        formsQuery.eq("application_id", parentId);
      } else {
        formsQuery.eq("employee_id", parentId);
      }

      const { data: formsData, error: formsError } = await formsQuery;
      if (formsError) throw formsError;

      // Build map keeping only the most recent form for each cochildminder
      const formsMap = new Map<string, CochildminderFormData>();
      formsData?.forEach((form) => {
        // Only add if not already in Map (keeps the first/most recent one due to ordering)
        if (!formsMap.has(form.cochildminder_id)) {
          formsMap.set(form.cochildminder_id, form as CochildminderFormData);
        }
      });

      setCochildminders(cochildmindersData || []);
      setForms(formsMap);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load co-childminders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTrafficLightStatus = (cochildminder: Cochildminder): "compliant" | "pending" | "critical" | "not_applicable" => {
    if (cochildminder.dbs_status === "received" && cochildminder.dbs_certificate_expiry_date) {
      const daysUntilExpiry = differenceInDays(new Date(cochildminder.dbs_certificate_expiry_date), new Date());
      if (daysUntilExpiry < 0) return "critical"; // Expired
      if (daysUntilExpiry < 30) return "pending"; // Expiring soon
      return "compliant";
    }

    if (cochildminder.dbs_status === "requested") return "pending";

    return "critical";
  };

  const getFormStatus = (cochildminder: Cochildminder, hasForm: boolean): "compliant" | "pending" | "critical" => {
    if (hasForm) return "compliant";
    if (cochildminder.form_status === "sent" || cochildminder.form_token) return "pending";
    return "critical";
  };

  const getDBSStatus = (cochildminder: Cochildminder): "compliant" | "pending" | "critical" => {
    if (cochildminder.dbs_status === "received" && cochildminder.dbs_certificate_expiry_date) {
      const daysUntilExpiry = differenceInDays(new Date(cochildminder.dbs_certificate_expiry_date), new Date());
      if (daysUntilExpiry < 0) return "critical";
      if (daysUntilExpiry < 30) return "pending";
      return "compliant";
    }
    if (cochildminder.dbs_status === "requested") return "pending";
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

  const handleDownloadPDF = async (cochildminder: Cochildminder) => {
    const form = forms.get(cochildminder.id);
    if (!form) {
      toast({ title: "Error", description: "Form not found", variant: "destructive" });
      return;
    }

    try {
      const blob = await pdf(
        <CochildminderFormPDF
          formData={form}
          cochildminderName={`${cochildminder.first_name} ${cochildminder.last_name}`}
          applicantName={parentName}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cochildminder-form-${cochildminder.first_name}-${cochildminder.last_name}.pdf`;
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

    cochildminders.forEach((cochildminder) => {
      const status = getTrafficLightStatus(cochildminder);
      if (status === "compliant") compliant++;
      else if (status === "pending") pending++;
      else if (status === "critical") critical++;
    });

    return { compliant, pending, critical };
  };

  const counts = getStatusCounts();

  const handleDeleteCochildminder = async () => {
    if (!selectedCochildminder) return;

    try {
      const { error } = await supabase
        .from("compliance_cochildminders")
        .delete()
        .eq("id", selectedCochildminder.id);

      if (error) throw error;

      toast({
        title: "Co-childminder Deleted",
        description: `${selectedCochildminder.first_name} ${selectedCochildminder.last_name} has been removed.`,
      });

      loadCochildminders();
      setShowDeleteDialog(false);
      setSelectedCochildminder(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete co-childminder",
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
              <h2 className="text-lg font-semibold tracking-tight mb-1 flex items-center gap-2">
                <Users className="h-5 w-5 text-amber-600" />
                Co-childminders
              </h2>
              <p className="text-sm text-muted-foreground">
                {cochildminders.length} co-childminder{cochildminders.length !== 1 ? "s" : ""}
              </p>
            </div>
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
          {cochildminders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No co-childminders found.
            </div>
          ) : (
            cochildminders.map((cochildminder) => {
              const status = getTrafficLightStatus(cochildminder);
              const hasForm = forms.has(cochildminder.id);

              return (
                <div key={cochildminder.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <TrafficLightIndicator status={status} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{cochildminder.first_name} {cochildminder.last_name}</span>
                          {getStatusBadge(status)}
                        </div>
                        <DualTrafficLightIndicator 
                          formStatus={getFormStatus(cochildminder, hasForm)}
                          dbsStatus={getDBSStatus(cochildminder)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border space-y-2 text-sm">
                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <span className="text-muted-foreground">Email:</span> {cochildminder.email || "Not provided"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Phone:</span> {cochildminder.phone || "Not provided"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">DOB:</span> {format(new Date(cochildminder.date_of_birth), "dd/MM/yyyy")}
                      </div>
                      <div>
                        <span className="text-muted-foreground">DBS Status:</span> {cochildminder.dbs_status.replace("_", " ")}
                      </div>
                      {cochildminder.dbs_certificate_number && (
                        <div>
                          <span className="text-muted-foreground">Certificate:</span> {cochildminder.dbs_certificate_number}
                        </div>
                      )}
                    </div>
                    {cochildminder.notes && (
                      <div className="mt-2 p-2 bg-muted rounded text-xs">
                        <span className="font-medium">Notes:</span> {cochildminder.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {parentType === 'employee' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 text-destructive hover:text-destructive"
                        onClick={() => {
                          setSelectedCochildminder(cochildminder);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    )}
                    
                    {/* Form Button - shows Send Form or Download PDF with dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          {hasForm ? (
                            <><Download className="h-4 w-4" /> Download PDF</>
                          ) : (
                            <><Mail className="h-4 w-4" /> Send Form</>
                          )}
                          <ChevronDown className="h-3 w-3 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="bg-popover">
                        {hasForm ? (
                          <>
                            <DropdownMenuItem onClick={() => handleDownloadPDF(cochildminder)}>
                              <Download className="h-4 w-4 mr-2" /> Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedCochildminder(cochildminder);
                              setShowSendFormModal(true);
                            }}>
                              <Mail className="h-4 w-4 mr-2" /> Resend Form
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <DropdownMenuItem onClick={() => {
                            setSelectedCochildminder(cochildminder);
                            setShowSendFormModal(true);
                          }}>
                            <Mail className="h-4 w-4 mr-2" /> Send Form
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* DBS Button */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          <FileCheck className="h-4 w-4" />
                          DBS
                          <ChevronDown className="h-3 w-3 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="bg-popover">
                        <DropdownMenuItem onClick={() => {
                          setSelectedCochildminder(cochildminder);
                          setShowDBSModal(true);
                        }}>
                          <Mail className="h-4 w-4 mr-2" /> Request DBS
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedCochildminder(cochildminder);
                          setShowCertModal(true);
                        }}>
                          <FileCheck className="h-4 w-4 mr-2" /> Record Certificate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </AppleCard>

      {/* Modals */}
      <UnifiedSendCochildminderFormModal
        open={showSendFormModal}
        onOpenChange={setShowSendFormModal}
        cochildminder={selectedCochildminder}
        parentEmail={parentEmail}
        parentName={parentName}
        parentId={parentId}
        parentType={parentType}
        onSuccess={loadCochildminders}
      />

      {selectedCochildminder && (
        <>
          <UnifiedRequestCochildminderDBSModal
            open={showDBSModal}
            onOpenChange={setShowDBSModal}
            cochildminderId={selectedCochildminder.id}
            cochildminderName={`${selectedCochildminder.first_name} ${selectedCochildminder.last_name}`}
            cochildminderEmail={selectedCochildminder.email || ""}
            parentEmail={parentEmail}
            onSuccess={loadCochildminders}
          />

          <UnifiedRecordCochildminderCertificateModal
            open={showCertModal}
            onOpenChange={setShowCertModal}
            cochildminder={selectedCochildminder}
            onSuccess={loadCochildminders}
          />
        </>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Co-childminder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCochildminder?.first_name} {selectedCochildminder?.last_name}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCochildminder}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
