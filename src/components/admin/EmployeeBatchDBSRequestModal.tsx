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

interface EmployeeBatchDBSRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: DBSMember[];
  employeeId: string;
  employeeEmail: string;
  employeeName: string;
  onSuccess: () => void;
}

const createBatchSchema = (members: DBSMember[]) => {
  const schemaFields: Record<string, z.ZodString> = {};
  
  members.forEach((member) => {
    schemaFields[`email_${member.id}`] = z.string().email("Invalid email address");
  });
  
  schemaFields['employeeEmail'] = z.string().email("Invalid email address");
  
  return z.object(schemaFields);
};

export function EmployeeBatchDBSRequestModal({
  open,
  onOpenChange,
  members,
  employeeId,
  employeeEmail,
  employeeName,
  onSuccess,
}: EmployeeBatchDBSRequestModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [employeeEmailChanged, setEmployeeEmailChanged] = useState(false);

  const batchSchema = createBatchSchema(members);
  type BatchFormData = z.infer<typeof batchSchema>;

  const defaultValues: Record<string, string> = {
    employeeEmail: employeeEmail,
  };
  
  members.forEach((member) => {
    defaultValues[`email_${member.id}`] = member.email || "";
  });

  const form = useForm<BatchFormData>({
    resolver: zodResolver(batchSchema),
    defaultValues: defaultValues as any,
  });

  const watchEmployeeEmail = form.watch('employeeEmail');

  // Detect if employee email has changed
  if (watchEmployeeEmail !== employeeEmail && !employeeEmailChanged) {
    setEmployeeEmailChanged(true);
  } else if (watchEmployeeEmail === employeeEmail && employeeEmailChanged) {
    setEmployeeEmailChanged(false);
  }

  const onSubmit = async (data: BatchFormData) => {
    setIsLoading(true);

    try {
      const requestedMemberIds: string[] = [];

      // Update employee email if changed
      if (employeeEmailChanged) {
        const { error: employeeUpdateError } = await supabase
          .from("employees")
          .update({ email: data.employeeEmail })
          .eq("id", employeeId);

        if (employeeUpdateError) {
          console.error("Error updating employee email:", employeeUpdateError);
          throw new Error("Failed to update employee email");
        }
      }

      // Process each member
      for (const member of members) {
        const memberEmail = data[`email_${member.id}` as keyof BatchFormData];

        // Update member email and status in database
        const { error: updateError } = await supabase
          .from("employee_household_members")
          .update({ 
            email: memberEmail as string,
            dbs_request_date: new Date().toISOString(),
            dbs_status: 'requested',
          })
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
              employeeId: employeeId,
              employeeName: employeeName,
              isEmployee: true,
            },
          }
        );

        if (emailError) {
          console.error(`Error sending DBS request to ${member.full_name}:`, emailError);
          throw new Error(`Failed to send DBS request to ${member.full_name}`);
        }

        requestedMemberIds.push(member.id);
      }

      // Send summary email to employee
      const updatedEmployeeEmail = employeeEmailChanged ? data.employeeEmail : employeeEmail;
      await supabase.functions.invoke("send-employee-dbs-summary", {
        body: {
          employeeId: employeeId,
          employeeEmail: updatedEmployeeEmail,
          employeeName: employeeName,
          requestedMemberIds
        },
      });

      toast.success(`DBS requests sent to ${members.length} household member(s) and summary sent to employee`);
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
            Enter email addresses for each household member. Individual DBS request emails will be sent to each member.
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

            {/* Employee Email */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold">Employee Email</h3>
              <FormField
                control={form.control}
                name="employeeEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="employee@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {employeeEmailChanged && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    ⚠️ You are about to change the employee's email address from{" "}
                    <strong>{employeeEmail}</strong> to{" "}
                    <strong>{watchEmployeeEmail}</strong>. This will update their
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
                {isLoading ? "Sending..." : `Send ${members.length} DBS Request${members.length > 1 ? 's' : ''}`}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}