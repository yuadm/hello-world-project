import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EmployeeAssistant {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  dbs_status: string;
  dbs_certificate_number: string | null;
  dbs_certificate_date: string | null;
}

interface RequestEmployeeAssistantDBSModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assistant: EmployeeAssistant | null;
  onSuccess: () => void;
}

export const RequestEmployeeAssistantDBSModal = ({
  open,
  onOpenChange,
  assistant,
  onSuccess,
}: RequestEmployeeAssistantDBSModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  // Reset email when modal opens with new assistant
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && assistant) {
      setEmail(assistant.email || "");
    }
    onOpenChange(isOpen);
  };

  const handleSendRequest = async () => {
    if (!assistant) return;

    if (!email) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.functions.invoke('send-dbs-request-email', {
        body: {
          memberId: assistant.id,
          memberEmail: email,
          isEmployeeAssistant: true,
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `DBS request email sent to ${assistant.first_name} ${assistant.last_name}`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send DBS request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!assistant) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Request DBS Check
          </DialogTitle>
          <DialogDescription>
            Send a DBS request email to {assistant.first_name} {assistant.last_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-muted-foreground">Name:</span>
              <p className="font-medium">{assistant.first_name} {assistant.last_name}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assistant_email">Email Address</Label>
            <Input
              id="assistant_email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="rounded-xl"
            />
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              The assistant will receive an email with instructions to complete their DBS check.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendRequest} 
              disabled={loading || !email}
              className="rounded-xl"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send DBS Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
