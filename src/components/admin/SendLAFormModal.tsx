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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Building2, ExternalLink } from "lucide-react";

interface SendLAFormModalProps {
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
  localAuthority: string;
  agencyName?: string;
  parentId?: string;
  parentType?: 'application' | 'employee';
  onSuccess?: () => void;
}

export const SendLAFormModal = ({
  open,
  onOpenChange,
  applicantName,
  dateOfBirth,
  currentAddress,
  previousAddresses,
  previousNames,
  role,
  localAuthority,
  agencyName = 'ReadyKids Childminder Agency',
  parentId,
  parentType,
  onSuccess,
}: SendLAFormModalProps) => {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [laEmail, setLaEmail] = useState("");
  const [requesterName, setRequesterName] = useState("");
  const [requesterRole, setRequesterRole] = useState("");

  const handleSend = async () => {
    if (!requesterName.trim() || !requesterRole.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide your name and role",
        variant: "destructive",
      });
      return;
    }

    if (!laEmail.trim()) {
      toast({
        title: "Missing Email",
        description: "Please provide the Local Authority email address",
        variant: "destructive",
      });
      return;
    }

    if (!localAuthority) {
      toast({
        title: "Missing Local Authority",
        description: "Local Authority is not set for this application",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-la-check-email', {
        body: {
          laEmail,
          applicantName,
          dateOfBirth,
          currentAddress,
          previousAddresses,
          previousNames,
          role,
          localAuthority,
          requesterName,
          requesterRole,
          agencyName,
          parentId,
          parentType,
        },
      });

      if (error) throw error;

      toast({
        title: "Email Sent",
        description: `LA check request sent to ${laEmail}`,
      });

      onOpenChange(false);
      setRequesterName("");
      setRequesterRole("");
      setLaEmail("");
      onSuccess?.();
    } catch (error) {
      console.error('Error sending LA check email:', error);
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
            <Building2 className="h-5 w-5" />
            Send LA Check Request
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

          {/* Local Authority Info */}
          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Local Authority</span>
            </div>
            <p className="text-base font-medium">{localAuthority || 'Not set'}</p>
            {!localAuthority && (
              <p className="text-xs text-destructive mt-1">
                Please set the Local Authority in the application first.
              </p>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="laEmail">LA Email Address *</Label>
              <Input
                id="laEmail"
                type="email"
                value={laEmail}
                onChange={(e) => setLaEmail(e.target.value)}
                placeholder="childrens.services@council.gov.uk"
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
                placeholder="e.g., Safeguarding Lead"
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3 text-xs">
            <p className="font-semibold mb-1.5 flex items-center gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" />
              How it works:
            </p>
            <ol className="list-decimal list-inside space-y-0.5 text-muted-foreground">
              <li>Formal letter emailed to LA with secure link</li>
              <li>LA selects response option (known/not known)</li>
              <li>Response submitted to your dashboard</li>
            </ol>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={sending || !localAuthority} 
            className="gap-2"
          >
            <Mail className="h-4 w-4" />
            {sending ? "Sending..." : "Send to LA"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
