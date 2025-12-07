import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Address {
  line1: string;
  line2?: string;
  town: string;
  postcode: string;
  moveInDate: string;
}

interface PreviousAddressObject {
  line1: string;
  line2?: string;
  town: string;
  postcode: string;
}

interface PreviousAddress {
  address: string | PreviousAddressObject;
  dateFrom: string;
  dateTo: string;
}

interface PreviousName {
  name: string;
  dateFrom: string;
  dateTo: string;
}

// Helper to format previous address (handles both string and object formats)
const formatPreviousAddress = (addr: PreviousAddress): string => {
  if (typeof addr.address === 'string') {
    return addr.address;
  }
  const parts = [
    addr.address.line1,
    addr.address.line2,
    addr.address.town,
    addr.address.postcode
  ].filter(Boolean);
  return parts.join(', ');
};

const LAForm = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Parse URL parameters with error handling
  const token = searchParams.get("token") || "";
  const referenceId = searchParams.get("ref") || "";
  const applicantName = searchParams.get("name") || "";
  const dateOfBirth = searchParams.get("dob") || "";
  const role = searchParams.get("role") || "";
  const localAuthority = searchParams.get("la") || "";
  const requesterName = searchParams.get("requesterName") || "";
  const requesterRole = searchParams.get("requesterRole") || "";
  const agencyName = searchParams.get("agency") || "ReadyKids Childminder Agency";

  let currentAddress: Address = { line1: '', town: '', postcode: '', moveInDate: '' };
  let previousAddresses: PreviousAddress[] = [];
  let previousNames: PreviousName[] = [];
  
  try {
    currentAddress = JSON.parse(searchParams.get("address") || "{}");
  } catch (e) {
    console.error("Failed to parse address:", e);
  }
  
  try {
    previousAddresses = JSON.parse(searchParams.get("prevAddresses") || "[]");
  } catch (e) {
    console.error("Failed to parse prevAddresses:", e);
  }
  
  try {
    previousNames = JSON.parse(searchParams.get("prevNames") || "[]");
  } catch (e) {
    console.error("Failed to parse prevNames:", e);
  }

  // Form state
  const [responseType, setResponseType] = useState<string>("");
  const [relevantInformation, setRelevantInformation] = useState("");
  const [expectedResponseDate, setExpectedResponseDate] = useState("");
  const [responderName, setResponderName] = useState("");
  const [responderRole, setResponderRole] = useState("");
  const [responderEmail, setResponderEmail] = useState("");
  const [responderPhone, setResponderPhone] = useState("");
  const [checkCompletedDate, setCheckCompletedDate] = useState("");

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    try {
      return format(new Date(dateStr), "dd/MM/yyyy");
    } catch {
      return dateStr;
    }
  };

  const formatMonthYear = (dateStr: string) => {
    if (!dateStr) return "N/A";
    try {
      return format(new Date(dateStr), "MMMM yyyy");
    } catch {
      return dateStr;
    }
  };

  const roleLabels: Record<string, string> = {
    childminder: "Registered childminder",
    household_member: "Adult household member",
    assistant: "Childminding assistant",
    manager: "Manager",
    nominated_individual: "Nominated individual",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!responseType) {
      toast({
        title: "Validation Error",
        description: "Please select a response option",
        variant: "destructive",
      });
      return;
    }

    if (!responderName || !responderRole || !checkCompletedDate) {
      toast({
        title: "Validation Error",
        description: "Please complete all required fields",
        variant: "destructive",
      });
      return;
    }

    if (responseType === "known_with_info" && !relevantInformation) {
      toast({
        title: "Validation Error",
        description: "Please provide the relevant information",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const responseData = {
        responseType,
        relevantInformation: responseType === "known_with_info" ? relevantInformation : null,
        expectedResponseDate: responseType === "unable_to_provide" ? expectedResponseDate : null,
        responderName,
        responderRole,
        responderEmail,
        responderPhone,
        checkCompletedDate,
      };

      const { error } = await supabase
        .from("la_form_submissions")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          response_data: responseData,
        })
        .eq("form_token", token);

      if (error) throw error;

      toast({
        title: "Form Submitted",
        description: "Thank you for completing the Local Authority check",
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Response Submitted</h1>
          <p className="text-gray-600 mb-4">
            Thank you for completing the Local Authority children's services check. Reference: {referenceId}
          </p>
          <p className="text-sm text-gray-500">
            Your response has been sent to {agencyName}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-purple-600">ReadyKids</span>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{format(new Date(), "d MMMM yyyy")}</span>
            <span className="bg-gray-100 px-3 py-1 rounded font-mono text-xs">{referenceId}</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Local Authority Children's Services Check</h1>
          <p className="text-gray-600">Response form for {localAuthority}</p>
        </div>

        {/* Notice Box */}
        <div className="bg-purple-50 border border-purple-200 border-l-4 border-l-purple-600 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-purple-800 text-sm uppercase mb-2">Request from {agencyName}</h3>
          <p className="text-sm text-gray-700">
            We are seeking information from your children's services records to help assess whether 
            the below-named individual is suitable to care for, or be in regular contact with, children.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section A: Applicant Details (Read-only) */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center gap-4">
              <div className="w-9 h-9 bg-purple-600 text-white rounded-lg flex items-center justify-center font-bold">A</div>
              <div>
                <h2 className="font-bold text-gray-900">Applicant Details</h2>
                <p className="text-sm text-gray-500">Submitted by {agencyName}</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Full Name</Label>
                  <Input value={applicantName} readOnly className="bg-gray-50 mt-1" />
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Date of Birth</Label>
                  <Input value={formatDisplayDate(dateOfBirth)} readOnly className="bg-gray-50 mt-1" />
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-600">Previous Names</Label>
                <Input 
                  value={previousNames.length > 0 ? previousNames.map(p => p.name).join(", ") : "None"} 
                  readOnly 
                  className="bg-gray-50 mt-1" 
                />
              </div>

              <div>
                <Label className="text-sm text-gray-600">Current Address</Label>
                <div className="bg-gray-50 mt-1 p-3 rounded-md border border-input text-sm">
                  {currentAddress.line1 && <p>{currentAddress.line1}</p>}
                  {currentAddress.line2 && <p>{currentAddress.line2}</p>}
                  {currentAddress.town && <p>{currentAddress.town}</p>}
                  {currentAddress.postcode && <p>{currentAddress.postcode}</p>}
                  <p className="text-gray-500 mt-1">From: {formatMonthYear(currentAddress.moveInDate)}</p>
                </div>
              </div>

              {previousAddresses.length > 0 && (
                <div>
                  <Label className="text-sm text-gray-600">Previous Addresses (Last 5 Years)</Label>
                  {previousAddresses.map((addr, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-lg mt-2 text-sm">
                      <p>{formatPreviousAddress(addr)}</p>
                      <p className="text-gray-500">From: {formatMonthYear(addr.dateFrom)} To: {formatMonthYear(addr.dateTo)}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Role Applied For</Label>
                  <Input value={roleLabels[role] || role} readOnly className="bg-gray-50 mt-1" />
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Requested By</Label>
                  <Input value={`${requesterName} (${requesterRole})`} readOnly className="bg-gray-50 mt-1" />
                </div>
              </div>
            </div>
          </div>

          {/* Section B: LA Response */}
          <div className="bg-white border-2 border-purple-200 rounded-xl overflow-hidden">
            <div className="bg-purple-50 border-b border-purple-200 px-6 py-4 flex items-center gap-4">
              <div className="w-9 h-9 bg-purple-600 text-white rounded-lg flex items-center justify-center font-bold">B</div>
              <div>
                <h2 className="font-bold text-gray-900">Your Response</h2>
                <p className="text-sm text-gray-500">Please complete the following</p>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <Label className="font-semibold mb-4 block">
                  Please indicate which of the following applies: <span className="text-red-500">*</span>
                </Label>
                <RadioGroup value={responseType} onValueChange={setResponseType} className="space-y-3">
                  <label
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all flex items-start gap-3 ${
                      responseType === "not_known" 
                        ? "bg-green-50 border-green-500" 
                        : "bg-gray-50 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <RadioGroupItem value="not_known" id="not_known" className="mt-1" />
                    <div>
                      <span className="font-medium">Option 1: NOT Known</span>
                      <p className="text-sm text-gray-600 mt-1">
                        The person is NOT known to your children's services in any capacity relevant to this request.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all flex items-start gap-3 ${
                      responseType === "known_no_info" 
                        ? "bg-blue-50 border-blue-500" 
                        : "bg-gray-50 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <RadioGroupItem value="known_no_info" id="known_no_info" className="mt-1" />
                    <div>
                      <span className="font-medium">Option 2: Known - No Relevant Information</span>
                      <p className="text-sm text-gray-600 mt-1">
                        The person IS known but there is NO information which you consider relevant to their suitability.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all flex items-start gap-3 ${
                      responseType === "known_with_info" 
                        ? "bg-red-50 border-red-500" 
                        : "bg-gray-50 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <RadioGroupItem value="known_with_info" id="known_with_info" className="mt-1" />
                    <div>
                      <span className="font-medium">Option 3: Known - Relevant Information Held</span>
                      <p className="text-sm text-gray-600 mt-1">
                        The person IS known and you hold information that you consider relevant to their suitability
                        (e.g., child protection enquiries, LADO referrals, removal of a child from care).
                      </p>
                    </div>
                  </label>

                  <label
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all flex items-start gap-3 ${
                      responseType === "unable_to_provide" 
                        ? "bg-amber-50 border-amber-500" 
                        : "bg-gray-50 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <RadioGroupItem value="unable_to_provide" id="unable_to_provide" className="mt-1" />
                    <div>
                      <span className="font-medium">Option 4: Unable to Provide</span>
                      <p className="text-sm text-gray-600 mt-1">
                        You hold information that may be relevant but are unable to provide it at this stage.
                      </p>
                    </div>
                  </label>
                </RadioGroup>
              </div>

              {/* Conditional: Relevant Information */}
              {responseType === "known_with_info" && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200 animate-in slide-in-from-top-2">
                  <Label htmlFor="relevantInfo" className="font-medium text-red-800">
                    Please provide the relevant information: <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="relevantInfo"
                    value={relevantInformation}
                    onChange={(e) => setRelevantInformation(e.target.value)}
                    placeholder="Please describe the relevant information..."
                    className="mt-2"
                    rows={5}
                  />
                </div>
              )}

              {/* Conditional: Expected Response Date */}
              {responseType === "unable_to_provide" && (
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 animate-in slide-in-from-top-2">
                  <Label htmlFor="expectedDate" className="font-medium text-amber-800">
                    When do you expect to be able to respond fully?
                  </Label>
                  <Input
                    id="expectedDate"
                    type="date"
                    value={expectedResponseDate}
                    onChange={(e) => setExpectedResponseDate(e.target.value)}
                    className="mt-2 max-w-xs"
                  />
                </div>
              )}

              {/* Check Completed Date */}
              <div>
                <Label htmlFor="checkDate">Date this check was completed <span className="text-red-500">*</span></Label>
                <Input
                  id="checkDate"
                  type="date"
                  value={checkCompletedDate}
                  onChange={(e) => setCheckCompletedDate(e.target.value)}
                  className="mt-1 max-w-xs"
                />
              </div>
            </div>
          </div>

          {/* Section C: Responder Details */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center gap-4">
              <div className="w-9 h-9 bg-gray-600 text-white rounded-lg flex items-center justify-center font-bold">C</div>
              <div>
                <h2 className="font-bold text-gray-900">Your Details</h2>
                <p className="text-sm text-gray-500">Person completing this form</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="responderName">Your Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="responderName"
                    value={responderName}
                    onChange={(e) => setResponderName(e.target.value)}
                    placeholder="Enter your full name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="responderRole">Your Role/Title <span className="text-red-500">*</span></Label>
                  <Input
                    id="responderRole"
                    value={responderRole}
                    onChange={(e) => setResponderRole(e.target.value)}
                    placeholder="e.g., Senior Social Worker"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="responderEmail">Email Address</Label>
                  <Input
                    id="responderEmail"
                    type="email"
                    value={responderEmail}
                    onChange={(e) => setResponderEmail(e.target.value)}
                    placeholder="your.email@localauthority.gov.uk"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="responderPhone">Phone Number</Label>
                  <Input
                    id="responderPhone"
                    value={responderPhone}
                    onChange={(e) => setResponderPhone(e.target.value)}
                    placeholder="Optional"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={submitting}
              className="bg-purple-600 hover:bg-purple-700 px-8"
              size="lg"
            >
              {submitting ? "Submitting..." : "Submit Response"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default LAForm;
