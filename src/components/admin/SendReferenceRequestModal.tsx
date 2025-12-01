import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";

interface SendReferenceRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId?: string;
  employeeId?: string;
  referenceNumber: number;
  refereeName: string;
  refereeRelationship: string;
  refereeContact: string;
  isChildcareReference: boolean;
  applicantName: string;
  onSuccess?: () => void;
}

export const SendReferenceRequestModal = ({
  open,
  onOpenChange,
  applicationId,
  employeeId,
  referenceNumber,
  refereeName,
  refereeRelationship,
  refereeContact,
  isChildcareReference,
  applicantName,
  onSuccess,
}: SendReferenceRequestModalProps) => {
  const [email, setEmail] = useState(refereeContact.includes("@") ? refereeContact : "");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSending(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-reference-request-email", {
        body: {
          applicationId,
          employeeId,
          referenceNumber,
          refereeName,
          refereeRelationship,
          refereeEmail: email,
          isChildcareReference,
          applicantName,
          siteUrl: window.location.origin,
        },
      });

      if (error) throw error;

      toast.success("Reference request sent successfully!");
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error sending reference request:", error);
      toast.error(error.message || "Failed to send reference request");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Reference Request</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Applicant</Label>
            <div className="text-sm text-muted-foreground">{applicantName}</div>
          </div>

          <div className="space-y-2">
            <Label>Reference Number</Label>
            <div className="text-sm text-muted-foreground">Reference {referenceNumber}</div>
          </div>

          <div className="space-y-2">
            <Label>Referee Name</Label>
            <div className="text-sm text-muted-foreground">{refereeName}</div>
          </div>

          <div className="space-y-2">
            <Label>Relationship</Label>
            <div className="text-sm text-muted-foreground">{refereeRelationship}</div>
          </div>

          {isChildcareReference && (
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-sm">This is a <strong>childcare-related reference</strong></p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="referee-email">Referee Email Address *</Label>
            <Input
              id="referee-email"
              type="email"
              placeholder="referee@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              The reference form will be sent to this email address
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={sending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={sending || !email}
            className="gap-2"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Send Request
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};