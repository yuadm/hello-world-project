import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface UnifiedRequestDBSModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  memberName: string;
  parentId: string;
  parentType: 'application' | 'employee';
  parentName: string;
  parentEmail: string;
  onSuccess: () => void;
}

export function UnifiedRequestDBSModal({
  open,
  onOpenChange,
  memberId,
  memberName,
  parentId,
  parentType,
  parentName,
  parentEmail,
  onSuccess,
}: UnifiedRequestDBSModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Update member email in compliance_household_members
      const { error: updateError } = await supabase
        .from("compliance_household_members")
        .update({ email: memberEmail })
        .eq("id", memberId);

      if (updateError) throw new Error("Failed to save member email");

      // Send DBS request email via edge function
      const { error: emailError } = await supabase.functions.invoke(
        "send-dbs-request-email",
        {
          body: {
            memberId,
            memberEmail,
            isEmployee: parentType === 'employee',
            employeeName: parentType === 'employee' ? parentName : undefined,
            applicantName: parentType === 'application' ? parentName : undefined,
          },
        }
      );

      if (emailError) throw new Error("Failed to send DBS request email");

      toast({
        title: "DBS Request Sent",
        description: `DBS request sent to ${memberName}. ${parentName} notified to follow up.`,
      });

      onSuccess();
      onOpenChange(false);
      setMemberEmail("");
    } catch (error: any) {
      console.error("Error in DBS request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send DBS request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request DBS Check</DialogTitle>
          <DialogDescription>
            Send a DBS check request email to {memberName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="memberEmail">Member Email Address</Label>
            <Input
              id="memberEmail"
              type="email"
              placeholder="member@example.com"
              autoFocus
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send DBS Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
