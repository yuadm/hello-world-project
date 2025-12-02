import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { pdf } from "@react-pdf/renderer";
import { KnownToOfstedPDF } from "./KnownToOfstedPDF";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface GenerateOfstedFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicantName: string;
  dateOfBirth: string;
  currentAddress: {
    line1: string;
    line2?: string;
    town: string;
    postcode: string;
    moveInDate: string;
  };
  previousAddresses?: Array<{
    address: string;
    dateFrom: string;
    dateTo: string;
  }>;
  previousNames?: Array<{
    name: string;
    dateFrom: string;
    dateTo: string;
  }>;
  role: 'childminder' | 'household_member' | 'assistant' | 'manager' | 'nominated_individual';
  agencyName?: string;
}

export const GenerateOfstedFormModal = ({
  open,
  onOpenChange,
  applicantName,
  dateOfBirth,
  currentAddress,
  previousAddresses,
  previousNames,
  role,
  agencyName = 'Childminder Agency',
}: GenerateOfstedFormModalProps) => {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [requesterName, setRequesterName] = useState("");
  const [requesterRole, setRequesterRole] = useState("");
  const [requireChildInfo, setRequireChildInfo] = useState(false);

  const handleGenerate = async () => {
    if (!requesterName.trim() || !requesterRole.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide requester name and role",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      const requestDate = format(new Date(), "dd/MM/yyyy");

      const blob = await pdf(
        <KnownToOfstedPDF
          applicantName={applicantName}
          previousNames={previousNames}
          dateOfBirth={format(new Date(dateOfBirth), "dd/MM/yyyy")}
          currentAddress={currentAddress}
          previousAddresses={previousAddresses}
          role={role}
          requestDate={requestDate}
          requesterName={requesterName}
          requesterRole={requesterRole}
          requireChildInfo={requireChildInfo}
          agencyName={agencyName}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `known-to-ofsted-${applicantName.replace(/\s+/g, "-")}-${format(new Date(), "yyyy-MM-dd")}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Form Generated",
        description: "Known to Ofsted form has been downloaded successfully",
      });

      onOpenChange(false);
      setRequesterName("");
      setRequesterRole("");
      setRequireChildInfo(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate Known to Ofsted Form</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Preview Section */}
          <div className="rounded-lg border border-border p-4 bg-muted/30 space-y-2">
            <h3 className="font-semibold text-sm">Form Preview</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Applicant:</span> {applicantName}
              </div>
              <div>
                <span className="text-muted-foreground">DOB:</span> {format(new Date(dateOfBirth), "dd/MM/yyyy")}
              </div>
              <div>
                <span className="text-muted-foreground">Role:</span> {role.replace("_", " ")}
              </div>
              <div>
                <span className="text-muted-foreground">Address:</span> {currentAddress.postcode}
              </div>
            </div>
          </div>

          {/* Requester Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="requesterName">Your Name *</Label>
              <Input
                id="requesterName"
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requesterRole">Your Role at Agency *</Label>
              <Input
                id="requesterRole"
                value={requesterRole}
                onChange={(e) => setRequesterRole(e.target.value)}
                placeholder="e.g., Compliance Manager, Director"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="childInfo" className="text-base">
                  Require child age information?
                </Label>
                <p className="text-sm text-muted-foreground">
                  Request details about number and ages of children in past Ofsted judgements
                </p>
              </div>
              <Switch
                id="childInfo"
                checked={requireChildInfo}
                onCheckedChange={setRequireChildInfo}
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4 text-sm">
            <p className="font-semibold mb-2">📋 Next Steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Review the form preview above</li>
              <li>Click "Generate PDF" to download</li>
              <li>Send the form to: childminder.agencies@ofsted.gov.uk</li>
              <li>Await Ofsted's response (typically 5-10 working days)</li>
            </ol>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={generating}>
            {generating ? "Generating..." : "Generate PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
