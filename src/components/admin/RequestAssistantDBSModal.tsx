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

const requestAssistantDBSSchema = z.object({
  assistantEmail: z.string().email("Please enter a valid email address"),
});

type RequestAssistantDBSFormData = z.infer<typeof requestAssistantDBSSchema>;

interface RequestAssistantDBSModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assistantId: string;
  assistantName: string;
  assistantEmail: string;
  applicantEmail: string;
  onSuccess: () => void;
}

export function RequestAssistantDBSModal({
  open,
  onOpenChange,
  assistantId,
  assistantName,
  assistantEmail,
  applicantEmail,
  onSuccess,
}: RequestAssistantDBSModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RequestAssistantDBSFormData>({
    resolver: zodResolver(requestAssistantDBSSchema),
    defaultValues: {
      assistantEmail: assistantEmail || "",
    },
  });

  const onSubmit = async (data: RequestAssistantDBSFormData) => {
    setIsLoading(true);
    try {
      // Update assistant email if changed
      if (data.assistantEmail !== assistantEmail) {
        const { error: updateError } = await supabase
          .from("assistant_dbs_tracking")
          .update({ email: data.assistantEmail })
          .eq("id", assistantId);

        if (updateError) {
          console.error("Error updating assistant email:", updateError);
          throw new Error("Failed to update assistant email");
        }
      }

      // Update DBS status and request date
      const { error: statusError } = await supabase
        .from("assistant_dbs_tracking")
        .update({
          dbs_status: "requested",
          dbs_request_date: new Date().toISOString(),
          last_contact_date: new Date().toISOString(),
        })
        .eq("id", assistantId);

      if (statusError) {
        console.error("Error updating DBS status:", statusError);
        throw new Error("Failed to update DBS status");
      }

      // Send DBS request email via edge function
      const { error: emailError } = await supabase.functions.invoke(
        "send-dbs-request-email",
        {
          body: {
            memberId: assistantId,
            memberEmail: data.assistantEmail,
            applicantEmail,
            isAssistant: true,
          },
        }
      );

      if (emailError) {
        console.error("Error sending DBS request email:", emailError);
        throw new Error("Failed to send DBS request email");
      }

      toast({
        title: "DBS Request Sent",
        description: `DBS request sent to ${assistantName} at ${data.assistantEmail}`,
      });

      onSuccess();
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error requesting assistant DBS:", error);
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
          <DialogTitle>Request Assistant DBS Check</DialogTitle>
          <DialogDescription>
            Send a DBS check request to {assistantName}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="assistantEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assistant Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="assistant@example.com"
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
