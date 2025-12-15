import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Gavel, 
  ChevronRight, 
  ArrowLeft,
  Check,
  XCircle,
  CheckCircle,
  Info,
  Printer,
  Download
} from "lucide-react";
import { 
  formatDate, 
  addDays, 
  generateReferenceNumber,
  SUPERVISORS,
  getSupervisorName
} from "@/lib/enforcementUtils";
import { DecisionFormData, EnforcementCase } from "@/types/enforcement";
import { cn } from "@/lib/utils";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateEnforcementCase } from "@/hooks/useEnforcementData";
import { useToast } from "@/hooks/use-toast";

interface DecisionWorkflowProps {
  caseDetails: EnforcementCase;
  onClose: () => void;
  onComplete: (formData: DecisionFormData) => void;
}

export const DecisionWorkflow = ({ 
  caseDetails, 
  onClose, 
  onComplete 
}: DecisionWorkflowProps) => {
  const { toast } = useToast();
  const updateCase = useUpdateEnforcementCase();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<DecisionFormData>({
    repsReceived: 'no',
    repsSummary: '',
    repsOutcome: undefined,
    decision: 'cancel',
    supervisor: '',
    confirmReview: false
  });

  const today = new Date();
  const effectDate = addDays(today, 28);

  const isStep1Valid = formData.repsReceived && (
    formData.repsReceived === 'no' || (formData.repsSummary && formData.repsOutcome)
  );
  const isStep2Valid = formData.supervisor && formData.confirmReview;

  // Auto-set decision based on reps outcome
  const effectiveDecision = formData.repsOutcome === 'upheld' ? 'withdraw' : 'cancel';

  const handleComplete = async () => {
    try {
      const finalDecision = { ...formData, decision: effectiveDecision as 'cancel' | 'withdraw' };
      
      await updateCase.mutateAsync({
        caseId: caseDetails.id,
        updates: {
          status: effectiveDecision === 'cancel' ? 'cancelled' as any : 'closed' as any,
          date_closed: new Date().toISOString().split('T')[0],
          form_data: { ...caseDetails.form_data, decisionData: finalDecision }
        },
        timelineEvent: {
          event: effectiveDecision === 'cancel' ? 'Decision Notice Issued - Registration Cancelled' : 'Notice Withdrawn',
          type: 'completed'
        },
        supervisorName: getSupervisorName(formData.supervisor)
      });
      
      onComplete(finalDecision);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update case",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <Gavel className="w-7 h-7 text-slate-700" />
            Issue Decision Notice
          </DialogTitle>
          <p className="text-sm text-slate-500">
            Step {step} of 3 • Regulation 4(4) • Final Decision
          </p>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 py-4">
          {['Representations Review', 'Confirm Decision', 'Generate Notice'].map((label, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                step > idx + 1 ? 'bg-emerald-100 text-emerald-700' :
                step === idx + 1 ? 'bg-slate-800 text-white' :
                'bg-slate-100 text-slate-400'
              )}>
                {step > idx + 1 ? <Check className="w-4 h-4" /> : idx + 1}
              </div>
              <span className={cn(
                "text-sm hidden sm:inline",
                step === idx + 1 ? 'font-semibold text-slate-900' : 'text-slate-500'
              )}>
                {label}
              </span>
              {idx < 2 && <div className="w-8 h-0.5 bg-slate-200" />}
            </div>
          ))}
        </div>

        {/* Step 1: Representations Review */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Info Box */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold">Representations Status</p>
                <p>Before making a final decision, you must consider any representations made by the provider in response to the Notice of Intention.</p>
              </div>
            </div>

            {/* Representations Received */}
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-3 block">
                Were representations received?
              </Label>
              <div className="space-y-2">
                <label className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                  formData.repsReceived === 'yes' ? 'bg-slate-100 border-slate-300' : 'bg-white border-slate-200 hover:bg-slate-50'
                )}>
                  <input
                    type="radio"
                    name="repsReceived"
                    value="yes"
                    checked={formData.repsReceived === 'yes'}
                    onChange={(e) => setFormData({ ...formData, repsReceived: e.target.value as 'yes' | 'no' })}
                    className="text-slate-900"
                  />
                  <span className="text-sm font-medium">Yes, written/oral representations received</span>
                </label>

                <label className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                  formData.repsReceived === 'no' ? 'bg-slate-100 border-slate-300' : 'bg-white border-slate-200 hover:bg-slate-50'
                )}>
                  <input
                    type="radio"
                    name="repsReceived"
                    value="no"
                    checked={formData.repsReceived === 'no'}
                    onChange={(e) => setFormData({ ...formData, repsReceived: e.target.value as 'yes' | 'no' })}
                    className="text-slate-900"
                  />
                  <span className="text-sm font-medium">No, period expired without response</span>
                </label>
              </div>
            </div>

            {formData.repsReceived === 'yes' && (
              <>
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Summary of Representations</Label>
                  <Textarea
                    value={formData.repsSummary}
                    onChange={(e) => setFormData({ ...formData, repsSummary: e.target.value })}
                    placeholder="Summarize the key points from the provider's representations..."
                    className="mt-1.5"
                    rows={4}
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold text-slate-700">Outcome of Consideration</Label>
                  <Select 
                    value={formData.repsOutcome} 
                    onValueChange={(v) => setFormData({ ...formData, repsOutcome: v as 'rejected' | 'varied' | 'upheld' })}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select Outcome..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rejected">Representations Rejected - Proceed to Cancel</SelectItem>
                      <SelectItem value="varied">Grounds Varied but Proceeding</SelectItem>
                      <SelectItem value="upheld">Representations Upheld - Withdraw Notice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 2: Confirm Decision */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-slate-900 font-bold text-lg uppercase tracking-tight">Final Decision Parameters</h3>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Decision</label>
                    <div className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      {effectiveDecision === 'cancel' 
                        ? <XCircle className="w-5 h-5 text-rose-600" /> 
                        : <CheckCircle className="w-5 h-5 text-emerald-600" />
                      }
                      {effectiveDecision === 'cancel' ? 'CANCEL REGISTRATION' : 'WITHDRAW NOTICE'}
                    </div>
                  </div>
                  <div className="border-t border-slate-100 pt-4">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Effect Date (Regulation 4(6))</label>
                    <div className="text-xl font-mono font-bold text-slate-900">{formatDate(effectDate)}</div>
                    <p className="text-xs text-slate-400 mt-1">28 days from today</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-slate-900 font-bold text-lg uppercase tracking-tight">Supervisor Authorization</h3>
                <div className="bg-slate-100 p-6 rounded-xl border border-slate-200">
                  <Label className="text-sm font-bold text-slate-700 mb-2 block">
                    Approved By <span className="text-rose-600">*</span>
                  </Label>
                  <Select value={formData.supervisor} onValueChange={(v) => setFormData({ ...formData, supervisor: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Supervisor..." />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPERVISORS.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <label className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-white cursor-pointer hover:border-slate-300">
              <Checkbox
                checked={formData.confirmReview}
                onCheckedChange={(checked) => setFormData({ ...formData, confirmReview: !!checked })}
                className="mt-1"
              />
              <span className="text-sm font-medium text-slate-900">I confirm I have reviewed all evidence and representations (if any) before making this decision.</span>
            </label>
          </div>
        )}

        {/* Step 3: Notice Preview */}
        {step === 3 && (
          <div className="space-y-6">
            {/* Notice Preview */}
            <div className="bg-white border-2 border-slate-200 rounded-xl p-8 shadow-inner">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    RK
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Ready Kids Agency</p>
                    <p className="text-sm text-slate-500">Regulatory Compliance Unit</p>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <p className="text-slate-600">Date: {formatDate(today)}</p>
                  <p className="text-slate-600">Ref: {generateReferenceNumber('DEC-CANC', caseDetails.employee_id)}</p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-800 text-white mb-4">
                <Gavel className="w-3 h-3" />
                DECISION NOTICE
              </div>

              <div className="mb-6">
                <p className="font-bold text-slate-900">{caseDetails.employee_name}</p>
                <p className="text-sm text-slate-600">14 Oak Lane</p>
                <p className="text-sm text-slate-600">Bristol</p>
                <p className="text-sm text-slate-600">BS1 4TH</p>
              </div>

              <div className="space-y-4 text-sm text-slate-700">
                <h4 className="font-bold text-slate-900 text-base">NOTICE OF DECISION TO CANCEL REGISTRATION</h4>
                <p className="text-xs text-slate-500">Regulation 4(4) of The Childcare (Childminder Agencies) (Cancellation etc.) Regulations 2014</p>
                
                <p>Dear {caseDetails.employee_name},</p>
                <p>Further to the Notice of Intention served on [Date], and after considering all available information, Ready Kids Agency has decided to cancel your registration.</p>
                
                <div>
                  <h5 className="font-bold text-slate-900">Consideration of Representations</h5>
                  {formData.repsReceived === 'yes' ? (
                    <>
                      <p>We received your representations on [Date]. Having carefully considered the points raised, we have concluded that:</p>
                      <p className="italic bg-slate-50 p-3 rounded mt-2">
                        "{formData.repsOutcome === 'rejected' ? 'The representations do not sufficiently mitigate the grounds for cancellation. ' : ''}{formData.repsSummary}"
                      </p>
                      <p className="mt-2">Therefore, the decision to cancel is upheld.</p>
                    </>
                  ) : (
                    <p>No representations were received within the statutory period stated in the Notice of Intention.</p>
                  )}
                </div>

                <div>
                  <h5 className="font-bold text-slate-900">Effect of Decision</h5>
                  <p>In accordance with Regulation 4(6), this cancellation will take effect on {formatDate(effectDate)} (28 days from the date of this notice).</p>
                </div>

                <div>
                  <h5 className="font-bold text-slate-900">Options Following Cancellation</h5>
                  <p>There is no statutory right of appeal to the First-tier Tribunal against a childminder agency's decision to cancel a provider's registration.</p>
                  <p>However, you may seek registration with Ofsted or another childminder agency, subject to meeting their relevant requirements and not being disqualified.</p>
                  <p>If you disagree with the way in which Ready Kids has reached or implemented this decision, you may use the Agency's formal complaints procedure.</p>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t">
                <p className="font-bold text-slate-900">{getSupervisorName(formData.supervisor)}</p>
                <p className="text-sm text-slate-600">Authorised Manager, Ready Kids Agency</p>
              </div>
            </div>

            {/* Print/Download buttons */}
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <Printer className="w-4 h-4" /> Print Notice
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" /> Download PDF
              </Button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            variant="ghost"
            onClick={() => step === 1 ? onClose() : setStep(s => s - 1)}
            className="gap-2"
          >
            {step > 1 && <ArrowLeft className="w-4 h-4" />}
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>

          {step < 3 ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
              className="gap-2 bg-slate-900 hover:bg-slate-800 shadow-md"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={updateCase.isPending}
              className="gap-2 bg-slate-900 hover:bg-slate-800 shadow-lg"
            >
              {updateCase.isPending ? 'Processing...' : 'ISSUE DECISION NOTICE'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
