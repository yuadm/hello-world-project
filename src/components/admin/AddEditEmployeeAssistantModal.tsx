import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const assistantSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(100, "First name must be less than 100 characters"),
  last_name: z.string().trim().min(1, "Last name is required").max(100, "Last name must be less than 100 characters"),
  email: z.string().email("Invalid email format").max(255).optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  role: z.string().trim().min(1, "Role is required").max(100, "Role must be less than 100 characters"),
  date_of_birth: z.string().refine((date) => {
    const dob = new Date(date);
    const now = new Date();
    const minDate = new Date('1900-01-01');
    return dob <= now && dob >= minDate;
  }, "Invalid date - must be between 1900 and today"),
});

type AssistantFormData = z.infer<typeof assistantSchema>;

interface Assistant {
  id: string;
  employee_id?: string;
  application_id?: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  role: string;
  date_of_birth: string;
}

interface AddEditEmployeeAssistantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assistant: Assistant | null;
  parentId: string;
  parentType: 'application' | 'employee';
  onSave: () => void;
}

export const AddEditEmployeeAssistantModal = ({
  open,
  onOpenChange,
  assistant,
  parentId,
  parentType,
  onSave,
}: AddEditEmployeeAssistantModalProps) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const form = useForm<AssistantFormData>({
    resolver: zodResolver(assistantSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      role: "",
      date_of_birth: "",
    },
  });

  useEffect(() => {
    if (assistant) {
      form.reset({
        first_name: assistant.first_name,
        last_name: assistant.last_name,
        email: assistant.email || "",
        phone: assistant.phone || "",
        role: assistant.role,
        date_of_birth: assistant.date_of_birth,
      });
    } else {
      form.reset({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        role: "",
        date_of_birth: "",
      });
    }
  }, [assistant, form, open]);

  const handleSubmit = async (data: AssistantFormData) => {
    setSaving(true);
    try {
      const assistantData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email || null,
        phone: data.phone || null,
        role: data.role,
        date_of_birth: data.date_of_birth,
      };

      if (assistant) {
        // Update existing assistant
        const { error } = await supabase
          .from('compliance_assistants')
          .update(assistantData)
          .eq('id', assistant.id);

        if (error) throw error;

        toast({
          title: "Assistant Updated",
          description: `${data.first_name} ${data.last_name} has been updated successfully.`,
        });
      } else {
        // Add new assistant with polymorphic reference
        const { error } = await supabase
          .from('compliance_assistants')
          .insert({
            ...assistantData,
            [parentType === 'application' ? 'application_id' : 'employee_id']: parentId,
          });

        if (error) throw error;

        toast({
          title: "Assistant Added",
          description: `${data.first_name} ${data.last_name} has been added successfully.`,
        });
      }

      onSave();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Failed to Save",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{assistant ? 'Edit' : 'Add'} Assistant</DialogTitle>
          <DialogDescription>
            {assistant ? `Update details for ${assistant.first_name} ${assistant.last_name}` : 'Add a new assistant or co-childminder'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="Enter phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Assistant, Co-childminder" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date_of_birth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : `${assistant ? 'Update' : 'Add'} Assistant`}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
