import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface DBSMember {
  id: string;
  full_name: string;
  email: string | null;
  relationship: string | null;
}

interface BatchDBSRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: DBSMember[];
  applicationId: string;
  applicantEmail: string;
  applicantName: string;
  onSuccess: () => void;
}

const createBatchSchema = (members: DBSMember[]) => {
  const schemaFields: Record<string, z.ZodString> = {};
  
  members.forEach((member) => {
    schemaFields[`email_${member.id}`] = z.string().email("Invalid email address");
  });
  
  schemaFields['applicantEmail'] = z.string().email("Invalid email address");
  
  return z.object(schemaFields);
};

export function BatchDBSRequestModal({
  open,
  onOpenChange,
  members,
  applicationId,
  applicantEmail,
  applicantName,
  onSuccess,
}: BatchDBSRequestModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [applicantEmailChanged, setApplicantEmailChanged] = useState(false);

  const batchSchema = createBatchSchema(members);
  type BatchFormData = z.infer<typeof batchSchema>;

  const defaultValues: Record<string, string> = {
    applicantEmail: applicantEmail,
  };
  
  members.forEach((member) => {
    defaultValues[`email_${member.id}`] = member.email || "";
  });

  const form = useForm<BatchFormData>({
    resolver: zodResolver(batchSchema),
    defaultValues: defaultValues as any,
  });

  const watchApplicantEmail = form.watch('applicantEmail');

  // Detect if applicant email has changed
  if (watchApplicantEmail !== applicantEmail && !applicantEmailChanged) {
    setApplicantEmailChanged(true);
  } else if (watchApplicantEmail === applicantEmail && applicantEmailChanged) {
    setApplicantEmailChanged(false);
  }

  const onSubmit = async (data: BatchFormData) => {
    setIsLoading(true);

    try {
      const requestedMemberIds: string[] = [];

      // Update applicant email if changed
      if (applicantEmailChanged) {
        const { error: applicantUpdateError } = await supabase
          .from("childminder_applications")
          .update({ email: data.applicantEmail })
          .eq("id", applicationId);

        if (applicantUpdateError) {
          console.error("Error updating applicant email:", applicantUpdateError);
          throw new Error("Failed to update applicant email");
        }
      }

      // Process each member
      for (const member of members) {
        const memberEmail = data[`email_${member.id}` as keyof BatchFormData];

        // Update member email in database
        const { error: updateError } = await supabase
          .from("household_member_dbs_tracking")
          .update({ email: memberEmail as string })
          .eq("id", member.id);

        if (updateError) {
          console.error(`Error updating email for ${member.full_name}:`, updateError);
          throw new Error(`Failed to update email for ${member.full_name}`);
        }

        // Send individual DBS request email to household member
        const { error: emailError } = await supabase.functions.invoke(
          "send-dbs-request-email",
          {
            body: {
              memberId: member.id,
              memberName: member.full_name,
              memberEmail: memberEmail,
              applicationId: applicationId,
              applicantName: applicantName,
            },
          }
        );

        if (emailError) {
          console.error(`Error sending DBS request to ${member.full_name}:`, emailError);
          throw new Error(`Failed to send DBS request to ${member.full_name}`);
        }

        requestedMemberIds.push(member.id);
      }

      // Send consolidated summary email to applicant
      const { error: summaryError } = await supabase.functions.invoke(
        "send-applicant-dbs-summary",
        {
          body: {
            applicationId: applicationId,
            applicantEmail: data.applicantEmail,
            applicantName: applicantName,
            requestedMemberIds: requestedMemberIds,
          },
        }
      );

      if (summaryError) {
        console.error("Error sending applicant summary:", summaryError);
        throw new Error("Failed to send summary email to applicant");
      }

      toast.success(`DBS requests sent to ${members.length} household member(s) and summary sent to applicant`);
      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      console.error("Error in batch DBS request:", error);
      toast.error(error.message || "Failed to send DBS requests");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send DBS Requests - Batch ({members.length} member{members.length > 1 ? 's' : ''})</DialogTitle>
          <DialogDescription>
            Enter email addresses for each household member. Individual DBS request emails will be sent to each member, 
            and a consolidated summary will be sent to the applicant.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Household Member Emails */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Household Member Emails</h3>
              {members.map((member) => (
                <FormField
                  key={member.id}
                  control={form.control}
                  name={`email_${member.id}` as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {member.full_name}
                        {member.relationship && ` (${member.relationship})`}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter email address"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            {/* Applicant Email */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold">Applicant Email (Summary Recipient)</h3>
              <FormField
                control={form.control}
                name="applicantEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Applicant Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="applicant@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {applicantEmailChanged && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    ⚠️ You are about to change the applicant's email address from{" "}
                    <strong>{applicantEmail}</strong> to{" "}
                    <strong>{watchApplicantEmail}</strong>. This will update their
                    contact information in the system.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Sending..." : `Send ${members.length} DBS Request${members.length > 1 ? 's' : ''} + Summary`}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
