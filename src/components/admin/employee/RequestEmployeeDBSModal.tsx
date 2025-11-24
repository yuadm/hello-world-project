import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

const requestDBSSchema = z.object({
  memberEmail: z
    .string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
});

type RequestDBSFormData = z.infer<typeof requestDBSSchema>;

interface RequestEmployeeDBSModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  memberName: string;
  employeeId: string;
  employeeName: string;
  onSuccess: () => void;
}

export function RequestEmployeeDBSModal({
  open,
  onOpenChange,
  memberId,
  memberName,
  employeeId,
  employeeName,
  onSuccess,
}: RequestEmployeeDBSModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RequestDBSFormData>({
    resolver: zodResolver(requestDBSSchema),
    defaultValues: {
      memberEmail: "",
    },
  });

  const onSubmit = async (data: RequestDBSFormData) => {
    setIsLoading(true);
    try {
      // Update member email
      const { error: updateError } = await supabase
        .from("employee_household_members")
        .update({ email: data.memberEmail })
        .eq("id", memberId);

      if (updateError) {
        console.error("Error updating member email:", updateError);
        throw new Error("Failed to save member email");
      }

      // Send DBS request email via edge function
      const { error: emailError } = await supabase.functions.invoke(
        "send-dbs-request-email",
        {
          body: {
            memberId,
            memberName,
            memberEmail: data.memberEmail,
            applicationId: employeeId,
            applicantName: employeeName,
          },
        }
      );

      if (emailError) {
        console.error("Error sending DBS request email:", emailError);
        throw new Error("Failed to send DBS request email");
      }

      // Update DBS status to requested
      const { error: statusError } = await supabase
        .from("employee_household_members")
        .update({ dbs_status: "requested" })
        .eq("id", memberId);

      if (statusError) {
        console.error("Error updating DBS status:", statusError);
      }

      toast({
        title: "DBS Request Sent",
        description: `DBS request email sent to ${data.memberEmail}`,
      });

      onSuccess();
      onOpenChange(false);
      form.reset();
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="memberEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Member Email Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="member@example.com"
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  form.reset();
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send DBS Request"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
