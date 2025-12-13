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
import { Users } from "lucide-react";

interface UnifiedRequestCochildminderDBSModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cochildminderId: string;
  cochildminderName: string;
  cochildminderEmail: string;
  parentEmail: string;
  onSuccess: () => void;
}

export function UnifiedRequestCochildminderDBSModal({
  open,
  onOpenChange,
  cochildminderId,
  cochildminderName,
  cochildminderEmail,
  parentEmail,
  onSuccess,
}: UnifiedRequestCochildminderDBSModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState(cochildminderEmail || "");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Update cochildminder email if changed
      if (email !== cochildminderEmail) {
        const { error: updateError } = await supabase
          .from("compliance_cochildminders")
          .update({ email })
          .eq("id", cochildminderId);

        if (updateError) throw new Error("Failed to update co-childminder email");
      }

      // Update DBS status and request date
      const { error: statusError } = await supabase
        .from("compliance_cochildminders")
        .update({
          dbs_status: "requested",
          dbs_request_date: new Date().toISOString(),
          last_contact_date: new Date().toISOString(),
        })
        .eq("id", cochildminderId);

      if (statusError) throw new Error("Failed to update DBS status");

      // Send DBS request email via edge function
      const { error: emailError } = await supabase.functions.invoke(
        "send-dbs-request-email",
        {
          body: {
            memberId: cochildminderId,
            memberEmail: email,
            applicantEmail: parentEmail,
            isCochildminder: true,
          },
        }
      );

      if (emailError) throw new Error("Failed to send DBS request email");

      toast({
        title: "DBS Request Sent",
        description: `DBS request sent to ${cochildminderName} at ${email}`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error requesting co-childminder DBS:", error);
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
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-amber-600" />
            Request Co-childminder DBS Check
          </DialogTitle>
          <DialogDescription>
            Send a DBS check request to {cochildminderName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Co-childminder Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="cochildminder@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="rounded-xl bg-amber-600 hover:bg-amber-700"
            >
              {isLoading ? "Sending..." : "Send DBS Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
