import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  RefreshCw, 
  ChevronRight, 
  ArrowLeft,
  Check,
  Clock,
  Unlock,
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
import { SuspensionReviewFormData, EnforcementCase } from "@/types/enforcement";
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

interface SuspensionReviewWorkflowProps {
  caseDetails: EnforcementCase;
  initialAction: 'review' | 'lift';
  onClose: () => void;
  onComplete: (formData: SuspensionReviewFormData) => void;
}

export const SuspensionReviewWorkflow = ({ 
  caseDetails, 
  initialAction,
  onClose, 
  onComplete 
}: SuspensionReviewWorkflowProps) => {
  const { toast } = useToast();
  const updateCase = useUpdateEnforcementCase();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<SuspensionReviewFormData>({
    investigationStatus: '',
    reviewOutcome: initialAction === 'lift' ? 'lift' : 'extend',
    extensionWeeks: '6',
    liftConditions: '',
    supervisor: ''
  });

  const today = new Date();
  const liftDate = today;
  const newExtensionDate = addDays(today, parseInt(formData.extensionWeeks || '6') * 7);

  const themeColor = formData.reviewOutcome === 'lift' ? 'emerald' : 'rose';

  const isStep1Valid = formData.investigationStatus && formData.reviewOutcome;
  const isStep2Valid = formData.supervisor && (
    formData.reviewOutcome === 'extend' ? formData.extensionWeeks : true
  );

  const handleComplete = async () => {
    try {
      if (formData.reviewOutcome === 'lift') {
        await updateCase.mutateAsync({
          caseId: caseDetails.id,
          updates: {
            status: 'lifted' as any,
            date_closed: new Date().toISOString().split('T')[0],
            form_data: { ...caseDetails.form_data, reviewData: formData }
          },
          timelineEvent: {
            event: 'Suspension Lifted',
            type: 'completed'
          },
          supervisorName: getSupervisorName(formData.supervisor)
        });
      } else {
        await updateCase.mutateAsync({
          caseId: caseDetails.id,
          updates: {
            deadline: newExtensionDate.toISOString().split('T')[0],
            form_data: { ...caseDetails.form_data, reviewData: formData }
          },
          timelineEvent: {
            event: `Suspension Extended to ${formatDate(newExtensionDate)}`,
            type: 'completed'
          },
          supervisorName: getSupervisorName(formData.supervisor)
        });
      }
      
      onComplete(formData);
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
            <RefreshCw className={cn("w-7 h-7", themeColor === 'emerald' ? 'text-emerald-600' : 'text-rose-600')} />
            {formData.reviewOutcome === 'lift' ? 'Lift Suspension' : 'Review Suspension'}
          </DialogTitle>
          <p className="text-sm text-slate-500">
            Step {step} of 3 • Regulation 7 & 8 • Mandatory Review
          </p>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 py-4">
          {['Review Findings', 'Decision & Approval', 'Generate Notice'].map((label, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                step > idx + 1 ? 'bg-emerald-100 text-emerald-700' :
                step === idx + 1 ? (themeColor === 'emerald' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700') :
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

        {/* Step 1: Review Findings */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Current Status Info */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                Provider <span className="font-bold">{caseDetails.employee_name}</span> has been suspended since {formatDate(caseDetails.date_created)}. The current review deadline is approaching.
              </div>
            </div>

            {/* Investigation Status */}
            <div>
              <Label className="text-sm font-semibold text-slate-700">
                Investigation Update / Findings <span className="text-rose-600">*</span>
              </Label>
              <Textarea
                value={formData.investigationStatus}
                onChange={(e) => setFormData({ ...formData, investigationStatus: e.target.value })}
                placeholder="Summarize the current status of the investigation and any findings..."
                className="mt-1.5"
                rows={4}
              />
            </div>

            {/* Review Decision */}
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-3 block">
                Review Decision <span className="text-rose-600">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <label className={cn(
                  "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                  formData.reviewOutcome === 'extend' 
                    ? 'bg-rose-50 border-rose-200 ring-1 ring-rose-200' 
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                )}>
                  <input
                    type="radio"
                    name="reviewOutcome"
                    value="extend"
                    checked={formData.reviewOutcome === 'extend'}
                    onChange={(e) => setFormData({ ...formData, reviewOutcome: e.target.value as 'extend' | 'lift' })}
                    className="mt-1 text-rose-600"
                  />
                  <div>
                    <span className="block text-sm font-bold text-rose-900">Extend Suspension</span>
                    <span className="block text-xs text-slate-500 mt-1">Risk remains / Investigation ongoing. (Reg 7(3))</span>
                  </div>
                </label>

                <label className={cn(
                  "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                  formData.reviewOutcome === 'lift' 
                    ? 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-200' 
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                )}>
                  <input
                    type="radio"
                    name="reviewOutcome"
                    value="lift"
                    checked={formData.reviewOutcome === 'lift'}
                    onChange={(e) => setFormData({ ...formData, reviewOutcome: e.target.value as 'extend' | 'lift' })}
                    className="mt-1 text-emerald-600"
                  />
                  <div>
                    <span className="block text-sm font-bold text-emerald-900">Lift Suspension</span>
                    <span className="block text-xs text-slate-500 mt-1">Risk of harm no longer exists. (Reg 8)</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Decision & Approval */}
        {step === 2 && (
          <div className="space-y-6">
            {formData.reviewOutcome === 'extend' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-rose-700 font-semibold">
                  <Clock className="w-5 h-5" />
                  Extension Details
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Extension Period (Weeks)</Label>
                    <Input
                      type="number"
                      value={formData.extensionWeeks}
                      onChange={(e) => setFormData({ ...formData, extensionWeeks: e.target.value })}
                      className="mt-1.5"
                    />
                    <p className="text-xs text-slate-500 mt-1">Normally 6 weeks (max 12 total unless exceptional)</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">New Review Deadline</Label>
                    <p className="text-xl font-bold text-slate-900 mt-2">{formatDate(newExtensionDate)}</p>
                  </div>
                </div>
              </div>
            )}

            {formData.reviewOutcome === 'lift' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <Unlock className="w-5 h-5" />
                  Lifting Details
                </div>

                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <Label className="text-sm font-semibold text-slate-700">Effective Date</Label>
                  <p className="text-lg font-bold text-emerald-700">IMMEDIATE ({formatDate(liftDate)})</p>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-slate-700">Conditions / Ongoing Requirements (Optional)</Label>
                  <Textarea
                    value={formData.liftConditions}
                    onChange={(e) => setFormData({ ...formData, liftConditions: e.target.value })}
                    placeholder="Any conditions or requirements for the provider going forward..."
                    className="mt-1.5"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Supervisor */}
            <div className="p-4 bg-slate-100 rounded-xl border">
              <Label className="text-sm font-bold text-slate-700 mb-2 block">
                Supervisor Authorization <span className={cn(themeColor === 'emerald' ? 'text-emerald-600' : 'text-rose-600')}>*</span>
              </Label>
              <Select value={formData.supervisor} onValueChange={(v) => setFormData({ ...formData, supervisor: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select approving supervisor..." />
                </SelectTrigger>
                <SelectContent>
                  {SUPERVISORS.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                  <p className="text-slate-600">Ref: {generateReferenceNumber(formData.reviewOutcome === 'lift' ? 'SUS-LIFT' : 'SUS-EXT', caseDetails.employee_id)}</p>
                </div>
              </div>

              <div className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4",
                formData.reviewOutcome === 'lift' 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-rose-100 text-rose-800'
              )}>
                {formData.reviewOutcome === 'lift' ? 'SUSPENSION LIFTED' : 'SUSPENSION EXTENDED'}
              </div>

              <div className="mb-6">
                <p className="font-bold text-slate-900">{caseDetails.employee_name}</p>
                <p className="text-sm text-slate-600">14 Oak Lane</p>
                <p className="text-sm text-slate-600">Bristol</p>
                <p className="text-sm text-slate-600">BS1 4TH</p>
              </div>

              <div className="space-y-4 text-sm text-slate-700">
                <h4 className="font-bold text-slate-900 text-base">
                  {formData.reviewOutcome === 'lift' ? 'NOTICE OF LIFTING OF SUSPENSION' : 'NOTICE OF EXTENSION OF SUSPENSION'}
                </h4>
                <p className="text-xs text-slate-500">
                  {formData.reviewOutcome === 'lift' ? 'Regulation 8' : 'Regulation 7(3)'} of The Childcare (Childminder Agencies) (Cancellation etc.) Regulations 2014
                </p>
                
                <p>Dear {caseDetails.employee_name},</p>
                
                {formData.reviewOutcome === 'lift' && (
                  <>
                    <p>I am writing to inform you that Ready Kids Agency has reviewed your suspension. We are satisfied that the circumstances that gave rise to the risk of harm no longer exist.</p>
                    <p>The suspension of your registration is therefore lifted with immediate effect. You may resume providing childcare as an agency-registered childminder from {formatDate(today)}.</p>
                    
                    {formData.liftConditions && (
                      <div>
                        <h5 className="font-bold text-slate-900">Conditions / Requirements</h5>
                        <p className="bg-slate-50 p-3 rounded">{formData.liftConditions}</p>
                      </div>
                    )}
                    
                    <p>We have informed Ofsted and the Local Authority that your suspension has been lifted.</p>
                  </>
                )}

                {formData.reviewOutcome === 'extend' && (
                  <>
                    <p>I am writing to inform you that Ready Kids Agency has reviewed your suspension. We have determined that it is necessary to extend the period of suspension.</p>
                    
                    <div>
                      <h5 className="font-bold text-slate-900">Reason for Extension</h5>
                      <p className="bg-slate-50 p-3 rounded">{formData.investigationStatus}</p>
                    </div>

                    <p>Therefore, the investigation has not yet concluded / necessary steps have not yet been taken to remove the risk of harm.</p>
                    <p>This extension is for a further period of {formData.extensionWeeks} weeks. The suspension will now remain in force until {formatDate(newExtensionDate)}, unless lifted earlier.</p>
                    <p className="font-medium">During this extended period, you must not provide any childcare that is required to be registered with the agency. Operating while suspended remains an offence.</p>
                  </>
                )}
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
              className={cn(
                "gap-2 shadow-md",
                themeColor === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              )}
            >
              Continue <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={updateCase.isPending}
              className={cn(
                "gap-2 shadow-lg",
                themeColor === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              )}
            >
              {updateCase.isPending ? 'Processing...' : formData.reviewOutcome === 'lift' ? 'LIFT SUSPENSION' : 'EXTEND SUSPENSION'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
