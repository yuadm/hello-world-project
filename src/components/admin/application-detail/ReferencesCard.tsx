import { AppleCard } from "@/components/admin/AppleCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Mail, CheckCircle2, Send, Download, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SendReferenceRequestModal } from "@/components/admin/SendReferenceRequestModal";
import { ReferencePDF } from "@/components/admin/ReferencePDF";
import { pdf } from "@react-pdf/renderer";
import { toast } from "sonner";

interface ReferencesCardProps {
  applicationId?: string;
  employeeId?: string;
  applicantName: string;
  reference1Name: string;
  reference1Relationship: string;
  reference1Contact: string;
  reference1Childcare?: string;
  reference2Name: string;
  reference2Relationship: string;
  reference2Contact: string;
  reference2Childcare?: string;
  childVolunteered?: string;
  childVolunteeredConsent?: boolean;
}

export const ReferencesCard = ({
  applicationId,
  employeeId,
  applicantName,
  reference1Name,
  reference1Relationship,
  reference1Contact,
  reference1Childcare,
  reference2Name,
  reference2Relationship,
  reference2Contact,
  reference2Childcare,
  childVolunteered,
  childVolunteeredConsent,
}: ReferencesCardProps) => {
  const [referenceRequests, setReferenceRequests] = useState<any[]>([]);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [selectedReference, setSelectedReference] = useState<{
    number: number;
    name: string;
    relationship: string;
    contact: string;
    isChildcare: boolean;
  } | null>(null);

  useEffect(() => {
    loadReferenceRequests();
  }, [applicationId, employeeId]);

  const loadReferenceRequests = async () => {
    if (!applicationId && !employeeId) return;

    const query = supabase
      .from("reference_requests")
      .select("*");

    if (applicationId) {
      query.eq("application_id", applicationId);
    } else if (employeeId) {
      query.eq("employee_id", employeeId);
    }

    const { data, error } = await query;

    if (!error && data) {
      setReferenceRequests(data);
    }
  };

  const getRequestForReference = (refNumber: number) => {
    return referenceRequests.find(r => r.reference_number === refNumber);
  };

  const handleSendRequest = (
    refNumber: number,
    name: string,
    relationship: string,
    contact: string,
    isChildcare: boolean
  ) => {
    setSelectedReference({
      number: refNumber,
      name,
      relationship,
      contact,
      isChildcare,
    });
    setSendModalOpen(true);
  };

  const handleDownloadPDF = async (request: any, refNumber: number, refName: string) => {
    try {
      const responseData = request.response_data;
      const pdfDoc = (
        <ReferencePDF
          referenceData={responseData}
          refereeName={refName}
          refereeRelationship={request.referee_relationship}
          applicantName={applicantName}
          isChildcareReference={request.is_childcare_reference || false}
          submittedDate={request.response_received_date}
        />
      );

      const blob = await pdf(pdfDoc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `reference-${refNumber}-${refName.replace(/\s+/g, "-")}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  };
  const ReferenceItem = ({ 
    refNumber, 
    name, 
    relationship, 
    contact, 
    isChildcare 
  }: { 
    refNumber: number;
    name: string; 
    relationship: string; 
    contact: string; 
    isChildcare?: string;
  }) => {
    const request = getRequestForReference(refNumber);

    return (
      <div className="rounded-lg bg-muted/30 p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="font-medium">{name || "N/A"}</div>
          <div className="flex items-center gap-2">
            {isChildcare === "Yes" && (
              <Badge variant="secondary" className="text-xs">Childcare Ref</Badge>
            )}
            {request && (
              <Badge 
                variant={request.request_status === "completed" ? "default" : "outline"}
                className="text-xs"
              >
                {request.request_status === "completed" ? "Received" : "Sent"}
              </Badge>
            )}
          </div>
        </div>
        <div className="space-y-2 text-xs text-muted-foreground">
          <div>Relationship: {relationship || "N/A"}</div>
          <div className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {contact || "N/A"}
          </div>
          {request?.request_sent_date && (
            <div className="text-xs">
              Sent: {new Date(request.request_sent_date).toLocaleDateString()}
            </div>
          )}
          {request?.response_received_date && (
            <div className="text-xs text-green-600">
              Received: {new Date(request.response_received_date).toLocaleDateString()}
            </div>
          )}
        </div>
        
        {!request && (
          <Button
            size="sm"
            variant="outline"
            className="w-full mt-3 gap-2"
            onClick={() => handleSendRequest(
              refNumber,
              name,
              relationship,
              contact,
              isChildcare === "Yes"
            )}
          >
            <Send className="h-3 w-3" />
            Request Reference
          </Button>
        )}
        
        {request && request.request_status === "sent" && (
          <Button
            size="sm"
            variant="outline"
            className="w-full mt-3 gap-2"
            onClick={() => handleSendRequest(
              refNumber,
              name,
              relationship,
              contact,
              isChildcare === "Yes"
            )}
          >
            <RefreshCw className="h-3 w-3" />
            Resend Request
          </Button>
        )}
        
        {request && request.request_status === "completed" && (
          <Button
            size="sm"
            variant="secondary"
            className="w-full mt-3 gap-2"
            onClick={() => handleDownloadPDF(request, refNumber, name)}
          >
            <Download className="h-3 w-3" />
            Download PDF
          </Button>
        )}
      </div>
    );
  };

  return (
    <AppleCard className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold tracking-tight">References</h3>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2">Reference 1</div>
          <ReferenceItem
            refNumber={1}
            name={reference1Name}
            relationship={reference1Relationship}
            contact={reference1Contact}
            isChildcare={reference1Childcare}
          />
        </div>

        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2">Reference 2</div>
          <ReferenceItem
            refNumber={2}
            name={reference2Name}
            relationship={reference2Relationship}
            contact={reference2Contact}
            isChildcare={reference2Childcare}
          />
        </div>

        {childVolunteered === "Yes" && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 rounded-lg bg-muted/30 p-3">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <div>
                <div className="text-sm font-medium">Volunteered with Children</div>
                {childVolunteeredConsent && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Consent given for reference contact
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedReference && (
        <SendReferenceRequestModal
          open={sendModalOpen}
          onOpenChange={setSendModalOpen}
          applicationId={applicationId}
          employeeId={employeeId}
          referenceNumber={selectedReference.number}
          refereeName={selectedReference.name}
          refereeRelationship={selectedReference.relationship}
          refereeContact={selectedReference.contact}
          isChildcareReference={selectedReference.isChildcare}
          applicantName={applicantName}
          onSuccess={loadReferenceRequests}
        />
      )}
    </AppleCard>
  );
};
