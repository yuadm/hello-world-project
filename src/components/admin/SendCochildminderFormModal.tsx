import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle, Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Cochildminder {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  date_of_birth: string;
}

interface SendCochildminderFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cochildminder: Cochildminder | null;
  applicantEmail: string;
  applicantName: string;
  applicationId?: string;
  employeeId?: string;
  onSuccess: () => void;
}

export const SendCochildminderFormModal = ({
  open,
  onOpenChange,
  cochildminder,
  applicantEmail,
  applicantName,
  applicationId,
  employeeId,
  onSuccess,
}: SendCochildminderFormModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!cochildminder || !cochildminder.email) return;

    setLoading(true);

    try {
      const { error } = await supabase.functions.invoke('send-cochildminder-form-email', {
        body: {
          cochildminderId: cochildminder.id,
          applicantEmail,
          applicantName,
          applicationId,
          employeeId,
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Co-childminder registration form sent to ${cochildminder.first_name} ${cochildminder.last_name}`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send form",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!cochildminder) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-amber-600" />
            Send Co-childminder Registration Form
          </DialogTitle>
          <DialogDescription>
            Send the full registration form to {cochildminder.first_name} {cochildminder.last_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!cochildminder.email && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This co-childminder has no email address. Please update their details before sending the form.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-muted-foreground">Name:</span>
              <p className="font-medium">{cochildminder.first_name} {cochildminder.last_name}</p>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Email:</span>
              <p className="font-medium">{cochildminder.email || "Not provided"}</p>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Date of Birth:</span>
              <p className="font-medium">{cochildminder.date_of_birth ? new Date(cochildminder.date_of_birth).toLocaleDateString('en-GB') : "Not provided"}</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Co-childminder Registration</strong>
            </p>
            <p className="text-xs text-amber-700 mt-1">
              The co-childminder will receive an email with a secure link to complete their full registration application. 
              Some sections will be pre-filled with the main applicant's premises and service details.
            </p>
          </div>

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
              onClick={handleSend} 
              disabled={loading || !cochildminder.email}
              className="rounded-xl bg-amber-600 hover:bg-amber-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Registration Form
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
