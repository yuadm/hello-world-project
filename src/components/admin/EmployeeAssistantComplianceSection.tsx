import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Send, Download, FileText, Trash2, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { pdf } from "@react-pdf/renderer";
import { AddEditEmployeeAssistantModal } from "./AddEditEmployeeAssistantModal";
import { SendEmployeeAssistantFormModal } from "./SendEmployeeAssistantFormModal";
import { RequestEmployeeAssistantDBSModal } from "./RequestEmployeeAssistantDBSModal";
import { RecordEmployeeAssistantCertificateModal } from "./RecordEmployeeAssistantCertificateModal";
import { AssistantFormPDF } from "./AssistantFormPDF";
import { getDBSStatusConfig } from "@/lib/employeeHelpers";
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

interface EmployeeAssistant {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  role: string;
  date_of_birth: string;
  dbs_status: string;
  dbs_certificate_number: string | null;
  dbs_certificate_date: string | null;
  dbs_certificate_expiry_date: string | null;
  form_token: string | null;
  form_status: string | null;
  form_sent_date: string | null;
  form_submitted_date: string | null;
  compliance_status: string | null;
  risk_level: string | null;
  notes: string | null;
  reminder_count: number;
  last_reminder_date: string | null;
}

interface EmployeeAssistantComplianceSectionProps {
  employeeId: string;
  employeeEmail: string;
  employeeName: string;
}

export const EmployeeAssistantComplianceSection = ({
  employeeId,
  employeeEmail,
  employeeName,
}: EmployeeAssistantComplianceSectionProps) => {
  const { toast } = useToast();
  const [assistants, setAssistants] = useState<EmployeeAssistant[]>([]);
  const [loading, setLoading] = useState(true);
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [sendFormModalOpen, setSendFormModalOpen] = useState(false);
  const [requestDBSModalOpen, setRequestDBSModalOpen] = useState(false);
  const [recordCertificateModalOpen, setRecordCertificateModalOpen] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<EmployeeAssistant | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assistantToDelete, setAssistantToDelete] = useState<EmployeeAssistant | null>(null);

  const fetchAssistants = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_assistants' as any)
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAssistants((data || []) as unknown as EmployeeAssistant[]);
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

  useEffect(() => {
    fetchAssistants();
  }, [employeeId]);

  const handleAddAssistant = () => {
    setSelectedAssistant(null);
    setAddEditModalOpen(true);
  };

  const handleEditAssistant = (assistant: EmployeeAssistant) => {
    setSelectedAssistant(assistant);
    setAddEditModalOpen(true);
  };

  const handleDeleteClick = (assistant: EmployeeAssistant) => {
    setAssistantToDelete(assistant);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!assistantToDelete) return;

    try {
      const { error } = await supabase
        .from('employee_assistants' as any)
        .delete()
        .eq('id', assistantToDelete.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Assistant deleted successfully",
      });
      
      fetchAssistants();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete assistant",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setAssistantToDelete(null);
    }
  };

  const handleSendForm = (assistant: EmployeeAssistant) => {
    setSelectedAssistant(assistant);
    setSendFormModalOpen(true);
  };

  const handleRequestDBS = (assistant: EmployeeAssistant) => {
    setSelectedAssistant(assistant);
    setRequestDBSModalOpen(true);
  };

  const handleRecordCertificate = (assistant: EmployeeAssistant) => {
    setSelectedAssistant(assistant);
    setRecordCertificateModalOpen(true);
  };

  const handleDownloadPDF = async (assistant: EmployeeAssistant) => {
    if (!assistant.form_token) return;

    try {
      const { data: formData, error } = await supabase
        .from("employee_assistant_forms")
        .select("*")
        .eq("employee_assistant_id", assistant.id)
        .eq("status", "submitted")
        .maybeSingle();

      if (error) throw error;
      
      if (!formData) {
        toast({
          title: "Error",
          description: "No completed form found",
          variant: "destructive",
        });
        return;
      }

      // Transform address and employment data for PDF component
      const currentAddress = formData.current_address as any;
      const addressHistory = formData.address_history as any;
      const employmentHistory = formData.employment_history as any;
      
      const transformedFormData = {
        ...formData,
        current_address: currentAddress ? {
          line1: currentAddress.address_line_1,
          line2: currentAddress.address_line_2,
          town: currentAddress.town,
          postcode: currentAddress.postcode,
          moveIn: currentAddress.move_in_date,
        } : null,
        address_history: addressHistory && Array.isArray(addressHistory) ? addressHistory : [],
        employment_history: employmentHistory && Array.isArray(employmentHistory)
          ? employmentHistory.map((job: any) => ({
              employer: job.employer,
              position: job.title, // PDF expects 'position' but DB has 'title'
              startDate: job.startDate,
              endDate: job.endDate,
              isCurrent: job.isCurrent,
            }))
          : [],
      };

      // Generate PDF client-side
      const blob = await pdf(
        <AssistantFormPDF
          formData={transformedFormData}
          assistantName={`${assistant.first_name} ${assistant.last_name}`}
          assistantRole={assistant.role}
          applicantName={employeeName}
        />
      ).toBlob();

      // Download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `assistant-form-${assistant.first_name}-${assistant.last_name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "PDF downloaded successfully",
      });
    } catch (error: any) {
      console.error("PDF download error:", error);
      toast({
        title: "Error",
        description: "Failed to download PDF",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className="rounded-2xl border-0 shadow-apple-sm">
        <CardHeader>
          <div className="h-7 w-64 bg-muted rounded-lg animate-shimmer" />
          <div className="h-5 w-96 bg-muted rounded-lg animate-shimmer mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-xl animate-shimmer" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="rounded-2xl border-0 shadow-apple-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold tracking-tight">
                Assistant & Co-childminder Compliance
              </CardTitle>
              <CardDescription>
                Manage assistants and co-childminders for {employeeName}
              </CardDescription>
            </div>
            <Button onClick={handleAddAssistant} className="rounded-xl">
              <Plus className="h-4 w-4 mr-2" />
              Add Assistant
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {assistants.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-1">No assistants added</p>
              <p className="text-sm">Click "Add Assistant" to get started</p>
            </div>
          ) : (
            assistants.map((assistant) => (
              <Card key={assistant.id} className="rounded-xl border shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {assistant.first_name} {assistant.last_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{assistant.role}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={getDBSStatusConfig(assistant.dbs_status as any).variant}
                        className="rounded-full"
                      >
                        {getDBSStatusConfig(assistant.dbs_status as any).label}
                      </Badge>
                      {assistant.form_submitted_date && (
                        <Badge variant="outline" className="rounded-full bg-green-50 text-green-700 border-green-200">
                          Form Completed
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <p className="font-medium">{assistant.email || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phone:</span>
                      <p className="font-medium">{assistant.phone || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Date of Birth:</span>
                      <p className="font-medium">
                        {assistant.date_of_birth 
                          ? format(new Date(assistant.date_of_birth), "MMM dd, yyyy")
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Form Status:</span>
                      <p className="font-medium">
                        {assistant.form_submitted_date 
                          ? "Completed" 
                          : assistant.form_sent_date 
                          ? "Sent" 
                          : "Not Sent"}
                      </p>
                    </div>
                  </div>

                  {assistant.form_sent_date && (
                    <div className="text-sm mb-4 p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          {assistant.reminder_count} sent, Last: {format(new Date(assistant.last_reminder_date || assistant.form_sent_date), "d'd ago'")}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendForm(assistant)}
                      className="rounded-lg"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {assistant.form_sent_date ? "Resend" : "Send Form"}
                    </Button>

                    {assistant.form_submitted_date && assistant.form_token && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPDF(assistant)}
                        className="rounded-lg"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Form
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRequestDBS(assistant)}
                      className="rounded-lg"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {assistant.dbs_status === 'not_requested' ? 'Request DBS' : 'Resend DBS Request'}
                    </Button>

                    {assistant.dbs_status !== 'not_requested' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRecordCertificate(assistant)}
                        className="rounded-lg"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Record Certificate
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditAssistant(assistant)}
                      className="rounded-lg"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(assistant)}
                      className="rounded-lg text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      <AddEditEmployeeAssistantModal
        open={addEditModalOpen}
        onOpenChange={setAddEditModalOpen}
        employeeId={employeeId}
        employeeEmail={employeeEmail}
        employeeName={employeeName}
        assistant={selectedAssistant}
        onSuccess={fetchAssistants}
      />

      <SendEmployeeAssistantFormModal
        open={sendFormModalOpen}
        onOpenChange={setSendFormModalOpen}
        assistant={selectedAssistant}
        employeeEmail={employeeEmail}
        employeeName={employeeName}
        onSuccess={fetchAssistants}
      />

      <RequestEmployeeAssistantDBSModal
        open={requestDBSModalOpen}
        onOpenChange={setRequestDBSModalOpen}
        assistant={selectedAssistant}
        onSuccess={fetchAssistants}
      />

      <RecordEmployeeAssistantCertificateModal
        open={recordCertificateModalOpen}
        onOpenChange={setRecordCertificateModalOpen}
        assistant={selectedAssistant}
        onSuccess={fetchAssistants}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assistant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {assistantToDelete?.first_name} {assistantToDelete?.last_name}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="rounded-xl bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};