import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Download, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SendAssistantFormModal } from "./SendAssistantFormModal";
import { RequestAssistantDBSModal } from "./RequestAssistantDBSModal";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { AssistantFormPDF } from "./AssistantFormPDF";

interface AssistantComplianceSectionProps {
  applicationId: string;
  applicantEmail: string;
  applicantName: string;
}

export const AssistantComplianceSection = ({ applicationId, applicantEmail, applicantName }: AssistantComplianceSectionProps) => {
  const [assistants, setAssistants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showSendFormModal, setShowSendFormModal] = useState(false);
  const [showDBSRequestModal, setShowDBSRequestModal] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<any>(null);
  const [assistantForms, setAssistantForms] = useState<Record<string, any>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadAssistants();
    autoSyncAssistants();
  }, [applicationId]);

  const loadAssistants = async () => {
    try {
      const { data, error } = await supabase
        .from('assistant_dbs_tracking')
        .select('*')
        .eq('application_id', applicationId)
        .order('first_name');

      if (error) throw error;
      setAssistants(data || []);

      // Load submitted forms for assistants
      if (data) {
        const assistantIds = data.map(a => a.id);
        const { data: forms } = await supabase
          .from('assistant_forms')
          .select('*')
          .in('assistant_id', assistantIds)
          .eq('status', 'submitted');

        if (forms) {
          const formsMap: Record<string, any> = {};
          forms.forEach(form => {
            formsMap[form.assistant_id] = form;
          });
          setAssistantForms(formsMap);
        }
      }
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to load assistant data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const autoSyncAssistants = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('sync-assistants', {
        body: { applicationId },
      });
      if (!error && data.total > 0) loadAssistants();
    } catch (error) {
      console.error("Auto-sync failed:", error);
    }
  };

  const syncAssistants = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-assistants', {
        body: { applicationId },
      });
      if (error) throw error;
      toast({ title: "Sync Complete", description: `Synced ${data.total} assistants` });
      loadAssistants();
    } catch (error: any) {
      toast({ title: "Sync Failed", description: error.message, variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  const handleSendForm = (assistant: any) => {
    setSelectedAssistant(assistant);
    setShowSendFormModal(true);
  };

  const handleRequestDBS = (assistant: any) => {
    setSelectedAssistant(assistant);
    setShowDBSRequestModal(true);
  };

  if (loading) return <div className="text-center py-8">Loading assistant data...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-muted/30 p-4 rounded-lg border flex justify-between items-center">
        <div>
          <h3 className="font-semibold">Assistant & Co-childminder Compliance</h3>
          <p className="text-sm text-muted-foreground">Manage CMA-A1 forms for assistants and co-childminders</p>
        </div>
        <Button onClick={syncAssistants} disabled={syncing} variant="outline" size="sm">
          {syncing ? "Syncing..." : "Sync from Application"}
        </Button>
      </div>

      {assistants.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No assistants or co-childminders found in this application
        </div>
      ) : (
        <div className="space-y-4">
          {assistants.map((assistant) => {
            const hasSubmittedForm = assistantForms[assistant.id];
            return (
              <div key={assistant.id} className="border rounded-lg p-4 bg-card">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{assistant.first_name} {assistant.last_name}</h4>
                    <p className="text-sm text-muted-foreground">{assistant.role}</p>
                    <p className="text-sm text-muted-foreground">{assistant.email}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={assistant.form_status === 'submitted' ? 'default' : 'secondary'}>
                        Form: {assistant.form_status}
                      </Badge>
                      <Badge variant={assistant.dbs_status === 'received' ? 'default' : 'secondary'}>
                        DBS: {assistant.dbs_status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleSendForm(assistant)} size="sm" variant="outline">
                      <Mail className="h-4 w-4 mr-2" />
                      {assistant.form_status === 'sent' ? 'Resend Form' : 'Send Form'}
                    </Button>
                    
                    {hasSubmittedForm && (
                      <PDFDownloadLink
                        document={
                          <AssistantFormPDF
                            formData={hasSubmittedForm}
                            assistantName={`${assistant.first_name} ${assistant.last_name}`}
                            assistantRole={assistant.role}
                            applicantName={applicantName}
                          />
                        }
                        fileName={`CMA-A1_${assistant.first_name}_${assistant.last_name}.pdf`}
                      >
                        {({ loading }) => (
                          <Button size="sm" variant="outline" disabled={loading}>
                            <Download className="h-4 w-4 mr-2" />
                            {loading ? 'Generating...' : 'Download PDF'}
                          </Button>
                        )}
                      </PDFDownloadLink>
                    )}

                    <Button 
                      onClick={() => handleRequestDBS(assistant)} 
                      size="sm"
                      disabled={assistant.dbs_status === 'received'}
                    >
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Request DBS
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showSendFormModal && selectedAssistant && (
        <SendAssistantFormModal
          assistant={selectedAssistant}
          applicantEmail={applicantEmail}
          applicantName={applicantName}
          onClose={() => {
            setShowSendFormModal(false);
            setSelectedAssistant(null);
          }}
          onSuccess={() => {
            loadAssistants();
            setShowSendFormModal(false);
            setSelectedAssistant(null);
          }}
        />
      )}

      {showDBSRequestModal && selectedAssistant && (
        <RequestAssistantDBSModal
          open={showDBSRequestModal}
          onOpenChange={setShowDBSRequestModal}
          assistantId={selectedAssistant.id}
          assistantName={`${selectedAssistant.first_name} ${selectedAssistant.last_name}`}
          assistantEmail={selectedAssistant.email}
          applicantEmail={applicantEmail}
          onSuccess={() => {
            loadAssistants();
            setShowDBSRequestModal(false);
            setSelectedAssistant(null);
          }}
        />
      )}
    </div>
  );
};
