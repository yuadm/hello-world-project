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
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calculateAge } from "@/lib/employeeHelpers";

const householdMemberSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  relationship: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
});

type HouseholdMemberFormData = z.infer<typeof householdMemberSchema>;

interface AddHouseholdMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  onSuccess: () => void;
}

export function AddHouseholdMemberModal({
  open,
  onOpenChange,
  employeeId,
  onSuccess,
}: AddHouseholdMemberModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<HouseholdMemberFormData>({
    resolver: zodResolver(householdMemberSchema),
    defaultValues: {
      full_name: "",
      date_of_birth: "",
      relationship: "",
      email: "",
    },
  });

  const onSubmit = async (data: HouseholdMemberFormData) => {
    setIsLoading(true);
    try {
      // Calculate age to determine member type
      const age = calculateAge(data.date_of_birth);
      const memberType = age >= 16 ? "adult" : "child";

      const { error } = await supabase
        .from("employee_household_members")
        .insert({
          employee_id: employeeId,
          full_name: data.full_name,
          date_of_birth: data.date_of_birth,
          relationship: data.relationship || null,
          email: data.email || null,
          member_type: memberType,
          dbs_status: "not_requested",
        });

      if (error) throw error;

      toast({
        title: "Member Added",
        description: `${data.full_name} has been added as a household member`,
      });

      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      console.error("Error adding household member:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add household member",
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
          <DialogTitle>Add Household Member</DialogTitle>
          <DialogDescription>
            Add a new household member. Member type (adult/child) will be
            automatically determined based on age.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="relationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Spouse, Child, Parent" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Optional)</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
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
                {isLoading ? "Adding..." : "Add Member"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
