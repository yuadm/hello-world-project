import { useState, useEffect } from "react";
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
import { EmployeeHouseholdMember } from "@/types/employee";

const householdMemberSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  relationship: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  dbs_status: z.enum(["not_requested", "requested", "received", "expired"]),
  dbs_certificate_number: z.string().optional(),
  dbs_certificate_date: z.string().optional(),
});

type HouseholdMemberFormData = z.infer<typeof householdMemberSchema>;

interface EditHouseholdMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: EmployeeHouseholdMember;
  onSuccess: () => void;
}

export function EditHouseholdMemberModal({
  open,
  onOpenChange,
  member,
  onSuccess,
}: EditHouseholdMemberModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<HouseholdMemberFormData>({
    resolver: zodResolver(householdMemberSchema),
    defaultValues: {
      full_name: member.full_name,
      date_of_birth: member.date_of_birth,
      relationship: member.relationship || "",
      email: member.email || "",
      dbs_status: member.dbs_status,
      dbs_certificate_number: member.dbs_certificate_number || "",
      dbs_certificate_date: member.dbs_certificate_date || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        full_name: member.full_name,
        date_of_birth: member.date_of_birth,
        relationship: member.relationship || "",
        email: member.email || "",
        dbs_status: member.dbs_status,
        dbs_certificate_number: member.dbs_certificate_number || "",
        dbs_certificate_date: member.dbs_certificate_date || "",
      });
    }
  }, [open, member, form]);

  const onSubmit = async (data: HouseholdMemberFormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("employee_household_members")
        .update({
          full_name: data.full_name,
          date_of_birth: data.date_of_birth,
          relationship: data.relationship || null,
          email: data.email || null,
          dbs_status: data.dbs_status,
          dbs_certificate_number: data.dbs_certificate_number || null,
          dbs_certificate_date: data.dbs_certificate_date || null,
        })
        .eq("id", member.id);

      if (error) throw error;

      toast({
        title: "Member Updated",
        description: `${data.full_name}'s information has been updated`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating household member:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update household member",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Household Member</DialogTitle>
          <DialogDescription>
            Update household member information and DBS details
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
              name="dbs_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DBS Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="not_requested">Not Requested</SelectItem>
                      <SelectItem value="requested">Requested</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("dbs_status") === "received" && (
              <>
                <FormField
                  control={form.control}
                  name="dbs_certificate_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DBS Certificate Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dbs_certificate_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DBS Certificate Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

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
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
