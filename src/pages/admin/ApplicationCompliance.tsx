import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Download, CheckCircle, Clock, AlertTriangle, Send, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { Shimmer } from "@/components/ui/shimmer";
import { AppleCard } from "@/components/admin/AppleCard";
import { format, differenceInYears, addYears, differenceInDays } from "date-fns";
import { pdf } from "@react-pdf/renderer";
import { HouseholdFormPDF } from "@/components/admin/HouseholdFormPDF";
import { AssistantFormPDF } from "@/components/admin/AssistantFormPDF";
import { SendHouseholdFormModal } from "@/components/admin/SendHouseholdFormModal";
import { SendAssistantFormModal } from "@/components/admin/SendAssistantFormModal";
import { RequestDBSModal } from "@/components/admin/RequestDBSModal";
import { RequestAssistantDBSModal } from "@/components/admin/RequestAssistantDBSModal";
import { RecordCertificateModal } from "@/components/admin/RecordCertificateModal";
import { RecordEmployeeAssistantCertificateModal } from "@/components/admin/RecordEmployeeAssistantCertificateModal";

interface DBApplication {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
}

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
  compliance_status: string;
  risk_level: string;
  form_token: string | null;
  notes?: string | null;
  form_data?: any;
}

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
  compliance_status: string;
  risk_level: string;
  form_token: string | null;
  form_status: string | null;
  form_data?: any;
}

const ApplicationCompliance = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dbApplication, setDbApplication] = useState<DBApplication | null>(null);
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([]);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [syncing, setSyncing] = useState(false);
  
  // Modal states
  const [showHouseholdFormModal, setShowHouseholdFormModal] = useState(false);
  const [showAssistantFormModal, setShowAssistantFormModal] = useState(false);
  const [showHouseholdDBSModal, setShowHouseholdDBSModal] = useState(false);
  const [showAssistantDBSModal, setShowAssistantDBSModal] = useState(false);
  const [showHouseholdCertModal, setShowHouseholdCertModal] = useState(false);
  const [showAssistantCertModal, setShowAssistantCertModal] = useState(false);
  const [selectedHouseholdMember, setSelectedHouseholdMember] = useState<HouseholdMember | null>(null);
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);

  useEffect(() => {
    fetchApplication();
    loadHouseholdMembers();
    loadAssistants();
  }, [id]);

  const fetchApplication = async () => {
    try {
      const { data, error } = await supabase
        .from('childminder_applications' as any)
        .select('id, first_name, last_name, email, status')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          title: "Not Found",
          description: "Application not found",
          variant: "destructive",
        });
        navigate('/admin/applications');
        return;
      }

      setDbApplication(data as unknown as DBApplication);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load application",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadHouseholdMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('household_member_dbs_tracking')
        .select(`
          *,
          household_member_forms!household_member_forms_member_id_fkey(*)
        `)
        .eq('application_id', id)
        .order('member_type')
        .order('full_name');

      if (error) throw error;
      
      const membersWithFormData = (data || []).map(member => {
        const forms = member.household_member_forms || [];
        const submittedForm = forms.find((f: any) => f.status === 'submitted');
        const latestForm = submittedForm || (forms.length > 0 ? forms[0] : null);
        
        return {
          ...member,
          form_data: latestForm
        };
      });
      
      setHouseholdMembers(membersWithFormData);
    } catch (error: any) {
      console.error("Failed to load household members:", error);
    }
  };

  const loadAssistants = async () => {
    try {
      const { data, error } = await supabase
        .from('assistant_dbs_tracking')
        .select(`
          *,
          assistant_forms!assistant_forms_assistant_id_fkey(*)
        `)
        .eq('application_id', id)
        .order('first_name');

      if (error) throw error;
      
      const assistantsWithFormData = (data || []).map(assistant => {
        const forms = assistant.assistant_forms || [];
        const submittedForm = forms.find((f: any) => f.status === 'submitted');
        const latestForm = submittedForm || (forms.length > 0 ? forms[0] : null);
        
        return {
          ...assistant,
          form_data: latestForm
        };
      });
      
      setAssistants(assistantsWithFormData);
    } catch (error: any) {
      console.error("Failed to load assistants:", error);
    }
  };

  const syncHouseholdMembers = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-household-members', {
        body: { applicationId: id },
      });

      if (error) throw error;

      toast({
        title: "Synced",
        description: `Synced ${data.total} household members`,
      });

      loadHouseholdMembers();
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

  const syncAssistants = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-assistants', {
        body: { applicationId: id },
      });

      if (error) throw error;

      toast({
        title: "Synced",
        description: `Synced ${data.total} assistants`,
      });

      loadAssistants();
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

  const handleDownloadHouseholdPDF = async (member: HouseholdMember) => {
    if (!member.form_data) {
      toast({
        title: "Error",
        description: "No form data available",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const blob = await pdf(
        <HouseholdFormPDF 
          formData={member.form_data}
          memberName={member.full_name}
          applicantName={dbApplication ? `${dbApplication.first_name} ${dbApplication.last_name}` : ''}
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${member.full_name.replace(/\s+/g, '_')}_Form.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "PDF downloaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  const handleDownloadAssistantPDF = async (assistant: Assistant) => {
    if (!assistant.form_data) {
      toast({
        title: "Error",
        description: "No form data available",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const blob = await pdf(
        <AssistantFormPDF 
          formData={assistant.form_data}
          assistantName={`${assistant.first_name} ${assistant.last_name}`}
          applicantName={dbApplication ? `${dbApplication.first_name} ${dbApplication.last_name}` : ''}
          assistantRole={assistant.role}
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${assistant.first_name}_${assistant.last_name}_Form.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "PDF downloaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: any; icon: any }> = {
      not_requested: { label: "Not Requested", variant: "destructive", icon: AlertTriangle },
      requested: { label: "Requested", variant: "secondary", icon: Mail },
      received: { label: "Received", variant: "default", icon: CheckCircle },
    };
    
    const item = config[status] || config.not_requested;
    const Icon = item.icon;
    
    return (
      <Badge variant={item.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {item.label}
      </Badge>
    );
  };

  const getRiskBadge = (risk: string) => {
    const config: Record<string, { label: string; variant: any }> = {
      critical: { label: "Critical", variant: "destructive" },
      high: { label: "High", variant: "destructive" },
      medium: { label: "Medium", variant: "secondary" },
      low: { label: "Low", variant: "outline" },
    };
    
    const item = config[risk] || config.low;
    return <Badge variant={item.variant}>{item.label}</Badge>;
  };

  const calculateAge = (dob: string) => {
    return differenceInYears(new Date(), new Date(dob));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 space-y-6">
          <Shimmer variant="card" className="h-32" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Shimmer variant="card" className="h-96" />
            <Shimmer variant="card" className="h-96" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!dbApplication) {
    return null;
  }

  const applicantName = `${dbApplication.first_name} ${dbApplication.last_name}`;
  const householdAdults = householdMembers.filter(m => m.member_type === 'adult' || calculateAge(m.date_of_birth) >= 16);
  const householdChildren = householdMembers.filter(m => m.member_type === 'child' && calculateAge(m.date_of_birth) < 16);

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/admin/applications/${id}`)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Application
        </Button>

        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Compliance Management
          </h1>
          <p className="text-muted-foreground mt-1">{applicantName}</p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Household Members Card */}
          <AppleCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold tracking-tight">Household Members</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {householdMembers.length} member{householdMembers.length !== 1 ? 's' : ''}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={syncHouseholdMembers}
                disabled={syncing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                Sync
              </Button>
            </div>

            {householdMembers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm">No household members found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Adults */}
                {householdAdults.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                      Adults ({householdAdults.length})
                    </h4>
                    <div className="space-y-3">
                      {householdAdults.map((member) => (
                        <div key={member.id} className="rounded-lg bg-muted/30 p-4 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium">{member.full_name}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {member.relationship} • Age {calculateAge(member.date_of_birth)}
                              </div>
                            </div>
                            <div className="flex flex-col gap-1 items-end">
                              {getStatusBadge(member.dbs_status)}
                              {getRiskBadge(member.risk_level)}
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedHouseholdMember(member);
                                setShowHouseholdFormModal(true);
                              }}
                            >
                              <Send className="h-3 w-3 mr-1" />
                              Send Form
                            </Button>
                            
                            {member.form_data && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadHouseholdPDF(member)}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download PDF
                              </Button>
                            )}
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedHouseholdMember(member);
                                setShowHouseholdDBSModal(true);
                              }}
                            >
                              <Mail className="h-3 w-3 mr-1" />
                              Request DBS
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedHouseholdMember(member);
                                setShowHouseholdCertModal(true);
                              }}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Record Cert
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Children */}
                {householdChildren.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                      Children ({householdChildren.length})
                    </h4>
                    <div className="space-y-3">
                      {householdChildren.map((member) => (
                        <div key={member.id} className="rounded-lg bg-muted/30 p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm">{member.full_name}</div>
                              <div className="text-xs text-muted-foreground">
                                {member.relationship} • Age {calculateAge(member.date_of_birth)}
                              </div>
                            </div>
                            <Badge variant="outline">Child</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </AppleCard>

          {/* Assistants Card */}
          <AppleCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold tracking-tight">Assistants</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {assistants.length} assistant{assistants.length !== 1 ? 's' : ''}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={syncAssistants}
                disabled={syncing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                Sync
              </Button>
            </div>

            {assistants.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm">No assistants found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assistants.map((assistant) => (
                  <div key={assistant.id} className="rounded-lg bg-muted/30 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">
                          {assistant.first_name} {assistant.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {assistant.role} • Age {calculateAge(assistant.date_of_birth)}
                        </div>
                        {assistant.email && (
                          <div className="text-xs text-muted-foreground">{assistant.email}</div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        {getStatusBadge(assistant.dbs_status)}
                        {getRiskBadge(assistant.risk_level)}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedAssistant(assistant);
                          setShowAssistantFormModal(true);
                        }}
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Send Form
                      </Button>
                      
                      {assistant.form_data && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadAssistantPDF(assistant)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download PDF
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedAssistant(assistant);
                          setShowAssistantDBSModal(true);
                        }}
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        Request DBS
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedAssistant(assistant);
                          setShowAssistantCertModal(true);
                        }}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Record Cert
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AppleCard>
        </div>

        {/* Modals */}
        {selectedHouseholdMember && (
          <>
            <SendHouseholdFormModal
              isOpen={showHouseholdFormModal}
              onClose={() => setShowHouseholdFormModal(false)}
              member={selectedHouseholdMember}
              applicantEmail={dbApplication.email}
              applicantName={applicantName}
              onSuccess={() => {
                loadHouseholdMembers();
                setShowHouseholdFormModal(false);
              }}
            />
            
            <RequestDBSModal
              open={showHouseholdDBSModal}
              onOpenChange={setShowHouseholdDBSModal}
              memberId={selectedHouseholdMember.id}
              memberName={selectedHouseholdMember.full_name}
              applicationId={id!}
              applicantEmail={dbApplication.email}
              applicantName={applicantName}
              originalApplicantEmail={dbApplication.email}
              onSuccess={() => {
                loadHouseholdMembers();
                setShowHouseholdDBSModal(false);
              }}
            />
            
            <RecordCertificateModal
              open={showHouseholdCertModal}
              onOpenChange={setShowHouseholdCertModal}
              member={{
                ...selectedHouseholdMember,
                notes: selectedHouseholdMember.notes || null,
              }}
              onSave={() => {
                loadHouseholdMembers();
                setShowHouseholdCertModal(false);
              }}
            />
          </>
        )}

        {selectedAssistant && (
          <>
            <SendAssistantFormModal
              assistant={selectedAssistant}
              applicantEmail={dbApplication.email}
              applicantName={applicantName}
              onClose={() => setShowAssistantFormModal(false)}
              onSuccess={() => {
                loadAssistants();
                setShowAssistantFormModal(false);
              }}
            />
            
            <RequestAssistantDBSModal
              open={showAssistantDBSModal}
              onOpenChange={setShowAssistantDBSModal}
              assistantId={selectedAssistant.id}
              assistantName={`${selectedAssistant.first_name} ${selectedAssistant.last_name}`}
              assistantEmail={selectedAssistant.email || ''}
              applicantEmail={dbApplication.email}
              onSuccess={() => {
                loadAssistants();
                setShowAssistantDBSModal(false);
              }}
            />
            
            <RecordEmployeeAssistantCertificateModal
              open={showAssistantCertModal}
              onOpenChange={setShowAssistantCertModal}
              assistant={{
                id: selectedAssistant.id,
                first_name: selectedAssistant.first_name,
                last_name: selectedAssistant.last_name,
                dbs_status: selectedAssistant.dbs_status,
                dbs_certificate_number: selectedAssistant.dbs_certificate_number,
                dbs_certificate_date: selectedAssistant.dbs_certificate_date,
              }}
              onSuccess={() => {
                loadAssistants();
                setShowAssistantCertModal(false);
              }}
            />
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default ApplicationCompliance;
