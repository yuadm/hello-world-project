import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText } from "lucide-react";
import { useUpdateEnforcementCase } from "@/hooks/useEnforcementData";
import { EnforcementCase } from "@/types/enforcement";
import { useToast } from "@/hooks/use-toast";

interface RecordRepresentationsModalProps {
  caseDetails: EnforcementCase;
  onClose: () => void;
}

export const RecordRepresentationsModal = ({ 
  caseDetails, 
  onClose 
}: RecordRepresentationsModalProps) => {
  const { toast } = useToast();
  const [summary, setSummary] = useState("");
  const updateCase = useUpdateEnforcementCase();

  const handleSubmit = async () => {
    await updateCase.mutateAsync({
      caseId: caseDetails.id,
      updates: {
        status: 'representations_received',
        form_data: {
          ...caseDetails.form_data,
          representationsSummary: summary,
          representationsReceivedDate: new Date().toISOString()
        }
      },
      timelineEvent: {
        event: 'Representations Received',
        type: 'urgent'
      }
    });

    toast({
      title: "Representations Recorded",
      description: "The case has been updated to reflect representations received."
    });
    
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Record Representations
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg border">
            <p className="text-sm font-medium text-slate-900">{caseDetails.employee_name}</p>
            <p className="text-xs text-slate-500">Case ID: {caseDetails.id.slice(0, 8)}</p>
          </div>

          <div>
            <Label className="text-sm font-semibold text-slate-700">
              Summary of Representations Received
            </Label>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Summarize the key points from the provider's representations..."
              className="mt-1.5"
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!summary.trim() || updateCase.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updateCase.isPending ? 'Saving...' : 'Record Representations'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
