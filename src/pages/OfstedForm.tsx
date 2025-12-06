import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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

interface PreviousAddress {
  address: string;
  dateFrom: string;
  dateTo: string;
}

interface PreviousName {
  name: string;
  dateFrom: string;
  dateTo: string;
}

const OfstedForm = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Parse URL parameters
  const token = searchParams.get("token") || "";
  const referenceId = searchParams.get("ref") || "";
  const applicantName = searchParams.get("name") || "";
  const dateOfBirth = searchParams.get("dob") || "";
  const role = searchParams.get("role") || "";
  const requesterName = searchParams.get("requesterName") || "";
  const requesterRole = searchParams.get("requesterRole") || "";
  const childInfoRequired = searchParams.get("childInfo") === "yes";
  const agencyName = searchParams.get("agency") || "ReadyKids Childminder Agency";

  const currentAddress: Address = JSON.parse(searchParams.get("address") || "{}");
  const previousAddresses: PreviousAddress[] = JSON.parse(searchParams.get("prevAddresses") || "[]");
  const previousNames: PreviousName[] = JSON.parse(searchParams.get("prevNames") || "[]");

  // Form state for Ofsted sections
  const [recordsStatus, setRecordsStatus] = useState<string[]>([]);
  const [checkCompletedDate, setCheckCompletedDate] = useState("");
  
  // Section C fields
  const [uniqueRefNumber, setUniqueRefNumber] = useState("");
  const [otherNames, setOtherNames] = useState("");
  const [addressKnown, setAddressKnown] = useState("");
  const [dateOfRegistration, setDateOfRegistration] = useState("");
  const [registeredBodyName, setRegisteredBodyName] = useState("");
  const [registrationStatus, setRegistrationStatus] = useState("");
  const [lastInspection, setLastInspection] = useState("");
  const [provisionType, setProvisionType] = useState("");
  const [registers, setRegisters] = useState("");
  const [telephone, setTelephone] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [provisionAddress, setProvisionAddress] = useState("");
  const [childrenInfo, setChildrenInfo] = useState("");
  const [conditions, setConditions] = useState("");
  const [suitabilityInfo, setSuitabilityInfo] = useState("");
  const [inspectionInfo, setInspectionInfo] = useState("");
  const [safeguardingConcerns, setSafeguardingConcerns] = useState("");

  // Section D fields
  const [otherNamesD, setOtherNamesD] = useState("");
  const [capacityKnown, setCapacityKnown] = useState("");
  const [relevantInfo, setRelevantInfo] = useState("");

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    try {
      return format(new Date(dateStr), "dd/MM/yyyy");
    } catch {
      return dateStr;
    }
  };

  const roleLabels: Record<string, string> = {
    childminder: "Childminder / Sole Proprietor",
    household_member: "Household member over the age of 16",
    assistant: "Assistant",
    manager: "Manager",
    nominated_individual: "Nominated individual representing an organisation providing childcare",
  };

  const toggleRecordStatus = (value: string) => {
    setRecordsStatus((prev) => {
      if (value === "notKnown") {
        return prev.includes(value) ? [] : [value];
      }
      const filtered = prev.filter((v) => v !== "notKnown");
      return prev.includes(value) 
        ? filtered.filter((v) => v !== value)
        : [...filtered, value];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (recordsStatus.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one option in Section B",
        variant: "destructive",
      });
      return;
    }

    if (!checkCompletedDate) {
      toast({
        title: "Validation Error",
        description: "Please enter the date this check was completed",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const formData = {
        token,
        referenceId,
        recordsStatus,
        checkCompletedDate,
        sectionC: recordsStatus.includes("currentProvider") ? {
          uniqueRefNumber,
          otherNames,
          addressKnown,
          dateOfRegistration,
          registeredBodyName,
          registrationStatus,
          lastInspection,
          provisionType,
          registers,
          telephone,
          emailAddress,
          provisionAddress,
          childrenInfo,
          conditions,
          suitabilityInfo,
          inspectionInfo,
          safeguardingConcerns,
        } : null,
        sectionD: recordsStatus.includes("formerOrOther") ? {
          otherNamesD,
          capacityKnown,
          relevantInfo,
        } : null,
        submittedAt: new Date().toISOString(),
      };

      // TODO: Submit to backend when edge function is created
      console.log("Form data:", formData);

      toast({
        title: "Form Submitted",
        description: "Thank you for completing the Known to Ofsted check",
      });
      setSubmitted(true);
    } catch (error) {
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Form Submitted</h1>
          <p className="text-gray-600 mb-4">
            Thank you for completing the Known to Ofsted check. Reference: {referenceId}
          </p>
          <p className="text-sm text-gray-500">
            The response has been sent to {agencyName}.
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
          <span className="text-xl font-bold text-[#1B9AAA]">ReadyKids</span>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{format(new Date(), "d MMMM yyyy")}</span>
            <span className="bg-gray-100 px-3 py-1 rounded font-mono text-xs">{referenceId}</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">'Known to Ofsted' Check Request</h1>
          <p className="text-gray-600">Regulatory information request under the Childcare Act 2006</p>
        </div>

        {/* Notice Box */}
        <div className="bg-[#e6f5f7] border border-[#1B9AAA] border-l-4 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-[#168292] text-sm uppercase mb-2">Important Information</h3>
          <p className="text-sm text-gray-700">
            Under the Childcare Act 2006 and the Childcare (Childminder Agencies) Regulations 2014, 
            {agencyName} is required to contact Ofsted when assessing an applicant's suitability for registration.
          </p>
          <p className="text-sm text-gray-700 mt-2">
            Please complete Sections B, C and/or D as appropriate and submit this form.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section A: Applicant Details (Read-only) */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center gap-4">
              <div className="w-9 h-9 bg-[#1B9AAA] text-white rounded-lg flex items-center justify-center font-bold">A</div>
              <div>
                <h2 className="font-bold text-gray-900">Applicant's Details</h2>
                <p className="text-sm text-gray-500">Submitted by {agencyName}</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Applicant's full name</Label>
                  <Input value={applicantName} readOnly className="bg-gray-50 mt-1" />
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Previous surname(s)</Label>
                  <Input 
                    value={previousNames.map(p => p.name).join(", ")} 
                    readOnly 
                    className="bg-gray-50 mt-1" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Date of birth</Label>
                  <Input value={formatDisplayDate(dateOfBirth)} readOnly className="bg-gray-50 mt-1" />
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Date of request to Ofsted</Label>
                  <Input value={format(new Date(), "dd/MM/yyyy")} readOnly className="bg-gray-50 mt-1" />
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-600">Full address</Label>
                <Textarea 
                  value={`${currentAddress.line1 || ""}\n${currentAddress.line2 || ""}\n${currentAddress.town || ""}\n${currentAddress.postcode || ""}\nDate from: ${formatDisplayDate(currentAddress.moveInDate)}`}
                  readOnly 
                  className="bg-gray-50 mt-1" 
                  rows={4}
                />
              </div>

              {previousAddresses.length > 0 && (
                <div>
                  <Label className="text-sm text-gray-600">Previous address(es)</Label>
                  {previousAddresses.map((addr, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-lg mt-2 text-sm">
                      <p>{addr.address}</p>
                      <p className="text-gray-500">From: {formatDisplayDate(addr.dateFrom)} To: {formatDisplayDate(addr.dateTo)}</p>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <Label className="text-sm text-gray-600">Applicant's role</Label>
                <Input value={roleLabels[role] || role} readOnly className="bg-gray-50 mt-1" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Name of requester</Label>
                  <Input value={requesterName} readOnly className="bg-gray-50 mt-1" />
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Role at agency</Label>
                  <Input value={requesterRole} readOnly className="bg-gray-50 mt-1" />
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-600">Child age information required?</Label>
                <Input value={childInfoRequired ? "Yes" : "No"} readOnly className="bg-gray-50 mt-1" />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-xs font-semibold text-gray-500 uppercase">For Ofsted Use Only</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Section B: Known to Ofsted? */}
          <div className="bg-white border border-gray-400 rounded-xl overflow-hidden">
            <div className="bg-[#f0f4f8] border-b border-gray-300 px-6 py-4 flex items-center gap-4">
              <div className="w-9 h-9 bg-gray-700 text-white rounded-lg flex items-center justify-center font-bold">B</div>
              <div>
                <h2 className="font-bold text-gray-900">Known to Ofsted?</h2>
                <p className="text-sm text-gray-500">To be completed by Ofsted for all applicants</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 flex gap-3">
                <svg className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-gray-600">Please select all options that apply based on your records.</p>
              </div>

              <div className="space-y-3">
                <Label className="font-semibold">Our records indicate that: <span className="text-red-500">*</span></Label>
                
                <div
                  onClick={() => toggleRecordStatus("notKnown")}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    recordsStatus.includes("notKnown") 
                      ? "bg-[#e6f5f7] border-[#1B9AAA]" 
                      : "bg-gray-50 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox checked={recordsStatus.includes("notKnown")} />
                    <span className="text-sm">From the information provided, this individual is not known to Ofsted.</span>
                  </div>
                </div>

                <div
                  onClick={() => toggleRecordStatus("currentProvider")}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    recordsStatus.includes("currentProvider") 
                      ? "bg-[#e6f5f7] border-[#1B9AAA]" 
                      : "bg-gray-50 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox checked={recordsStatus.includes("currentProvider")} />
                    <div>
                      <span className="text-sm">From the information provided, this individual is currently known to Ofsted as a registered provider.</span>
                      <p className="text-xs text-gray-500 mt-1">The information that Ofsted has a duty to share regarding this individual is provided in Section C.</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => toggleRecordStatus("formerOrOther")}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    recordsStatus.includes("formerOrOther") 
                      ? "bg-[#e6f5f7] border-[#1B9AAA]" 
                      : "bg-gray-50 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox checked={recordsStatus.includes("formerOrOther")} />
                    <div>
                      <span className="text-sm">From the information provided, this individual is known to Ofsted either as a former registered provider, or in any capacity other than registered provider.</span>
                      <p className="text-xs text-gray-500 mt-1">The information that Ofsted has the power to share regarding this individual is provided in Section D.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="checkCompletedDate">Date this check was completed by Ofsted <span className="text-red-500">*</span></Label>
                <Input 
                  id="checkCompletedDate"
                  type="date" 
                  value={checkCompletedDate}
                  onChange={(e) => setCheckCompletedDate(e.target.value)}
                  className="mt-1 max-w-xs"
                />
              </div>
            </div>
          </div>

          {/* Section C: Current Registered Providers */}
          {recordsStatus.includes("currentProvider") && (
            <div className="bg-white border border-gray-400 rounded-xl overflow-hidden animate-in slide-in-from-top-2">
              <div className="bg-[#f0f4f8] border-b border-gray-300 px-6 py-4 flex items-center gap-4">
                <div className="w-9 h-9 bg-gray-700 text-white rounded-lg flex items-center justify-center font-bold">C</div>
                <div>
                  <h2 className="font-bold text-gray-900">Current Registered Providers</h2>
                  <p className="text-sm text-gray-500">To be completed by Ofsted for any applicant who is currently a registered provider</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="uniqueRefNumber">Unique reference number</Label>
                    <Input id="uniqueRefNumber" value={uniqueRefNumber} onChange={(e) => setUniqueRefNumber(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="otherNames">Any names on record not listed in Section A</Label>
                    <Input id="otherNames" value={otherNames} onChange={(e) => setOtherNames(e.target.value)} className="mt-1" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="addressKnown">Address known to Ofsted</Label>
                  <Textarea id="addressKnown" value={addressKnown} onChange={(e) => setAddressKnown(e.target.value)} className="mt-1" rows={2} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dateOfRegistration">Date of registration</Label>
                    <Input id="dateOfRegistration" type="date" value={dateOfRegistration} onChange={(e) => setDateOfRegistration(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="registeredBodyName">Registered body name</Label>
                    <Input id="registeredBodyName" value={registeredBodyName} onChange={(e) => setRegisteredBodyName(e.target.value)} className="mt-1" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="registrationStatus">Current status of registration</Label>
                    <select 
                      id="registrationStatus"
                      value={registrationStatus}
                      onChange={(e) => setRegistrationStatus(e.target.value)}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
                    >
                      <option value="">Select status</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="lastInspection">Date and outcome of last inspection</Label>
                    <Input id="lastInspection" value={lastInspection} onChange={(e) => setLastInspection(e.target.value)} placeholder="e.g. 15/03/2023 - Good" className="mt-1" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="provisionType">Provision type</Label>
                    <select 
                      id="provisionType"
                      value={provisionType}
                      onChange={(e) => setProvisionType(e.target.value)}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
                    >
                      <option value="">Select type</option>
                      <option value="childminder">Childminder</option>
                      <option value="nonDomestic">Childcare on non-domestic premises</option>
                      <option value="domestic">Childcare on domestic premises</option>
                      <option value="nanny">Nanny</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="registers">Register(s) and Chapter(s) of the Act</Label>
                    <Input id="registers" value={registers} onChange={(e) => setRegisters(e.target.value)} placeholder="EYR/Ch2, CCR/Ch3, VCR/Ch4" className="mt-1" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="telephone">Telephone number</Label>
                    <Input id="telephone" type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="emailAddress">Email address</Label>
                    <Input id="emailAddress" type="email" value={emailAddress} onChange={(e) => setEmailAddress(e.target.value)} className="mt-1" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="provisionAddress">Full address of provision</Label>
                  <Textarea id="provisionAddress" value={provisionAddress} onChange={(e) => setProvisionAddress(e.target.value)} className="mt-1" rows={2} />
                </div>

                {childInfoRequired && (
                  <div>
                    <Label htmlFor="childrenInfo">Number/ages of children to whom childcare is provided</Label>
                    <Textarea id="childrenInfo" value={childrenInfo} onChange={(e) => setChildrenInfo(e.target.value)} className="mt-1" rows={2} />
                  </div>
                )}

                <div>
                  <Label htmlFor="conditions">Conditions listed against the registration</Label>
                  <Textarea id="conditions" value={conditions} onChange={(e) => setConditions(e.target.value)} className="mt-1" rows={3} />
                </div>

                <div>
                  <Label htmlFor="suitabilityInfo">Information that Ofsted has obtained or received when considering the person's suitability for registration</Label>
                  <Textarea id="suitabilityInfo" value={suitabilityInfo} onChange={(e) => setSuitabilityInfo(e.target.value)} className="mt-1" rows={4} />
                </div>

                <div>
                  <Label htmlFor="inspectionInfo">Any relevant information obtained or received at an inspection or regulatory visit, and information about any enforcement action taken</Label>
                  <Textarea id="inspectionInfo" value={inspectionInfo} onChange={(e) => setInspectionInfo(e.target.value)} className="mt-1" rows={4} />
                </div>

                <div>
                  <Label htmlFor="safeguardingConcerns">Any safeguarding concerns arising from a notification/complaint that Ofsted feels are proportionate and necessary to share</Label>
                  <Textarea id="safeguardingConcerns" value={safeguardingConcerns} onChange={(e) => setSafeguardingConcerns(e.target.value)} className="mt-1" rows={4} />
                </div>
              </div>
            </div>
          )}

          {/* Section D: Former Registered Providers / Other Roles */}
          {recordsStatus.includes("formerOrOther") && (
            <div className="bg-white border border-gray-400 rounded-xl overflow-hidden animate-in slide-in-from-top-2">
              <div className="bg-[#f0f4f8] border-b border-gray-300 px-6 py-4 flex items-center gap-4">
                <div className="w-9 h-9 bg-gray-700 text-white rounded-lg flex items-center justify-center font-bold">D</div>
                <div>
                  <h2 className="font-bold text-gray-900">Former Registered Providers / Other Roles</h2>
                  <p className="text-sm text-gray-500">To be completed by Ofsted for any applicant who was formerly a registered provider, or is known to Ofsted in any other capacity</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <Label htmlFor="otherNamesD">Any names on record not listed in Section A</Label>
                  <Input id="otherNamesD" value={otherNamesD} onChange={(e) => setOtherNamesD(e.target.value)} className="mt-1" />
                </div>

                <div>
                  <Label htmlFor="capacityKnown">Capacity/capacities the individual was known in</Label>
                  <Textarea id="capacityKnown" value={capacityKnown} onChange={(e) => setCapacityKnown(e.target.value)} className="mt-1" rows={3} />
                </div>

                <div>
                  <Label htmlFor="relevantInfo">Any information that Ofsted holds relating to this individual that it considers appropriate to share</Label>
                  <Textarea id="relevantInfo" value={relevantInfo} onChange={(e) => setRelevantInfo(e.target.value)} className="mt-1" rows={6} />
                </div>
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={() => window.print()}>
              Print Form
            </Button>
            <Button type="submit" disabled={submitting} className="bg-[#1B9AAA] hover:bg-[#168292]">
              {submitting ? "Submitting..." : "Submit Response"}
            </Button>
          </div>
        </form>

        {/* Footer */}
        <footer className="text-center py-8 text-sm text-gray-500 border-t border-gray-200 mt-8">
          <p className="font-semibold">{agencyName}</p>
          <p>Operating under the Childcare Act 2006 | Registered with Ofsted</p>
        </footer>
      </main>
    </div>
  );
};

export default OfstedForm;
