import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, ExternalLink } from "lucide-react";

interface SendOfstedFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  role: 'childminder' | 'household_member' | 'assistant' | 'manager' | 'nominated_individual';
  agencyName?: string;
  parentId?: string;
  parentType?: 'application' | 'employee';
  onSuccess?: () => void;
}

export const SendOfstedFormModal = ({
  open,
  onOpenChange,
  applicantName,
  dateOfBirth,
  currentAddress,
  previousAddresses,
  previousNames,
  role,
  agencyName = 'ReadyKids Childminder Agency',
  parentId,
  parentType,
  onSuccess,
}: SendOfstedFormModalProps) => {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [ofstedEmail, setOfstedEmail] = useState("childminder.agencies@ofsted.gov.uk");
  const [requesterName, setRequesterName] = useState("");
  const [requesterRole, setRequesterRole] = useState("");
  const [requireChildInfo, setRequireChildInfo] = useState(false);

  const handleSend = async () => {
    if (!requesterName.trim() || !requesterRole.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide requester name and role",
        variant: "destructive",
      });
      return;
    }

    if (!ofstedEmail.trim()) {
      toast({
        title: "Missing Email",
        description: "Please provide the Ofsted email address",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-known-to-ofsted-email', {
        body: {
          ofstedEmail,
          applicantName,
          dateOfBirth,
          currentAddress,
          previousAddresses,
          previousNames,
          role,
          requesterName,
          requesterRole,
          requireChildInfo,
          agencyName,
          parentId,
          parentType,
        },
      });

      if (error) throw error;

      toast({
        title: "Email Sent",
        description: `Known to Ofsted form link sent to ${ofstedEmail}`,
      });

      onOpenChange(false);
      setRequesterName("");
      setRequesterRole("");
      setRequireChildInfo(false);
      setOfstedEmail("childminder.agencies@ofsted.gov.uk");
      onSuccess?.();
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send email",
        variant: "destructive",
      });
    } finally {
      setSending(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Known to Ofsted Form
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Preview Section */}
          <div className="rounded-lg border border-border p-4 bg-muted/30 space-y-2">
            <h3 className="font-semibold text-sm">Applicant Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span> {applicantName || 'N/A'}
              </div>
              <div>
                <span className="text-muted-foreground">DOB:</span> {dateOfBirth || 'N/A'}
              </div>
              <div>
                <span className="text-muted-foreground">Role:</span> {roleLabels[role] || role}
              </div>
              <div>
                <span className="text-muted-foreground">Postcode:</span> {currentAddress?.postcode || 'N/A'}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ofstedEmail">Ofsted Email Address *</Label>
              <Input
                id="ofstedEmail"
                type="email"
                value={ofstedEmail}
                onChange={(e) => setOfstedEmail(e.target.value)}
                placeholder="childminder.agencies@ofsted.gov.uk"
              />
              <p className="text-xs text-muted-foreground">
                The email address where the form link will be sent
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requesterName">Your Name *</Label>
              <Input
                id="requesterName"
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requesterRole">Your Role at Agency *</Label>
              <Input
                id="requesterRole"
                value={requesterRole}
                onChange={(e) => setRequesterRole(e.target.value)}
                placeholder="e.g., Compliance Manager, Director"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="childInfo" className="text-base">
                  Require child age information?
                </Label>
                <p className="text-sm text-muted-foreground">
                  Request details about number and ages of children in past Ofsted judgements
                </p>
              </div>
              <Switch
                id="childInfo"
                checked={requireChildInfo}
                onCheckedChange={setRequireChildInfo}
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4 text-sm">
            <p className="font-semibold mb-2 flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              How it works:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>An email will be sent to Ofsted with a secure link</li>
              <li>Section A (applicant details) will be pre-filled</li>
              <li>Ofsted completes Sections B, C, D as applicable</li>
              <li>Response is submitted back to the agency</li>
            </ol>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending} className="gap-2">
            <Mail className="h-4 w-4" />
            {sending ? "Sending..." : "Send to Ofsted"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
