import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { differenceInYears } from "date-fns";
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

const memberSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  date_of_birth: z.string().refine((date) => {
    const dob = new Date(date);
    const now = new Date();
    const minDate = new Date('1900-01-01');
    return dob <= now && dob >= minDate;
  }, "Invalid date - must be between 1900 and today"),
  member_type: z.enum(['adult', 'child']),
  relationship: z.string().max(100).optional().or(z.literal('')),
  email: z.string().email("Invalid email format").max(255).optional().or(z.literal('')),
  notes: z.string().max(500).optional().or(z.literal('')),
});

type MemberFormData = z.infer<typeof memberSchema>;

interface DBSMember {
  id: string;
  employee_id: string;
  member_type: string;
  full_name: string;
  date_of_birth: string;
  relationship: string | null;
  email: string | null;
  notes: string | null;
}

interface AddEditHouseholdMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: DBSMember | null;
  employeeId: string;
  onSave: () => void;
}

export const AddEditHouseholdMemberModal = ({
  open,
  onOpenChange,
  member,
  employeeId,
  onSave,
}: AddEditHouseholdMemberModalProps) => {
  const [saving, setSaving] = useState(false);
  const [typeWarning, setTypeWarning] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      full_name: "",
      date_of_birth: "",
      member_type: "adult",
      relationship: "",
      email: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (member) {
      form.reset({
        full_name: member.full_name,
        date_of_birth: member.date_of_birth,
        member_type: member.member_type as 'adult' | 'child',
        relationship: member.relationship || "",
        email: member.email || "",
        notes: member.notes || "",
      });
    } else {
      form.reset({
        full_name: "",
        date_of_birth: "",
        member_type: "adult",
        relationship: "",
        email: "",
        notes: "",
      });
    }
    setTypeWarning(null);
  }, [member, form, open]);

  const calculateMemberType = (dob: string): 'adult' | 'child' => {
    const age = differenceInYears(new Date(), new Date(dob));
    return age >= 16 ? 'adult' : 'child';
  };

  const checkTypeWarning = (dob: string, selectedType: 'adult' | 'child') => {
    const calculatedType = calculateMemberType(dob);
    if (calculatedType !== selectedType) {
      if (selectedType === 'adult' && calculatedType === 'child') {
        setTypeWarning("⚠️ This person is under 16. Are you sure they should be marked as an adult?");
      } else {
        setTypeWarning("⚠️ This person is 16 or older. Are you sure they should be marked as a child?");
      }
    } else {
      setTypeWarning(null);
    }
  };

  const handleDateChange = (date: string) => {
    if (date) {
      const autoType = calculateMemberType(date);
      form.setValue('member_type', autoType);
      setTypeWarning(null);
    }
  };

  const handleTypeChange = (type: 'adult' | 'child') => {
    const dob = form.getValues('date_of_birth');
    if (dob) {
      checkTypeWarning(dob, type);
    }
  };

  const handleSubmit = async (data: MemberFormData) => {
    setSaving(true);
    try {
      const memberData = {
        full_name: data.full_name,
        date_of_birth: data.date_of_birth,
        member_type: data.member_type,
        relationship: data.relationship || null,
        email: data.email || null,
        notes: data.notes || null,
      };

      if (member) {
        // Update existing member
        const { error } = await supabase
          .from('employee_household_members')
          .update(memberData)
          .eq('id', member.id);

        if (error) throw error;

        toast({
          title: "Member Updated",
          description: `${data.full_name} has been updated successfully.`,
        });
      } else {
        // Add new member
        const { error } = await supabase
          .from('employee_household_members')
          .insert({
            ...memberData,
            employee_id: employeeId,
          });

        if (error) throw error;

        toast({
          title: "Member Added",
          description: `${data.full_name} has been added to the household.`,
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
          <DialogTitle>{member ? 'Edit' : 'Add'} Household Member</DialogTitle>
          <DialogDescription>
            {member ? `Update details for ${member.full_name}` : 'Add a new member to the household'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full name" {...field} />
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
                    <Input 
                      type="date" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        handleDateChange(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="member_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Member Type *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleTypeChange(value as 'adult' | 'child');
                      }}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="adult" id="adult" />
                        <Label htmlFor="adult">Adult (16+)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="child" id="child" />
                        <Label htmlFor="child">Child (&lt;16)</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>Adults are 16 and over</FormDescription>
                  {typeWarning && (
                    <div className="flex items-start gap-2 text-sm text-orange-600 dark:text-orange-400 mt-2 p-2 bg-orange-50 dark:bg-orange-950/20 rounded">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{typeWarning}</span>
                    </div>
                  )}
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
                    <Input placeholder="e.g., Spouse, Child, Assistant" {...field} />
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional notes or information" 
                      {...field}
                      className="resize-none"
                      rows={3}
                    />
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
                {saving ? 'Saving...' : 'Save Member'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
