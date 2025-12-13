import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Users } from "lucide-react";

interface Cochildminder {
  id: string;
  first_name: string;
  last_name: string;
  dbs_status: string;
  dbs_certificate_number: string | null;
  dbs_certificate_date: string | null;
  dbs_certificate_expiry_date: string | null;
}

interface UnifiedRecordCochildminderCertificateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cochildminder: Cochildminder | null;
  onSuccess: () => void;
}

export const UnifiedRecordCochildminderCertificateModal = ({
  open,
  onOpenChange,
  cochildminder,
  onSuccess,
}: UnifiedRecordCochildminderCertificateModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    dbs_status: "received" as string,
    dbs_certificate_number: "",
    dbs_certificate_date: "",
    dbs_certificate_expiry_date: "",
  });

  // Reset form when modal opens with new cochildminder
  useEffect(() => {
    if (open && cochildminder) {
      setFormData({
        dbs_status: cochildminder.dbs_status === 'not_requested' ? 'received' : cochildminder.dbs_status,
        dbs_certificate_number: cochildminder.dbs_certificate_number || "",
        dbs_certificate_date: cochildminder.dbs_certificate_date || "",
        dbs_certificate_expiry_date: cochildminder.dbs_certificate_expiry_date || "",
      });
    }
  }, [open, cochildminder]);

  // Auto-calculate expiry date (3 years from issue date)
  const handleCertificateDateChange = (date: string) => {
    setFormData({ ...formData, dbs_certificate_date: date });
    if (date && formData.dbs_status === 'received') {
      const issueDate = new Date(date);
      issueDate.setFullYear(issueDate.getFullYear() + 3);
      setFormData(prev => ({ ...prev, dbs_certificate_date: date, dbs_certificate_expiry_date: issueDate.toISOString().split('T')[0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cochildminder) return;

    if (formData.dbs_status === 'received' && !formData.dbs_certificate_number) {
      toast({
        title: "Error",
        description: "Certificate number is required when status is 'Received'",
        variant: "destructive",
      });
      return;
    }

    if (formData.dbs_status === 'received' && !formData.dbs_certificate_date) {
      toast({
        title: "Error",
        description: "Certificate date is required when status is 'Received'",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const updateData: any = {
        dbs_status: formData.dbs_status,
      };

      if (formData.dbs_certificate_number) {
        updateData.dbs_certificate_number = formData.dbs_certificate_number;
      }

      if (formData.dbs_certificate_date) {
        updateData.dbs_certificate_date = formData.dbs_certificate_date;
      }

      if (formData.dbs_certificate_expiry_date) {
        updateData.dbs_certificate_expiry_date = formData.dbs_certificate_expiry_date;
      }

      const { error } = await supabase
        .from('compliance_cochildminders')
        .update(updateData)
        .eq('id', cochildminder.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `DBS certificate recorded for ${cochildminder.first_name} ${cochildminder.last_name}`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to record certificate",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!cochildminder) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-amber-600" />
            Record DBS Certificate
          </DialogTitle>
          <DialogDescription>
            Record DBS certificate details for {cochildminder.first_name} {cochildminder.last_name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dbs_status">DBS Status</Label>
            <Select
              value={formData.dbs_status}
              onValueChange={(value) => setFormData({ ...formData, dbs_status: value })}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="requested">Requested</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dbs_certificate_number">
              DBS Certificate Number {formData.dbs_status === 'received' && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id="dbs_certificate_number"
              value={formData.dbs_certificate_number}
              onChange={(e) => setFormData({ ...formData, dbs_certificate_number: e.target.value })}
              placeholder="Enter certificate number"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dbs_certificate_date">
              DBS Certificate Date {formData.dbs_status === 'received' && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id="dbs_certificate_date"
              type="date"
              value={formData.dbs_certificate_date}
              onChange={(e) => handleCertificateDateChange(e.target.value)}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dbs_certificate_expiry_date">
              DBS Certificate Expiry Date {formData.dbs_status === 'received' && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id="dbs_certificate_expiry_date"
              type="date"
              value={formData.dbs_certificate_expiry_date}
              onChange={(e) => setFormData({ ...formData, dbs_certificate_expiry_date: e.target.value })}
              className="rounded-xl"
            />
            <p className="text-xs text-muted-foreground">
              Auto-calculated as 3 years from issue date
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="rounded-xl bg-amber-600 hover:bg-amber-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Certificate
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
