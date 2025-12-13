import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface UnifiedSendCochildminderFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cochildminder: Cochildminder | null;
  parentEmail: string;
  parentName: string;
  parentId: string;
  parentType: 'application' | 'employee';
  onSuccess: () => void;
}

export const UnifiedSendCochildminderFormModal = ({
  open,
  onOpenChange,
  cochildminder,
  parentEmail,
  parentName,
  parentId,
  parentType,
  onSuccess,
}: UnifiedSendCochildminderFormModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(cochildminder?.email || "");

  // Update email when cochildminder changes
  useState(() => {
    if (cochildminder?.email) {
      setEmail(cochildminder.email);
    }
  });

  const handleSend = async () => {
    if (!cochildminder || !email) return;

    setLoading(true);

    try {
      // Update email if changed
      if (email !== cochildminder.email) {
        const { error: updateError } = await supabase
          .from("compliance_cochildminders")
          .update({ email })
          .eq("id", cochildminder.id);

        if (updateError) throw updateError;
      }

      const { error } = await supabase.functions.invoke('send-cochildminder-form-email', {
        body: {
          cochildminderId: cochildminder.id,
          applicantEmail: parentEmail,
          applicantName: parentName,
          applicationId: parentType === 'application' ? parentId : undefined,
          employeeId: parentType === 'employee' ? parentId : undefined,
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
          <div className="space-y-2">
            <Label htmlFor="cochildminder-email">Email Address</Label>
            <Input
              id="cochildminder-email"
              type="email"
              placeholder="cochildminder@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl"
            />
          </div>

          {!email && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please enter an email address to send the form.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-muted-foreground">Name:</span>
              <p className="font-medium">{cochildminder.first_name} {cochildminder.last_name}</p>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Date of Birth:</span>
              <p className="font-medium">{cochildminder.date_of_birth ? new Date(cochildminder.date_of_birth).toLocaleDateString('en-GB') : "Not provided"}</p>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Co-childminder Registration</strong>
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
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
              disabled={loading || !email}
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
