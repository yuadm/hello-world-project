import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EmployeeHouseholdMember, DBSStatus, MemberType } from "@/types/employee";
import { calculateAge } from "@/lib/employeeHelpers";

interface HouseholdMemberDialogProps {
  employeeId: string;
  member?: EmployeeHouseholdMember;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function HouseholdMemberDialog({ employeeId, member, open, onOpenChange, onSuccess }: HouseholdMemberDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: member?.full_name || "",
    date_of_birth: member?.date_of_birth || "",
    relationship: member?.relationship || "",
    email: member?.email || "",
    member_type: member?.member_type || "child" as MemberType,
    dbs_status: member?.dbs_status || "not_requested" as DBSStatus,
    dbs_certificate_number: member?.dbs_certificate_number || "",
    dbs_certificate_date: member?.dbs_certificate_date || "",
    dbs_certificate_expiry_date: member?.dbs_certificate_expiry_date || "",
  });

  const isEdit = !!member;

  // Auto-calculate member type based on age
  const updateMemberType = (dob: string) => {
    if (dob) {
      const age = calculateAge(dob);
      const newMemberType: MemberType = age >= 16 ? "adult" : "child";
      setFormData(prev => ({ ...prev, date_of_birth: dob, member_type: newMemberType }));
    } else {
      setFormData(prev => ({ ...prev, date_of_birth: dob }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        const { error } = await supabase
          .from("employee_household_members")
          .update(formData)
          .eq("id", member.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("employee_household_members")
          .insert({
            employee_id: employeeId,
            ...formData,
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Household member ${isEdit ? "updated" : "added"} successfully`,
      });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit" : "Add"} Household Member</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update household member information" : "Add a new household member"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth *</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => updateMemberType(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member_type">Member Type</Label>
              <Select
                value={formData.member_type}
                onValueChange={(value: MemberType) =>
                  setFormData({ ...formData, member_type: value })
                }
                disabled
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adult">Adult (16+)</SelectItem>
                  <SelectItem value="child">Child (Under 16)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Auto-calculated from date of birth</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship</Label>
              <Input
                id="relationship"
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                placeholder="e.g., Spouse, Child, Parent"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="dbs_status">DBS Status</Label>
              <Select
                value={formData.dbs_status}
                onValueChange={(value: DBSStatus) =>
                  setFormData({ ...formData, dbs_status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_requested">Not Requested</SelectItem>
                  <SelectItem value="requested">Requested</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.dbs_status === "received" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="dbs_certificate_number">DBS Certificate Number</Label>
                  <Input
                    id="dbs_certificate_number"
                    value={formData.dbs_certificate_number}
                    onChange={(e) => setFormData({ ...formData, dbs_certificate_number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dbs_certificate_date">DBS Certificate Date</Label>
                  <Input
                    id="dbs_certificate_date"
                    type="date"
                    value={formData.dbs_certificate_date}
                    onChange={(e) => setFormData({ ...formData, dbs_certificate_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dbs_certificate_expiry_date">DBS Expiry Date</Label>
                  <Input
                    id="dbs_certificate_expiry_date"
                    type="date"
                    value={formData.dbs_certificate_expiry_date}
                    onChange={(e) => setFormData({ ...formData, dbs_certificate_expiry_date: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Add Member"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
