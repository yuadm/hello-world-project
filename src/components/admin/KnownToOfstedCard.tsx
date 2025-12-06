import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppleCard } from "./AppleCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Mail,
  Calendar,
  User,
  Building2,
  Download,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { SendOfstedFormModal } from "./SendOfstedFormModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { pdf } from "@react-pdf/renderer";
import { OfstedResponsePDF } from "./OfstedResponsePDF";

interface ResponseData {
  recordsStatus: string[];
  checkCompletedDate: string;
  sectionC?: {
    uniqueRefNumber: string;
    otherNames: string;
    addressKnown: string;
    dateOfRegistration: string;
    registeredBodyName: string;
    registrationStatus: string;
    lastInspection: string;
    provisionType: string;
    registers: string;
    telephone: string;
    emailAddress: string;
    provisionAddress: string;
    childrenInfo: string;
    conditions: string;
    suitabilityInfo: string;
    inspectionInfo: string;
    safeguardingConcerns: string;
  } | null;
  sectionD?: {
    otherNamesD: string;
    capacityKnown: string;
    relevantInfo: string;
  } | null;
}

interface RequestData {
  currentAddress?: {
    line1: string;
    line2?: string;
    town: string;
    postcode: string;
    moveInDate: string;
  };
  previousAddresses?: Array<{
    address: string;
    dateFrom: string;
    dateTo: string;
  }>;
  previousNames?: Array<{
    name: string;
    dateFrom: string;
    dateTo: string;
  }>;
  agencyName?: string;
  requesterName?: string;
  requesterRole?: string;
  role?: string;
}

interface OfstedSubmission {
  id: string;
  reference_id: string;
  applicant_name: string;
  ofsted_email: string;
  status: string;
  sent_at: string;
  completed_at: string | null;
  role: string;
  response_data: ResponseData | null;
  date_of_birth: string | null;
  request_data: RequestData | null;
}

interface KnownToOfstedCardProps {
  parentId: string;
  parentType: "application" | "employee";
  applicantName: string;
  dateOfBirth: string;
  currentAddress: {
    line1: string;
    line2?: string;
    town: string;
    postcode: string;
    moveInDate: string;
  };
  previousAddresses?: Array<{
    address: string;
    dateFrom: string;
    dateTo: string;
  }>;
  previousNames?: Array<{
    name: string;
    dateFrom: string;
    dateTo: string;
  }>;
  role?: 'childminder' | 'household_member' | 'assistant' | 'manager' | 'nominated_individual';
}

export const KnownToOfstedCard = ({
  parentId,
  parentType,
  applicantName,
  dateOfBirth,
  currentAddress,
  previousAddresses,
  previousNames,
  role = 'childminder',
}: KnownToOfstedCardProps) => {
  const [submissions, setSubmissions] = useState<OfstedSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<OfstedSubmission | null>(null);
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    try {
      const column = parentType === "application" ? "application_id" : "employee_id";
      const { data, error } = await supabase
        .from("ofsted_form_submissions")
        .select("*")
        .eq(column, parentId)
        .order("sent_at", { ascending: false });

      if (error) throw error;
      setSubmissions((data as unknown as OfstedSubmission[]) || []);
    } catch (error) {
      console.error("Error fetching Ofsted submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [parentId, parentType]);

  const handleDownloadPDF = async (submission: OfstedSubmission) => {
    if (!submission.response_data || !submission.completed_at) return;
    
    setDownloadingPdf(submission.id);
    try {
      const blob = await pdf(
        <OfstedResponsePDF
          referenceId={submission.reference_id}
          applicantName={submission.applicant_name}
          dateOfBirth={submission.date_of_birth || ""}
          ofstedEmail={submission.ofsted_email}
          sentAt={submission.sent_at}
          completedAt={submission.completed_at}
          responseData={submission.response_data}
          requestData={submission.request_data || undefined}
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ofsted-response-${submission.reference_id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setDownloadingPdf(null);
    }
  };

  const handleViewResponse = (submission: OfstedSubmission) => {
    setSelectedSubmission(submission);
    setShowResponseDialog(true);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "notKnown":
        return "Not known to Ofsted";
      case "currentProvider":
        return "Currently known as registered provider";
      case "formerOrOther":
        return "Known as former/other capacity";
      default:
        return status;
    }
  };

  const pendingCount = submissions.filter(s => s.status === "pending").length;
  const completedCount = submissions.filter(s => s.status === "completed").length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            {status}
          </Badge>
        );
    }
  };

  const roleLabels: Record<string, string> = {
    childminder: 'Childminder',
    household_member: 'Household Member',
    assistant: 'Assistant',
    manager: 'Manager',
    nominated_individual: 'Nominated Individual',
  };


  return (
    <>
      <AppleCard className="col-span-1 md:col-span-2 lg:col-span-1">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#1B9AAA]/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-[#1B9AAA]" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Known to Ofsted</h3>
                <p className="text-sm text-muted-foreground">Regulatory checks</p>
              </div>
            </div>
            <Button 
              size="sm" 
              className="gap-2 bg-[#1B9AAA] hover:bg-[#168292]"
              onClick={() => setShowModal(true)}
            >
              <Send className="h-4 w-4" />
              New Request
            </Button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-muted/50 p-4 text-center">
              <div className="text-2xl font-bold">{submissions.length}</div>
              <div className="text-xs text-muted-foreground">Total Requests</div>
            </div>
            <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 p-4 text-center">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingCount}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
            <div className="rounded-xl bg-green-50 dark:bg-green-900/20 p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{completedCount}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
          </div>

          {/* Recent Submissions */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Recent Requests</h4>
            
            {loading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-8 bg-muted/30 rounded-xl">
                <FileText className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">No Ofsted checks sent yet</p>
                <Button 
                  variant="link" 
                  className="text-[#1B9AAA] mt-2"
                  onClick={() => setShowModal(true)}
                >
                  Send your first request
                </Button>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {submissions.slice(0, 5).map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">
                            {submission.reference_id}
                          </span>
                          {getStatusBadge(submission.status)}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {submission.ofsted_email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(submission.sent_at), "dd MMM yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {submission.status === "completed" && submission.response_data && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleViewResponse(submission)}
                            title="View Response"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDownloadPDF(submission)}
                            disabled={downloadingPdf === submission.id}
                            title="Download PDF"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-100 dark:border-blue-800">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100">About Known to Ofsted Checks</p>
                <p className="text-blue-700 dark:text-blue-300 mt-1">
                  Under the Childcare Act 2006, agencies must contact Ofsted when assessing an applicant&apos;s 
                  suitability for registration. Ofsted will confirm if the individual is known to them.
                </p>
              </div>
            </div>
          </div>
        </div>
      </AppleCard>

      <SendOfstedFormModal
        open={showModal}
        onOpenChange={setShowModal}
        applicantName={applicantName}
        dateOfBirth={dateOfBirth}
        currentAddress={currentAddress}
        previousAddresses={previousAddresses}
        previousNames={previousNames}
        role={role}
        parentId={parentId}
        parentType={parentType}
        onSuccess={fetchSubmissions}
      />

      {/* Response View Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#1B9AAA]" />
              Ofsted Response - {selectedSubmission?.reference_id}
            </DialogTitle>
          </DialogHeader>
          
          {selectedSubmission?.response_data && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-3">Ofsted Findings</h4>
                <div className="space-y-2">
                  {selectedSubmission.response_data.recordsStatus.map((status, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{getStatusLabel(status)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  Check completed: {format(new Date(selectedSubmission.response_data.checkCompletedDate), "dd MMMM yyyy")}
                </div>
              </div>

              {/* Section C Details */}
              {selectedSubmission.response_data.sectionC && (
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3 text-amber-700">Section C - Current Registered Provider</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {selectedSubmission.response_data.sectionC.uniqueRefNumber && (
                      <div>
                        <span className="text-muted-foreground">Unique Reference:</span>
                        <p className="font-medium">{selectedSubmission.response_data.sectionC.uniqueRefNumber}</p>
                      </div>
                    )}
                    {selectedSubmission.response_data.sectionC.registrationStatus && (
                      <div>
                        <span className="text-muted-foreground">Registration Status:</span>
                        <p className="font-medium">{selectedSubmission.response_data.sectionC.registrationStatus}</p>
                      </div>
                    )}
                    {selectedSubmission.response_data.sectionC.provisionType && (
                      <div>
                        <span className="text-muted-foreground">Provision Type:</span>
                        <p className="font-medium">{selectedSubmission.response_data.sectionC.provisionType}</p>
                      </div>
                    )}
                    {selectedSubmission.response_data.sectionC.lastInspection && (
                      <div>
                        <span className="text-muted-foreground">Last Inspection:</span>
                        <p className="font-medium">{selectedSubmission.response_data.sectionC.lastInspection}</p>
                      </div>
                    )}
                  </div>
                  {selectedSubmission.response_data.sectionC.safeguardingConcerns && (
                    <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                      <span className="text-sm font-medium text-red-700">Safeguarding Concerns:</span>
                      <p className="text-sm mt-1">{selectedSubmission.response_data.sectionC.safeguardingConcerns}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Section D Details */}
              {selectedSubmission.response_data.sectionD && (
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3 text-blue-700">Section D - Former/Other Capacity</h4>
                  <div className="space-y-3 text-sm">
                    {selectedSubmission.response_data.sectionD.capacityKnown && (
                      <div>
                        <span className="text-muted-foreground">Capacity Known:</span>
                        <p className="font-medium">{selectedSubmission.response_data.sectionD.capacityKnown}</p>
                      </div>
                    )}
                    {selectedSubmission.response_data.sectionD.relevantInfo && (
                      <div>
                        <span className="text-muted-foreground">Relevant Information:</span>
                        <p className="font-medium">{selectedSubmission.response_data.sectionD.relevantInfo}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Download Button */}
              <div className="flex justify-end pt-4 border-t">
                <Button 
                  onClick={() => handleDownloadPDF(selectedSubmission)}
                  disabled={downloadingPdf === selectedSubmission.id}
                  className="gap-2 bg-[#1B9AAA] hover:bg-[#168292]"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
