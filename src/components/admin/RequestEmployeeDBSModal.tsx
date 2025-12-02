import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

const requestEmployeeDBSSchema = z.object({
  employeeEmail: z.string().email("Please enter a valid email address"),
});

type RequestEmployeeDBSFormData = z.infer<typeof requestEmployeeDBSSchema>;

interface RequestEmployeeDBSModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  onSuccess: () => void;
}

export function RequestEmployeeDBSModal({
  open,
  onOpenChange,
  employeeId,
  employeeName,
  employeeEmail,
  onSuccess,
}: RequestEmployeeDBSModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RequestEmployeeDBSFormData>({
    resolver: zodResolver(requestEmployeeDBSSchema),
    defaultValues: {
      employeeEmail: employeeEmail || "",
    },
  });

  const onSubmit = async (data: RequestEmployeeDBSFormData) => {
    setIsLoading(true);
    try {
      // Step 1: Update employee email if changed
      if (data.employeeEmail !== employeeEmail) {
        const { error: updateError } = await supabase
          .from("employees")
          .update({ email: data.employeeEmail })
          .eq("id", employeeId);

        if (updateError) {
          console.error("Error updating employee email:", updateError);
          throw new Error("Failed to update employee email");
        }
      }

      // Step 2: Send DBS request email to employee
      const { error: emailError } = await supabase.functions.invoke(
        "send-dbs-request-email",
        {
          body: {
            employeeId: employeeId,
            memberEmail: data.employeeEmail,
            employeeName: employeeName,
            isEmployee: true,
          },
        }
      );

      if (emailError) {
        console.error("Error sending DBS request email:", emailError);
        throw new Error("Failed to send DBS request email");
      }

      toast({
        title: "DBS Request Sent",
        description: `DBS request sent to ${employeeName} at ${data.employeeEmail}`,
      });

      onSuccess();
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error requesting employee DBS:", error);
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request Employee DBS Check</DialogTitle>
          <DialogDescription>
            Send a DBS check request to {employeeName}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="employeeEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="employee@example.com"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
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
        </Form>
      </DialogContent>
    </Dialog>
  );
}
