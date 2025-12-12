import { useState } from "react";
import { AppleCard } from "@/components/admin/AppleCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Mail, Phone, Send, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { SendCochildminderFormModal } from "./SendCochildminderFormModal";

interface Cochildminder {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  email: string | null;
  phone: string | null;
  form_status: string | null;
  form_sent_date: string | null;
  form_submitted_date: string | null;
  dbs_status: string | null;
  compliance_status: string | null;
}

interface CochildmindersComplianceCardProps {
  cochildminders: Cochildminder[];
  applicantEmail: string;
  applicantName: string;
  applicationId?: string;
  employeeId?: string;
  onRefresh: () => void;
}

export const CochildmindersComplianceCard = ({
  cochildminders,
  applicantEmail,
  applicantName,
  applicationId,
  employeeId,
  onRefresh,
}: CochildmindersComplianceCardProps) => {
  const [selectedCochildminder, setSelectedCochildminder] = useState<Cochildminder | null>(null);
  const [sendFormModalOpen, setSendFormModalOpen] = useState(false);

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "submitted":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Submitted</Badge>;
      case "sent":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100"><Clock className="h-3 w-3 mr-1" />Form Sent</Badge>;
      case "not_sent":
      default:
        return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100"><AlertCircle className="h-3 w-3 mr-1" />Not Sent</Badge>;
    }
  };

  const handleSendForm = (cochildminder: Cochildminder) => {
    setSelectedCochildminder(cochildminder);
    setSendFormModalOpen(true);
  };

  const CochildminderItem = ({ cochildminder }: { cochildminder: Cochildminder }) => (
    <div className="rounded-xl bg-amber-50/50 border border-amber-100 p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="font-medium text-sm">
            {cochildminder.first_name} {cochildminder.last_name}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            DOB: {cochildminder.date_of_birth ? new Date(cochildminder.date_of_birth).toLocaleDateString('en-GB') : 'N/A'}
          </div>
        </div>
        {getStatusBadge(cochildminder.form_status)}
      </div>

      <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
        {cochildminder.email && (
          <div className="flex items-center gap-1.5">
            <Mail className="h-3 w-3" />
            <span className="truncate">{cochildminder.email}</span>
          </div>
        )}
        {cochildminder.phone && (
          <div className="flex items-center gap-1.5">
            <Phone className="h-3 w-3" />
            {cochildminder.phone}
          </div>
        )}
      </div>

      {cochildminder.form_status === "submitted" && cochildminder.form_submitted_date && (
        <div className="text-xs text-green-600 mb-3">
          Submitted: {new Date(cochildminder.form_submitted_date).toLocaleDateString('en-GB')}
        </div>
      )}

      <div className="flex gap-2">
        {cochildminder.form_status !== "submitted" && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-8 text-xs rounded-lg border-amber-200 hover:bg-amber-50"
            onClick={() => handleSendForm(cochildminder)}
            disabled={!cochildminder.email}
          >
            <Send className="h-3 w-3 mr-1.5" />
            {cochildminder.form_status === "sent" ? "Resend Form" : "Send Form"}
          </Button>
        )}
        {cochildminder.form_status === "submitted" && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-8 text-xs rounded-lg"
          >
            <FileText className="h-3 w-3 mr-1.5" />
            View Submission
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <AppleCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-amber-600" />
            <h3 className="text-lg font-semibold tracking-tight">Co-childminders</h3>
          </div>
          <Badge variant="secondary" className="bg-amber-100 text-amber-700">
            {cochildminders?.length || 0}
          </Badge>
        </div>

        {!cochildminders || cochildminders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No co-childminders listed</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cochildminders.map((cc) => (
              <CochildminderItem key={cc.id} cochildminder={cc} />
            ))}
          </div>
        )}
      </AppleCard>

      <SendCochildminderFormModal
        open={sendFormModalOpen}
        onOpenChange={setSendFormModalOpen}
        cochildminder={selectedCochildminder}
        applicantEmail={applicantEmail}
        applicantName={applicantName}
        applicationId={applicationId}
        employeeId={employeeId}
        onSuccess={onRefresh}
      />
    </>
  );
};
