import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ShieldAlert, 
  AlertTriangle, 
  X, 
  ChevronRight, 
  ArrowLeft,
  Check,
  Gavel,
  Info,
  Printer,
  Download
} from "lucide-react";
import { 
  formatDate, 
  addDays, 
  addWorkingDays, 
  generateReferenceNumber,
  RISK_CATEGORIES,
  SUPERVISORS,
  getSupervisorName
} from "@/lib/enforcementUtils";
import { SuspensionFormData, WarningFormData, EnforcementProvider } from "@/types/enforcement";
import { cn } from "@/lib/utils";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SuspensionWorkflowProps {
  provider: EnforcementProvider;
  initialMode: 'suspension' | 'warning';
  onClose: () => void;
  onComplete: (formData: SuspensionFormData | WarningFormData, isWarning: boolean) => void;
}

export const SuspensionWorkflow = ({ 
  provider, 
  initialMode,
  onClose, 
  onComplete 
}: SuspensionWorkflowProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<WarningFormData>({
    concern: '',
    riskDetail: '',
    riskCategories: [],
    reasonableness: initialMode === 'warning' ? 'yes' : 'no',
    evidenceAttached: false,
    confirmBelief: false,
    confirmImmediate: false,
    confirmAppeal: false,
    confirmReview: false,
    confirmNotify: false,
    supervisor: '',
    warningType: 'warning',
    breachDetails: '',
    requiredActions: '',
    complianceDeadline: '14',
    monitoringMethod: 'visit',
    impactDetails: ''
  });

  const today = new Date();
  const reviewDeadline = addDays(today, 42); // 6 weeks
  const complianceDate = addDays(today, parseInt(formData.complianceDeadline) || 14);
  const representationsDeadline = addWorkingDays(today, 5);

  const isWarningPath = formData.reasonableness === 'yes';
  const isSuspensionPath = formData.reasonableness === 'no';

  const toggleRiskCategory = (cat: string) => {
    setFormData(prev => ({
      ...prev,
      riskCategories: prev.riskCategories.includes(cat)
        ? prev.riskCategories.filter(c => c !== cat)
        : [...prev.riskCategories, cat]
    }));
  };

  const isStep1Valid = formData.concern && formData.riskDetail && formData.riskCategories.length > 0 && formData.reasonableness;
  
  const isStep2Valid = isSuspensionPath 
    ? formData.confirmBelief && formData.confirmImmediate && formData.confirmAppeal && formData.confirmReview && formData.confirmNotify
    : formData.warningType && formData.breachDetails && formData.requiredActions && formData.supervisor;

  const handleComplete = () => {
    onComplete(formData, isWarningPath);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl">
            {isWarningPath 
              ? <AlertTriangle className="w-7 h-7 text-amber-600" />
              : <ShieldAlert className="w-7 h-7 text-rose-600" />
            }
            {isWarningPath ? 'Issue Warning Notice' : 'Initiate Suspension'}
          </DialogTitle>
          <p className="text-sm text-slate-500">
            Step {step} of 3 • {isWarningPath ? 'Formal Warning to Improve (Section 10)' : 'Regulation 6 • Immediate effect'}
          </p>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 py-4">
          {['Risk Assessment', isWarningPath ? 'Warning Details' : 'Legal Confirmations', 'Notice Generation'].map((label, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                step > idx + 1 ? 'bg-emerald-100 text-emerald-700' :
                step === idx + 1 ? (isWarningPath ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700') :
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

        {/* Step 1: Risk Assessment */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Info Box */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold">Enforcement Assessment</p>
                <p>Assessment determines whether the provider's conduct exposes a child to a risk of harm (requiring Suspension) or constitutes non-compliance (requiring a Warning Notice).</p>
              </div>
            </div>

            {/* Provider Info */}
            <div className="p-4 bg-slate-50 rounded-lg border">
              <Label className="text-sm font-semibold text-slate-700">Select Provider *</Label>
              <div className="mt-2 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{provider.name} ({provider.id})</p>
                  <p className="text-sm text-slate-500">{provider.la}</p>
                </div>
                <span className="px-3 py-1 bg-slate-200 rounded-full text-xs font-medium">{provider.type}</span>
              </div>
            </div>

            {/* Assessment Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <AlertTriangle className="w-4 h-4" />
                Assessment Details
              </div>

              <div>
                <Label className="text-sm font-semibold text-slate-700">
                  Nature of concern / Non-compliance <span className="text-rose-600">*</span>
                </Label>
                <Textarea
                  value={formData.concern}
                  onChange={(e) => setFormData({ ...formData, concern: e.target.value })}
                  placeholder="Describe the nature of the concern or non-compliance..."
                  className="mt-1.5"
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-slate-700">
                  Evidence Summary & Impact <span className="text-rose-600">*</span>
                </Label>
                <Textarea
                  value={formData.riskDetail}
                  onChange={(e) => setFormData({ ...formData, riskDetail: e.target.value })}
                  placeholder="Summarize the evidence and potential impact..."
                  className="mt-1.5"
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-slate-700 mb-3 block">
                  Category <span className="text-rose-600">*</span>
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {RISK_CATEGORIES.map((cat) => (
                    <div
                      key={cat}
                      onClick={() => toggleRiskCategory(cat)}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all text-sm",
                        formData.riskCategories.includes(cat)
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center",
                        formData.riskCategories.includes(cat) ? 'bg-white' : 'border-slate-300'
                      )}>
                        {formData.riskCategories.includes(cat) && <Check className="w-3 h-3 text-slate-800" />}
                      </div>
                      {cat}
                    </div>
                  ))}
                </div>
              </div>

              {/* Enforcement Decision */}
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-slate-700 font-semibold mb-4">
                  <Gavel className="w-4 h-4" />
                  Enforcement Decision
                </div>

                <div className="space-y-3">
                  <label className={cn(
                    "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                    formData.reasonableness === 'no' 
                      ? 'bg-rose-50 border-rose-200 ring-1 ring-rose-200' 
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  )}>
                    <input
                      type="radio"
                      name="reasonableness"
                      value="no"
                      checked={formData.reasonableness === 'no'}
                      onChange={(e) => setFormData({ ...formData, reasonableness: e.target.value as 'no' | 'yes' })}
                      className="mt-1 text-rose-600"
                    />
                    <div>
                      <span className="block text-sm font-bold text-rose-900">No – Suspend immediately (Regulation 6)</span>
                      <span className="block text-xs text-slate-500 mt-1">Risk of harm is immediate.</span>
                    </div>
                  </label>

                  <label className={cn(
                    "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                    formData.reasonableness === 'yes' 
                      ? 'bg-amber-50 border-amber-200 ring-1 ring-amber-200' 
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  )}>
                    <input
                      type="radio"
                      name="reasonableness"
                      value="yes"
                      checked={formData.reasonableness === 'yes'}
                      onChange={(e) => setFormData({ ...formData, reasonableness: e.target.value as 'no' | 'yes' })}
                      className="mt-1 text-amber-600"
                    />
                    <div>
                      <span className="block text-sm font-bold text-amber-900">Yes – Issue Warning Notice (Section 10)</span>
                      <span className="block text-xs text-slate-500 mt-1">Non-compliance identified, but no immediate risk.</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Legal Confirmations / Warning Details */}
        {step === 2 && (
          <div className="space-y-6">
            {isSuspensionPath && (
              <>
                <h3 className="text-lg font-bold text-slate-900">Required Legal Confirmations</h3>
                <div className="space-y-3">
                  {[
                    { key: 'confirmBelief', label: 'I have REASONABLE BELIEF that continued childcare may expose a child to risk of harm', sub: 'Per Regulation 6(1) – this is the sole ground for suspension' },
                    { key: 'confirmImmediate', label: 'I understand suspension takes IMMEDIATE EFFECT upon service of notice', sub: 'Per Regulation 7(2) – the provider cannot operate from the moment notice is served' },
                    { key: 'confirmAppeal', label: 'I understand the provider has a RIGHT OF APPEAL to the First-tier Tribunal', sub: 'Per Regulation 9 – appeal must be lodged within 10 working days' },
                    { key: 'confirmReview', label: 'I will REVIEW this suspension within 6 weeks', sub: 'Per Regulation 7(2) – and lift it if risk no longer exists per Regulation 8' },
                    { key: 'confirmNotify', label: 'I will NOTIFY Secretary of State, HMRC, and Local Authority', sub: 'Per Schedule 2 – mandatory notifications within prescribed timeframes' },
                  ].map((item) => (
                    <label 
                      key={item.key}
                      className={cn(
                        "flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all",
                        (formData as any)[item.key] 
                          ? 'bg-rose-50 border-rose-200' 
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      )}
                    >
                      <Checkbox
                        checked={(formData as any)[item.key]}
                        onCheckedChange={(checked) => setFormData({ ...formData, [item.key]: checked })}
                        className="mt-1"
                      />
                      <div>
                        <span className="block text-sm font-semibold text-slate-900">{item.label}</span>
                        <span className="block text-xs text-slate-500 mt-1">{item.sub}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </>
            )}

            {isWarningPath && (
              <>
                <h3 className="text-lg font-bold text-slate-900">Warning Notice Criteria (Section 10.x)</h3>
                <p className="text-sm text-slate-600">
                  Use this when monitoring identifies failure to comply with EYFS/Agency requirements, but children are not at immediate risk of harm.
                </p>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700 mb-3 block">Notice Title</Label>
                    <div className="space-y-2">
                      <label className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer",
                        formData.warningType === 'warning' ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'
                      )}>
                        <input
                          type="radio"
                          name="warningType"
                          value="warning"
                          checked={formData.warningType === 'warning'}
                          onChange={(e) => setFormData({ ...formData, warningType: e.target.value as 'warning' | 'welfare' })}
                          className="text-amber-600"
                        />
                        <span className="text-sm font-medium">Warning Notice to Improve</span>
                      </label>
                      <label className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer",
                        formData.warningType === 'welfare' ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'
                      )}>
                        <input
                          type="radio"
                          name="warningType"
                          value="welfare"
                          checked={formData.warningType === 'welfare'}
                          onChange={(e) => setFormData({ ...formData, warningType: e.target.value as 'warning' | 'welfare' })}
                          className="text-amber-600"
                        />
                        <span className="text-sm font-medium">Welfare Requirements Warning Notice</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-slate-700">
                      Statutory/Agency Requirements Failed <span className="text-amber-600">*</span>
                    </Label>
                    <Textarea
                      value={formData.breachDetails}
                      onChange={(e) => setFormData({ ...formData, breachDetails: e.target.value })}
                      placeholder="Describe the specific requirements that have not been met..."
                      className="mt-1.5"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-slate-700">
                      Actions Required <span className="text-amber-600">*</span>
                    </Label>
                    <Textarea
                      value={formData.requiredActions}
                      onChange={(e) => setFormData({ ...formData, requiredActions: e.target.value })}
                      placeholder="List the actions the provider must take to become compliant..."
                      className="mt-1.5"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-slate-700">
                        Compliance Deadline (days)
                      </Label>
                      <Input
                        type="number"
                        value={formData.complianceDeadline}
                        onChange={(e) => setFormData({ ...formData, complianceDeadline: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-slate-700">
                        Monitoring Method
                      </Label>
                      <Select 
                        value={formData.monitoringMethod} 
                        onValueChange={(v) => setFormData({ ...formData, monitoringMethod: v as 'visit' | 'documentary' })}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="visit">Follow-up Visit</SelectItem>
                          <SelectItem value="documentary">Documentary Evidence</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-100 rounded-xl border">
                    <Label className="text-sm font-bold text-slate-700 mb-2 block">
                      Supervisor Approval <span className="text-amber-600">*</span>
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
              </>
            )}
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
                  <p className="text-slate-600">Ref: {generateReferenceNumber(isSuspensionPath ? 'SUS' : 'WRN', provider.id)}</p>
                </div>
              </div>

              <div className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4",
                isSuspensionPath 
                  ? 'bg-rose-100 text-rose-800' 
                  : 'bg-amber-100 text-amber-800'
              )}>
                {isSuspensionPath ? <ShieldAlert className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                {isSuspensionPath ? 'SUSPENSION NOTICE' : 'NOTICE TO IMPROVE'}
              </div>

              <div className="mb-6">
                <p className="font-bold text-slate-900">{provider.name}</p>
                <p className="text-sm text-slate-600">14 Oak Lane</p>
                <p className="text-sm text-slate-600">Bristol</p>
                <p className="text-sm text-slate-600">BS1 4TH</p>
              </div>

              {isSuspensionPath && (
                <div className="space-y-4 text-sm text-slate-700">
                  <h4 className="font-bold text-slate-900 text-base">NOTICE OF SUSPENSION OF REGISTRATION</h4>
                  <p className="text-xs text-slate-500">Childcare (Childminder Agencies) (Cancellation etc.) Regulations 2014</p>
                  
                  <p>Dear {provider.name},</p>
                  <p>This notice confirms that Ready Kids Agency has decided to suspend your registration with immediate effect, starting from today, {formatDate(today)}.</p>
                  
                  <div>
                    <h5 className="font-bold text-slate-900">Reasons for Suspension</h5>
                    <p>In accordance with Regulation 6, the Agency reasonably believes that the continued provision of childcare by you may expose a child to a risk of harm. Specifically:</p>
                    <p className="italic bg-slate-50 p-3 rounded mt-2">"{formData.concern} — {formData.riskDetail}"</p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-900">Initial Period and Review</h5>
                    <p>The initial period of this suspension is six weeks, ending on {formatDate(reviewDeadline)}.</p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-900">Prohibition on Childcare</h5>
                    <p>During this period of suspension, you must not provide any childcare that is required to be registered with the agency.</p>
                    <p className="font-bold text-rose-600">WARNING: Operating while suspended is an offence.</p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-900">Right of Appeal</h5>
                    <p>You have a statutory right of appeal against this decision to the First-tier Tribunal within 10 working days.</p>
                  </div>
                </div>
              )}

              {isWarningPath && (
                <div className="space-y-4 text-sm text-slate-700">
                  <h4 className="font-bold text-slate-900 text-base">
                    {formData.warningType === 'welfare' ? 'WELFARE REQUIREMENTS WARNING NOTICE' : 'WARNING NOTICE TO IMPROVE'}
                  </h4>
                  <p className="text-xs text-slate-500">Ready Kids Agency Statement of Purpose — Section 10</p>
                  
                  <p>Dear {provider.name},</p>
                  <p>Following our regulatory contact on {formatDate(today)}, we have identified that you have failed, or are failing, to comply with one or more requirements of the Early Years Foundation Stage (EYFS) or Agency standards.</p>
                  
                  <div>
                    <h5 className="font-bold text-slate-900">Specific Requirements Not Met</h5>
                    <p className="bg-slate-50 p-3 rounded">{formData.breachDetails}</p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-900">Actions Required</h5>
                    <p>You must take the following actions to become compliant:</p>
                    <p className="bg-slate-50 p-3 rounded mt-2">{formData.requiredActions}</p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-900">Timescales and Monitoring</h5>
                    <p>You must complete these actions by {formatDate(complianceDate)} (Timescale: {formData.complianceDeadline} days).</p>
                    <p>To monitor compliance, Ready Kids will {formData.monitoringMethod === 'visit' ? 'schedule a follow-up visit as soon as practicable after the completion date (typically within five working days).' : 'review documentary evidence submitted by you.'}</p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-900">Failure to Comply</h5>
                    <p>Failure to comply with this notice may result in escalation to stronger enforcement action, including variation of conditions, suspension, or cancellation of your registration.</p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-900">Representations</h5>
                    <p>If you believe this notice is factually inaccurate or disproportionate, you may make written representations to Ready Kids within 5 working days (by {formatDate(representationsDeadline)}).</p>
                  </div>
                </div>
              )}

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
              onClick={handleComplete}
              className={cn(
                "gap-2 shadow-lg",
                isWarningPath 
                  ? 'bg-amber-600 hover:bg-amber-700' 
                  : 'bg-rose-600 hover:bg-rose-700'
              )}
            >
              {isWarningPath ? 'ISSUE WARNING NOTICE' : 'ISSUE SUSPENSION NOTICE'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
