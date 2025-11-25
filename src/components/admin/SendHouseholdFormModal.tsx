import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SendHouseholdFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: {
    id: string;
    full_name: string;
    email?: string | null;
  };
  applicantEmail: string;
  applicantName: string;
  onSuccess: () => void;
  isEmployee?: boolean;
  employeeId?: string;
}

export function SendHouseholdFormModal({
  isOpen,
  onClose,
  member,
  applicantEmail,
  applicantName,
  onSuccess,
  isEmployee = false,
  employeeId,
}: SendHouseholdFormModalProps) {
  const [memberEmail, setMemberEmail] = useState(member.email || "");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!memberEmail.trim()) {
      toast.error("Please enter the member's email address");
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-household-form-email", {
        body: {
          memberId: member.id,
          memberEmail: memberEmail.trim(),
          applicantEmail,
          applicantName,
          isEmployee,
          employeeId,
        },
      });

      if (error) throw error;

      toast.success(`Form sent to ${member.full_name}`);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error sending form:", error);
      toast.error(error.message || "Failed to send form");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send CMA-H2 Suitability Form</DialogTitle>
          <DialogDescription>
            Send the household member suitability form to {member.full_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="memberEmail">Member Email Address</Label>
            <Input
              id="memberEmail"
              type="email"
              placeholder="member@example.com"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              The form link will be sent to this email address
            </p>
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="text-sm font-medium">What will be sent:</p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
              <li>A unique form link for {member.full_name}</li>
              <li>Instructions to complete the CMA-H2 form</li>
              <li>A notification will also be sent to the applicant</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending}>
            {sending ? "Sending..." : "Send Form"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
