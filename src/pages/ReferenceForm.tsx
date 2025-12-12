import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GovUKButton } from "@/components/apply/GovUKButton";
import { ReferenceFormSection1 } from "@/components/reference-form/ReferenceFormSection1";
import { ReferenceFormSection2 } from "@/components/reference-form/ReferenceFormSection2";
import { ReferenceFormSection3 } from "@/components/reference-form/ReferenceFormSection3";
import { ReferenceFormSection4 } from "@/components/reference-form/ReferenceFormSection4";
import { ReferenceFormSection5 } from "@/components/reference-form/ReferenceFormSection5";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ReferenceFormData {
  confirmedRelationship: string;
  knownForYears: string;
  characterDescription: string;
  isReliable: "Yes" | "No" | "";
  reliableComments?: string;
  isPatient: "Yes" | "No" | "";
  patientComments?: string;
  hasGoodJudgment: "Yes" | "No" | "";
  judgmentComments?: string;
  observedWithChildren?: "Yes" | "No" | "";
  interactionDescription?: string;
  suitabilityConcerns?: string;
  integrityConcerns: "Yes" | "No" | "";
  integrityConcernsDetails?: string;
  wouldRecommend: "Yes" | "No" | "";
  recommendationComments?: string;
  additionalInformation?: string;
  declarationAccurate: boolean;
  signatureName: string;
  signatureDate: string;
}

export default function ReferenceForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [referenceRequest, setReferenceRequest] = useState<any>(null);
  const [applicantName, setApplicantName] = useState("");
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [completedAt, setCompletedAt] = useState<string | null>(null);

  const form = useForm<Partial<ReferenceFormData>>({
    defaultValues: {
      declarationAccurate: false,
    }
  });

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reference link");
      setLoading(false);
      return;
    }

    loadReferenceRequest();
  }, [token]);

  const loadReferenceRequest = async () => {
    try {
      const { data: request, error } = await supabase
        .from("reference_requests")
        .select("*")
        .eq("form_token", token)
        .single();

      if (error || !request) {
        toast.error("Invalid or expired reference link");
        setLoading(false);
        return;
      }

      if (request.request_status === "completed") {
        setAlreadySubmitted(true);
        setCompletedAt(request.response_received_date);
        setLoading(false);
        return;
      }

      setReferenceRequest(request);

      // Get applicant name
      if (request.application_id) {
        const { data: application } = await supabase
          .from("childminder_applications")
          .select("first_name, last_name")
          .eq("id", request.application_id)
          .single();
        
        if (application) {
          setApplicantName(`${application.first_name} ${application.last_name}`);
        }
      } else if (request.employee_id) {
        const { data: employee } = await supabase
          .from("employees")
          .select("first_name, last_name")
          .eq("id", request.employee_id)
          .single();
        
        if (employee) {
          setApplicantName(`${employee.first_name} ${employee.last_name}`);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading reference request:", error);
      toast.error("Failed to load reference request");
      setLoading(false);
    }
  };

  const onSubmit = async (data: Partial<ReferenceFormData>) => {
    if (!data.declarationAccurate) {
      toast.error("You must confirm the declaration");
      return;
    }

    setSubmitting(true);

    try {
      const { data: result, error } = await supabase.functions.invoke("submit-reference-form", {
        body: {
          formToken: token,
          responseData: data,
        },
      });

      if (error) throw error;

      toast.success("Reference submitted successfully. Thank you!");
      
      // Show success message
      setTimeout(() => {
        navigate("/");
      }, 3000);

    } catch (error: any) {
      console.error("Error submitting reference:", error);
      toast.error(error.message || "Failed to submit reference");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--govuk-grey-background))] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (alreadySubmitted) {
    return (
      <div className="min-h-screen bg-[hsl(var(--govuk-grey-background))] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Already Submitted</h1>
          <p className="text-gray-600 mb-4">
            This reference has already been submitted
            {completedAt && ` on ${new Date(completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`}.
          </p>
          <p className="text-sm text-gray-500">
            Thank you for providing the reference. No further action is required.
          </p>
        </div>
      </div>
    );
  }

  if (!referenceRequest) {
    return (
      <div className="min-h-screen bg-[hsl(var(--govuk-grey-background))] flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-8 bg-white">
          <h1 className="text-2xl font-bold text-foreground">Invalid Reference Link</h1>
          <p className="mt-4">This reference link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--govuk-grey-background))]">
      <div className="bg-[hsl(var(--govuk-blue))] text-white py-4">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-2xl font-bold">Ready Kids - Reference Form</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white p-8 shadow-sm">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="p-4 bg-[hsl(var(--govuk-inset-blue-bg))] border-l-[10px] border-[hsl(var(--govuk-blue))]">
              <h2 className="text-xl font-bold mb-2">Childminder Reference Request</h2>
              <p className="text-sm">
                Thank you for agreeing to provide a reference. Please answer all questions honestly and accurately.
                Your reference will be treated confidentially.
              </p>
            </div>

            <ReferenceFormSection1 
              form={form} 
              refereeName={referenceRequest.referee_name}
              applicantName={applicantName}
            />

            <hr className="border-t-2 border-[hsl(var(--govuk-grey-border))]" />

            <ReferenceFormSection2 form={form} />

            <hr className="border-t-2 border-[hsl(var(--govuk-grey-border))]" />

            {referenceRequest.is_childcare_reference && (
              <>
                <ReferenceFormSection3 
                  form={form} 
                  isChildcareReference={referenceRequest.is_childcare_reference}
                />
                <hr className="border-t-2 border-[hsl(var(--govuk-grey-border))]" />
              </>
            )}

            <ReferenceFormSection4 form={form} />

            <hr className="border-t-2 border-[hsl(var(--govuk-grey-border))]" />

            <ReferenceFormSection5 form={form} />

            <div className="flex gap-4 pt-6">
              <GovUKButton
                type="submit"
                variant="primary"
                disabled={submitting}
                className="flex items-center gap-2"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? "Submitting..." : "Submit Reference"}
              </GovUKButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}