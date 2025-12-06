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
  const [ofstedEmail, setOfstedEmail] = useState("");
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
      setOfstedEmail("");
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
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Known to Ofsted Form
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-2">
          {/* Preview Section */}
          <div className="rounded-lg border border-border p-3 bg-muted/30">
            <h3 className="font-semibold text-sm mb-2">Applicant Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground">Name:</span> {applicantName || 'N/A'}</div>
              <div><span className="text-muted-foreground">DOB:</span> {dateOfBirth || 'N/A'}</div>
              <div><span className="text-muted-foreground">Role:</span> {roleLabels[role] || role}</div>
              <div><span className="text-muted-foreground">Postcode:</span> {currentAddress?.postcode || 'N/A'}</div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="ofstedEmail">Ofsted Email Address *</Label>
              <Input
                id="ofstedEmail"
                type="email"
                value={ofstedEmail}
                onChange={(e) => setOfstedEmail(e.target.value)}
                placeholder="Enter Ofsted email address"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="requesterName">Your Name *</Label>
              <Input
                id="requesterName"
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="requesterRole">Your Role *</Label>
              <Input
                id="requesterRole"
                value={requesterRole}
                onChange={(e) => setRequesterRole(e.target.value)}
                placeholder="e.g., Compliance Manager"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="childInfo" className="text-sm font-medium">
                  Require child age information?
                </Label>
                <p className="text-xs text-muted-foreground">
                  Request child age details from Ofsted
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
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3 text-xs">
            <p className="font-semibold mb-1.5 flex items-center gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" />
              How it works:
            </p>
            <ol className="list-decimal list-inside space-y-0.5 text-muted-foreground">
              <li>Email sent to Ofsted with secure link</li>
              <li>Applicant details pre-filled in form</li>
              <li>Ofsted completes and submits response</li>
            </ol>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 pt-4 border-t">
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
