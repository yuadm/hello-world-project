import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  AlertOctagon, 
  X, 
  ChevronRight, 
  ArrowLeft,
  Check,
  Scale,
  CalendarDays,
  Printer,
  Download,
  Paperclip
} from "lucide-react";
import { 
  formatDate, 
  addDays, 
  generateReferenceNumber,
  CANCELLATION_GROUNDS,
  SUPERVISORS,
  getSupervisorName
} from "@/lib/enforcementUtils";
import { CancellationFormData, EnforcementProvider } from "@/types/enforcement";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CancellationWorkflowProps {
  provider: EnforcementProvider;
  onClose: () => void;
  onComplete: (formData: CancellationFormData) => void;
}

export const CancellationWorkflow = ({ 
  provider, 
  onClose, 
  onComplete 
}: CancellationWorkflowProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CancellationFormData>({
    grounds: [],
    evidenceSummary: '',
    hasEvidence: false,
    repPeriod: '14',
    confirmReps: false,
    confirmDelay: false,
    supervisor: ''
  });

  const today = new Date();
  const repsDeadline = addDays(today, parseInt(formData.repPeriod) || 14);
  const earliestDecision = addDays(repsDeadline, 1);
  const earliestEffect = addDays(earliestDecision, 28);

  const toggleGround = (groundId: string) => {
    setFormData(prev => ({
      ...prev,
      grounds: prev.grounds.includes(groundId)
        ? prev.grounds.filter(g => g !== groundId)
        : [...prev.grounds, groundId]
    }));
  };

  const isStep1Valid = formData.grounds.length > 0 && formData.evidenceSummary && formData.hasEvidence;
  const isStep2Valid = formData.confirmReps && formData.confirmDelay && formData.supervisor;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <AlertOctagon className="w-7 h-7 text-orange-600" />
            Initiate Cancellation
          </DialogTitle>
          <p className="text-sm text-slate-500">
            Step {step} of 3 • Regulation 3 & 4 • Notice of Intention Process
          </p>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 py-4">
          {['Establish Grounds', 'Statutory Timeline', 'Review & Confirm'].map((label, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                step > idx + 1 ? 'bg-emerald-100 text-emerald-700' :
                step === idx + 1 ? 'bg-orange-100 text-orange-700' :
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

        {/* Step 1: Establish Grounds */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Legal Basis Info */}
            <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <Scale className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
              <div className="text-sm text-orange-800">
                <p className="font-semibold">Legal Basis: Regulation 3</p>
                <p>Cancellation permanently ends a provider's registration. You must establish clear grounds under Regulation 3. Unlike suspension, this process begins with a Notice of Intention unless a child is at immediate risk (use Suspension).</p>
              </div>
            </div>

            {/* Provider Info */}
            <div className="p-4 bg-slate-50 rounded-lg border">
              <Label className="text-sm font-semibold text-slate-700">Select Provider *</Label>
              <div className="mt-2 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{provider.name} ({provider.id}) — {[provider.address?.addressLine1, provider.address?.addressLine2, provider.address?.townCity, provider.address?.postcode].filter(Boolean).join(', ')}</p>
                </div>
                <span className="px-3 py-1 bg-slate-200 rounded-full text-xs font-medium">{provider.type}</span>
              </div>
            </div>

            {/* Grounds Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <Scale className="w-4 h-4" />
                Grounds for Cancellation
              </div>

              {/* Mandatory Ground */}
              <div
                onClick={() => toggleGround('mandatory_dq')}
                className={cn(
                  "p-4 rounded-xl border cursor-pointer transition-all",
                  formData.grounds.includes('mandatory_dq')
                    ? 'bg-orange-50 border-orange-300 ring-1 ring-orange-200'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5",
                    formData.grounds.includes('mandatory_dq') ? 'bg-orange-600 border-orange-600' : 'border-slate-300'
                  )}>
                    {formData.grounds.includes('mandatory_dq') && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Mandatory: Disqualification</p>
                    <p className="text-sm text-slate-500">Provider is disqualified from registration (e.g. conviction, order, etc.) under Section 76 Childcare Act 2006.</p>
                  </div>
                </div>
              </div>

              {/* Discretionary Grounds */}
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-3">Discretionary Grounds (Regulation 3)</p>
                <div className="border rounded-xl divide-y">
                  {CANCELLATION_GROUNDS.filter(g => g.id !== 'mandatory_dq').map((ground) => (
                    <div
                      key={ground.id}
                      onClick={() => toggleGround(ground.id)}
                      className={cn(
                        "p-4 cursor-pointer transition-all hover:bg-slate-50",
                        formData.grounds.includes(ground.id) && 'bg-orange-50/50'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5",
                          formData.grounds.includes(ground.id) ? 'bg-orange-600 border-orange-600' : 'border-slate-300'
                        )}>
                          {formData.grounds.includes(ground.id) && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{ground.label}</p>
                          <p className="text-sm text-slate-500">{ground.sub}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evidence Summary */}
              <div>
                <Label className="text-sm font-semibold text-slate-700">
                  Evidence Summary <span className="text-orange-600">*</span>
                </Label>
                <Textarea
                  value={formData.evidenceSummary}
                  onChange={(e) => setFormData({ ...formData, evidenceSummary: e.target.value })}
                  placeholder="Summarize the evidence supporting the grounds for cancellation..."
                  className="mt-1.5"
                  rows={4}
                />
              </div>

              {/* Evidence Confirmation */}
              <label className="flex items-center gap-3 p-4 rounded-xl border cursor-pointer hover:bg-slate-50">
                <Checkbox
                  checked={formData.hasEvidence}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasEvidence: !!checked })}
                />
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">I confirm full evidence bundle is compiled and attached</span>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Step 2: Statutory Timeline */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <CalendarDays className="w-4 h-4" />
              Statutory Critical Path
            </div>

            {/* Timeline Visualization */}
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-orange-200" />
              
              {[
                { label: 'Today', sub: 'Notice of Intention Issued', detail: 'Regulation 4(2)', date: formatDate(today) },
                { label: formatDate(repsDeadline), sub: 'Deadline for Representations', detail: 'Minimum 14 days (Reg 4(3))', date: '' },
                { label: `From ${formatDate(earliestDecision)}`, sub: 'Earliest Decision Notice', detail: 'Agency considers any reps', date: '' },
                { label: formatDate(earliestEffect), sub: 'Cancellation Takes Effect', detail: 'Min 28 days post-decision (Reg 4(6))', date: '' },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 mb-6 relative">
                  <div className="w-8 h-8 bg-orange-100 border-2 border-orange-300 rounded-full flex items-center justify-center z-10">
                    <div className="w-2 h-2 bg-orange-600 rounded-full" />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="font-bold text-slate-900">{item.label}</p>
                    <p className="text-sm text-slate-700">{item.sub}</p>
                    <p className="text-xs text-slate-500">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Representations Period */}
            <div className="p-4 bg-slate-50 rounded-xl border">
              <Label className="text-sm font-semibold text-slate-700 mb-2 block">Representations Period</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={formData.repPeriod}
                  onChange={(e) => setFormData({ ...formData, repPeriod: e.target.value })}
                  className="w-24"
                />
                <span className="text-sm text-slate-600">days</span>
              </div>
            </div>

            {/* Process Confirmations */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900">Process Confirmations</h4>
              
              <label className={cn(
                "flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all",
                formData.confirmReps ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-200'
              )}>
                <Checkbox
                  checked={formData.confirmReps}
                  onCheckedChange={(checked) => setFormData({ ...formData, confirmReps: !!checked })}
                  className="mt-1"
                />
                <div>
                  <span className="block text-sm font-semibold text-slate-900">
                    I understand the provider has {formData.repPeriod} days to make representations.
                  </span>
                  <span className="block text-xs text-slate-500 mt-1">
                    We cannot issue a Decision Notice until this period has elapsed or representations are received.
                  </span>
                </div>
              </label>

              <label className={cn(
                "flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all",
                formData.confirmDelay ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-200'
              )}>
                <Checkbox
                  checked={formData.confirmDelay}
                  onCheckedChange={(checked) => setFormData({ ...formData, confirmDelay: !!checked })}
                  className="mt-1"
                />
                <div>
                  <span className="block text-sm font-semibold text-slate-900">
                    I understand cancellation does NOT take immediate effect.
                  </span>
                  <span className="block text-xs text-slate-500 mt-1">
                    The provider remains registered until the appeal period (28 days post-decision) expires.
                  </span>
                </div>
              </label>
            </div>

            {/* Supervisor */}
            <div className="p-4 bg-slate-100 rounded-xl border">
              <Label className="text-sm font-bold text-slate-700 mb-2 block">
                Supervisor Approval <span className="text-orange-600">*</span>
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
                  <p className="text-slate-600">Ref: {generateReferenceNumber('CANC-INT', provider.id)}</p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 mb-4">
                <AlertOctagon className="w-3 h-3" />
                NOTICE OF INTENTION
              </div>

              <div className="mb-6">
                <p className="font-bold text-slate-900">{provider.name}</p>
                {provider.address?.addressLine1 && <p className="text-sm text-slate-600">{provider.address.addressLine1}</p>}
                {provider.address?.addressLine2 && <p className="text-sm text-slate-600">{provider.address.addressLine2}</p>}
                {provider.address?.townCity && <p className="text-sm text-slate-600">{provider.address.townCity}</p>}
                {provider.address?.postcode && <p className="text-sm text-slate-600">{provider.address.postcode}</p>}
              </div>

              <div className="space-y-4 text-sm text-slate-700">
                <h4 className="font-bold text-slate-900 text-base">NOTICE OF INTENTION TO CANCEL REGISTRATION</h4>
                <p className="text-xs text-slate-500">Regulation 4 of The Childcare (Childminder Agencies) (Cancellation etc.) Regulations 2014</p>
                
                <p>Dear {provider.name},</p>
                <p>I am writing to inform you that Ready Kids Agency intends to cancel your registration as a childminder on the {provider.type} Register.</p>
                
                <div>
                  <h5 className="font-bold text-slate-900">Reasons for Intention</h5>
                  <p>This action is being taken in accordance with Regulation 3 on the following grounds:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {formData.grounds.map(g => (
                      <li key={g}>
                        {g === 'mandatory_dq' && 'Disqualification from registration'}
                        {g === 'requirements' && 'Failure to satisfy prescribed requirements'}
                        {g === 'conditions' && 'Failure to comply with conditions of registration'}
                        {g === 'fees' && 'Failure to pay prescribed fees'}
                        {g === 'suitability' && 'Suitability concerns'}
                      </li>
                    ))}
                  </ul>
                  <p className="italic bg-slate-50 p-3 rounded mt-2">"{formData.evidenceSummary}"</p>
                </div>

                <div>
                  <h5 className="font-bold text-slate-900">Right to Make Representations</h5>
                  <p>In accordance with Regulation 4(2)(c), you may make representations to the Agency regarding this proposal.</p>
                  <p>Any such representations must be made within {formData.repPeriod} days of the date of this notice (by {formatDate(repsDeadline)}).</p>
                </div>

                <div>
                  <h5 className="font-bold text-slate-900">Next Steps</h5>
                  <p>If, after considering any representations, we decide to proceed with the cancellation, we will issue a Decision Notice. That notice will explain the options available to you.</p>
                  <p className="font-medium mt-2">Please note: You remain registered until a final decision takes effect. However, you must continue to comply with all regulatory requirements.</p>
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
              className="gap-2 bg-slate-900 hover:bg-slate-800"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={() => onComplete(formData)}
              className="gap-2 bg-orange-600 hover:bg-orange-700 shadow-lg"
            >
              ISSUE NOTICE OF INTENTION
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
