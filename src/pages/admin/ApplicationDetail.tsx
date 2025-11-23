import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Save, X, ArrowRight, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { pdf } from '@react-pdf/renderer';
import { ApplicationPDF } from "@/components/admin/ApplicationPDF";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChildminderApplication } from "@/types/childminder";
import { ProgressBar } from "@/components/apply/ProgressBar";
import { ErrorSummary } from "@/components/apply/ErrorSummary";
import { GovUKButton } from "@/components/apply/GovUKButton";
import { Section1PersonalDetails } from "@/components/apply/Section1PersonalDetails";
import { Section2AddressHistory } from "@/components/apply/Section2AddressHistory";
import { Section3Premises } from "@/components/apply/Section3Premises";
import { Section4Service } from "@/components/apply/Section4Service";
import { Section5Qualifications } from "@/components/apply/Section5Qualifications";
import { Section6Employment } from "@/components/apply/Section6Employment";
import { Section7People } from "@/components/apply/Section7People";
import { Section8Suitability } from "@/components/apply/Section8Suitability";
import { Section9Declaration } from "@/components/apply/Section9Declaration";
import { getValidatorForSection } from "@/lib/formValidation";

interface DBApplication {
  id: string;
  title: string;
  first_name: string;
  middle_names: string;
  last_name: string;
  place_of_birth: string;
  email: string;
  phone_mobile: string;
  phone_home: string;
  date_of_birth: string;
  gender: string;
  national_insurance_number: string;
  status: string;
  created_at: string;
  current_address: any;
  address_history: any;
  premises_address: any;
  service_type: string;
  service_age_range: any;
  service_capacity: any;
  service_hours: any;
  service_local_authority: string;
  service_ofsted_registered: string;
  service_ofsted_number: string;
  employment_history: any;
  qualifications: any;
  training_courses: any;
  people_in_household: any;
  people_regular_contact: any;
  previous_names: any;
  health_conditions: string;
  health_details: string;
  criminal_convictions: string;
  convictions_details: string;
  safeguarding_concerns: string;
  safeguarding_details: string;
  previous_registration: string;
  registration_details: any;
  premises_ownership: string;
  premises_animals: string;
  premises_animal_details: string;
  premises_landlord_details: any;
  premises_other_residents: any;
  declaration_confirmed: boolean;
  declaration_date: string;
  declaration_signature: string;
  user_id: string;
  updated_at: string;
}

const ApplicationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentSection, setCurrentSection] = useState(1);
  const [errors, setErrors] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);
  const [dbApplication, setDbApplication] = useState<DBApplication | null>(null);
  const totalSections = 9;

  const form = useForm<Partial<ChildminderApplication>>({
    defaultValues: {
      previousNames: [],
      addressHistory: [],
      additionalPremises: [],
      ageGroups: [],
      childcareTimes: [],
      employmentHistory: [],
      assistants: [],
      adults: [],
      children: [],
      prevRegOfstedDetails: [],
      prevRegAgencyDetails: [],
      prevRegOtherUKDetails: [],
      prevRegEUDetails: [],
      offenceDetails: [],
    },
  });

  useEffect(() => {
    checkAdminAccess();
  }, [id]);

  const checkAdminAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/admin/login');
      return;
    }

    const { data: roles } = await supabase
      .from('user_roles' as any)
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roles) {
      toast({
        title: "Access Denied",
        description: "You do not have admin privileges.",
        variant: "destructive",
      });
      navigate('/admin/login');
      return;
    }

    fetchApplication();
  };

  const mapDBToForm = (data: DBApplication): Partial<ChildminderApplication> => {
    const qualifications = data.qualifications || {};
    const serviceCapacity = data.service_capacity || {};
    const peopleInHousehold = data.people_in_household || {};
    const registrationDetails = data.registration_details || {};

    return {
      title: data.title,
      firstName: data.first_name,
      middleNames: data.middle_names,
      lastName: data.last_name,
      email: data.email,
      phone: data.phone_mobile,
      dob: data.date_of_birth,
      gender: data.gender as any,
      niNumber: data.national_insurance_number,
      previousNames: data.previous_names || [],
      homeAddress: data.current_address,
      addressHistory: data.address_history || [],
      childcareAddress: data.premises_address,
      premisesType: data.premises_ownership as any,
      pets: data.premises_animals as any,
      petsDetails: data.premises_animal_details,
      localAuthority: data.service_local_authority,
      ageGroups: data.service_age_range || [],
      proposedUnder1: serviceCapacity.under1,
      proposedUnder5: serviceCapacity.under5,
      proposed5to8: serviceCapacity.ages5to8,
      proposed8plus: serviceCapacity.ages8plus,
      childcareTimes: data.service_hours || [],
      firstAid: qualifications.firstAid || { completed: "No" },
      safeguarding: qualifications.safeguarding,
      eyfsChildminding: qualifications.eyfsChildminding,
      level2Qual: qualifications.level2Qual,
      employmentHistory: data.employment_history || [],
      assistants: data.people_regular_contact || [],
      adults: peopleInHousehold.adults || [],
      children: peopleInHousehold.children || [],
      prevRegOfsted: data.previous_registration as any,
      prevRegOfstedDetails: registrationDetails.ofsted || [],
      prevRegAgencyDetails: registrationDetails.agency || [],
      prevRegOtherUKDetails: registrationDetails.otherUK || [],
      prevRegEUDetails: registrationDetails.eu || [],
      healthCondition: data.health_conditions as any,
      healthConditionDetails: data.health_details,
      offenceHistory: data.criminal_convictions as any,
      offenceDetails: data.convictions_details ? JSON.parse(data.convictions_details) : [],
      socialServices: data.safeguarding_concerns as any,
      socialServicesDetails: data.safeguarding_details,
      declarationAccuracy: data.declaration_confirmed,
      signatureFullName: data.declaration_signature,
      signatureDate: data.declaration_date,
    };
  };

  const fetchApplication = async () => {
    try {
      const { data, error } = await supabase
        .from('childminder_applications' as any)
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          title: "Not Found",
          description: "Application not found",
          variant: "destructive",
        });
        navigate('/admin/applications');
        return;
      }

      setDbApplication(data as unknown as DBApplication);
      
      // Map database data to form format
      const formData = mapDBToForm(data as unknown as DBApplication);
      form.reset(formData);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load application",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('childminder_applications' as any)
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setDbApplication(prev => prev ? { ...prev, status: newStatus } : null);
      toast({
        title: "Status Updated",
        description: `Application ${newStatus}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const nextSection = () => {
    const validator = getValidatorForSection(currentSection);
    const validation = validator(form.getValues());
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    
    setErrors([]);
    if (currentSection < totalSections) {
      setCurrentSection(currentSection + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevSection = () => {
    setErrors([]);
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const saveChanges = async () => {
    // Validate all sections
    const allErrors: string[] = [];
    for (let section = 1; section <= totalSections; section++) {
      const validator = getValidatorForSection(section);
      const validation = validator(form.getValues());
      if (!validation.isValid) {
        allErrors.push(...validation.errors.map(err => `Section ${section}: ${err}`));
      }
    }

    if (allErrors.length > 0) {
      setErrors(allErrors);
      setCurrentSection(1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setUpdating(true);
    try {
      const data = form.getValues();
      
      const { error } = await supabase
        .from('childminder_applications' as any)
        .update({
          title: data.title,
          first_name: data.firstName,
          middle_names: data.middleNames,
          last_name: data.lastName,
          gender: data.gender,
          date_of_birth: data.dob,
          previous_names: data.previousNames,
          national_insurance_number: data.niNumber,
          email: data.email,
          phone_mobile: data.phone,
          current_address: data.homeAddress,
          address_history: data.addressHistory,
          premises_address: data.childcareAddress || data.homeAddress,
          premises_ownership: data.premisesType,
          premises_animals: data.pets,
          premises_animal_details: data.petsDetails,
          service_type: data.premisesType,
          service_age_range: data.ageGroups,
          service_capacity: {
            under1: data.proposedUnder1,
            under5: data.proposedUnder5,
            ages5to8: data.proposed5to8,
            ages8plus: data.proposed8plus
          },
          service_hours: data.childcareTimes,
          service_local_authority: data.localAuthority,
          qualifications: {
            firstAid: data.firstAid,
            safeguarding: data.safeguarding,
            eyfsChildminding: data.eyfsChildminding,
            level2Qual: data.level2Qual
          },
          employment_history: data.employmentHistory,
          people_in_household: {
            adults: data.adults,
            children: data.children
          },
          people_regular_contact: data.assistants,
          previous_registration: data.prevRegOfsted,
          registration_details: {
            ofsted: data.prevRegOfstedDetails,
            agency: data.prevRegAgencyDetails,
            otherUK: data.prevRegOtherUKDetails,
            eu: data.prevRegEUDetails
          },
          health_conditions: data.healthCondition,
          health_details: data.healthConditionDetails,
          criminal_convictions: data.offenceHistory,
          convictions_details: data.offenceDetails ? JSON.stringify(data.offenceDetails) : null,
          safeguarding_concerns: data.socialServices,
          safeguarding_details: data.socialServicesDetails,
          declaration_confirmed: data.declarationAccuracy,
          declaration_signature: data.signatureFullName,
          declaration_date: data.signatureDate,
        } as any)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Changes Saved",
        description: "Application updated successfully",
      });
      
      setIsEditMode(false);
      setCurrentSection(1);
      fetchApplication();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const formData = form.getValues();
      const blob = await pdf(
        <ApplicationPDF 
          application={formData}
          applicationId={id || ''}
          submittedDate={dbApplication?.created_at || ''}
          status={dbApplication?.status || 'pending'}
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `application-${formData.firstName}-${formData.lastName}-${id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "PDF Downloaded",
        description: "Application has been downloaded successfully",
      });
    } catch (error: any) {
      console.error('PDF generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const renderSection = () => {
    switch (currentSection) {
      case 1:
        return <Section1PersonalDetails form={form} />;
      case 2:
        return <Section2AddressHistory form={form} />;
      case 3:
        return <Section3Premises form={form} />;
      case 4:
        return <Section4Service form={form} />;
      case 5:
        return <Section5Qualifications form={form} />;
      case 6:
        return <Section6Employment form={form} />;
      case 7:
        return <Section7People form={form} />;
      case 8:
        return <Section8Suitability form={form} />;
      case 9:
        return <Section9Declaration form={form} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading application...</p>
        </div>
      </div>
    );
  }

  if (!dbApplication) {
    return null;
  }

  if (isEditMode) {
    return (
      <div className="min-h-screen bg-[hsl(var(--govuk-grey-background))]">
        <header className="bg-[hsl(var(--govuk-black))] text-white border-b-[10px] border-white">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-2xl font-bold mr-4">Ready Kids</span>
                <span className="text-lg border-l pl-4 border-white/30">
                  Edit Application
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => {
                  setIsEditMode(false);
                  setCurrentSection(1);
                  setErrors([]);
                  fetchApplication();
                }}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          <p className="text-sm">
            <button onClick={() => navigate('/admin/applications')} className="underline text-primary hover:text-primary/80">
              Back to applications
            </button>
          </p>
        </div>

        <main className="container mx-auto px-4 md:px-8 pb-16">
          <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 shadow-lg">
            <h1 className="text-4xl font-extrabold mb-6 leading-tight text-foreground">
              Edit Application
            </h1>

            <ErrorSummary errors={errors} onClose={() => setErrors([])} />

            <ProgressBar currentSection={currentSection} totalSections={totalSections} />

            <form onSubmit={(e) => e.preventDefault()} noValidate>
              {renderSection()}

              <div className="flex gap-4 mt-8 pt-6 border-t border-border">
                {currentSection > 1 && (
                  <GovUKButton
                    type="button"
                    variant="secondary"
                    onClick={prevSection}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </GovUKButton>
                )}

                {currentSection < totalSections ? (
                  <GovUKButton
                    type="button"
                    variant="primary"
                    onClick={nextSection}
                    className="flex items-center gap-2 ml-auto"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </GovUKButton>
                ) : (
                  <GovUKButton
                    type="button"
                    variant="primary"
                    onClick={saveChanges}
                    disabled={updating}
                    className="ml-auto flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {updating ? "Saving..." : "Save Changes"}
                  </GovUKButton>
                )}
              </div>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // View Mode
  const formData = form.getValues();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center flex-wrap gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/applications')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Applications
          </Button>
          <div className="flex gap-2 items-center flex-wrap">
            {getStatusBadge(dbApplication.status)}
            <Select value={dbApplication.status} onValueChange={updateStatus} disabled={updating}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Change status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setIsEditMode(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Application
            </Button>
            <Button onClick={handleDownloadPDF} variant="secondary">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {formData.title} {formData.firstName} {formData.middleNames} {formData.lastName}
            </h1>
            <p className="text-muted-foreground">
              Submitted on {format(new Date(dbApplication.created_at), "MMMM dd, yyyy 'at' HH:mm")}
            </p>
          </div>

          <div className="space-y-8">
            {/* Section 1: Personal Details */}
            <section className="border-l-4 border-primary pl-6">
              <h2 className="text-2xl font-bold mb-4">1. Personal Details</h2>
              <dl className="grid md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Title</dt>
                  <dd className="mt-1">{formData.title}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">First Name</dt>
                  <dd className="mt-1">{formData.firstName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Middle Names</dt>
                  <dd className="mt-1">{formData.middleNames || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Last Name</dt>
                  <dd className="mt-1">{formData.lastName}</dd>
                </div>
                {formData.previousNames && formData.previousNames.length > 0 && (
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-muted-foreground">Previous Names</dt>
                    <dd className="mt-1 space-y-1">
                      {formData.previousNames.map((name: any, idx: number) => (
                        <div key={idx} className="text-sm">
                          {name.fullName} <span className="text-muted-foreground">({name.dateFrom} to {name.dateTo})</span>
                        </div>
                      ))}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Gender</dt>
                  <dd className="mt-1">{formData.gender}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Date of Birth</dt>
                  <dd className="mt-1">{formData.dob ? format(new Date(formData.dob), "MMMM dd, yyyy") : "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Place of Birth</dt>
                  <dd className="mt-1">{dbApplication.place_of_birth || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Right to Work</dt>
                  <dd className="mt-1">{(formData as any).rightToWork || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">National Insurance Number</dt>
                  <dd className="mt-1">{formData.niNumber}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                  <dd className="mt-1">{formData.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Mobile Phone</dt>
                  <dd className="mt-1">{formData.phone}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Home Phone</dt>
                  <dd className="mt-1">{dbApplication.phone_home || "N/A"}</dd>
                </div>
              </dl>
            </section>

            {/* Section 2: Address */}
            <section className="border-l-4 border-primary pl-6">
              <h2 className="text-2xl font-bold mb-4">2. Address History</h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Current Address</dt>
                  <dd className="mt-1">
                    {formData.homeAddress?.line1}<br />
                    {formData.homeAddress?.line2 && <>{formData.homeAddress.line2}<br /></>}
                    {formData.homeAddress?.town}<br />
                    {formData.homeAddress?.postcode}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Moved in</dt>
                  <dd className="mt-1">{(formData as any).homeMoveIn || "N/A"}</dd>
                </div>
                {formData.addressHistory && formData.addressHistory.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Previous Addresses (5 Year History)</dt>
                    <dd className="mt-1 space-y-2">
                      {formData.addressHistory.map((addr: any, idx: number) => (
                        <div key={idx} className="text-sm border-l-2 border-muted pl-3">
                          <div className="font-medium">{addr.address?.line1}, {addr.address?.town}, {addr.address?.postcode}</div>
                          <div className="text-muted-foreground">
                            Moved in: {addr.moveIn} | Moved out: {addr.moveOut}
                          </div>
                        </div>
                      ))}
                    </dd>
                  </div>
                )}
                {(formData as any).addressGaps && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Explanation for Address Gaps</dt>
                    <dd className="mt-1">{(formData as any).addressGaps}</dd>
                  </div>
                )}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Lived Outside UK</dt>
                    <dd className="mt-1">{(formData as any).livedOutsideUK || "N/A"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Lived on Military Base</dt>
                    <dd className="mt-1">{(formData as any).militaryBase || "N/A"}</dd>
                  </div>
                </div>
              </dl>
            </section>

            {/* Section 3: Premises */}
            <section className="border-l-4 border-primary pl-6">
              <h2 className="text-2xl font-bold mb-4">3. Premises</h2>
              <dl className="grid md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Local Authority</dt>
                  <dd className="mt-1">{formData.localAuthority}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Premises Type</dt>
                  <dd className="mt-1">{formData.premisesType}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Same as Home Address</dt>
                  <dd className="mt-1">{(formData as any).sameAddress || "N/A"}</dd>
                </div>
                {formData.childcareAddress && (formData as any).sameAddress === "No" && (
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-muted-foreground">Childcare Address</dt>
                    <dd className="mt-1">
                      {formData.childcareAddress?.line1}<br />
                      {formData.childcareAddress?.line2 && <>{formData.childcareAddress.line2}<br /></>}
                      {formData.childcareAddress?.town}<br />
                      {formData.childcareAddress?.postcode}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Additional Premises</dt>
                  <dd className="mt-1">{(formData as any).useAdditionalPremises || "N/A"}</dd>
                </div>
                {(formData as any).additionalPremises && (formData as any).additionalPremises.length > 0 && (
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-muted-foreground">Additional Premises Details</dt>
                    <dd className="mt-1 space-y-2">
                      {(formData as any).additionalPremises.map((premise: any, idx: number) => (
                        <div key={idx} className="text-sm border-l-2 border-muted pl-3">
                          <div className="font-medium">{premise.address}</div>
                          <div className="text-muted-foreground">Reason: {premise.reason}</div>
                        </div>
                      ))}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Outdoor Space</dt>
                  <dd className="mt-1">{(formData as any).outdoorSpace || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Pets</dt>
                  <dd className="mt-1">{formData.pets}</dd>
                </div>
                {formData.petsDetails && (
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-muted-foreground">Pet Details</dt>
                    <dd className="mt-1">{formData.petsDetails}</dd>
                  </div>
                )}
              </dl>
            </section>

            {/* Section 4: Service */}
            <section className="border-l-4 border-primary pl-6">
              <h2 className="text-2xl font-bold mb-4">4. Service Details</h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Age Groups</dt>
                  <dd className="mt-1">{formData.ageGroups?.join(", ") || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Work With Others</dt>
                  <dd className="mt-1">{(formData as any).workWithOthers || "N/A"}</dd>
                </div>
                {(formData as any).workWithOthers === "Yes" && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Number of Assistants</dt>
                    <dd className="mt-1">{(formData as any).numberOfAssistants || 0}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Proposed Capacity</dt>
                  <dd className="mt-1 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>Under 1: {formData.proposedUnder1 || 0}</div>
                    <div>Under 5: {formData.proposedUnder5 || 0}</div>
                    <div>5-8 years: {formData.proposed5to8 || 0}</div>
                    <div>8+ years: {formData.proposed8plus || 0}</div>
                  </dd>
                </div>
                {formData.childcareTimes && formData.childcareTimes.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Childcare Times</dt>
                    <dd className="mt-1">{formData.childcareTimes.join(", ")}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Overnight Care</dt>
                  <dd className="mt-1">{(formData as any).overnightCare || "N/A"}</dd>
                </div>
              </dl>
            </section>

            {/* Section 5: Qualifications */}
            <section className="border-l-4 border-primary pl-6">
              <h2 className="text-2xl font-bold mb-4">5. Qualifications & Training</h2>
              <dl className="space-y-6">
                <div className="space-y-2">
                  <dt className="text-sm font-medium text-muted-foreground">First Aid Training</dt>
                  <dd className="mt-1 grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                      <div>{formData.firstAid?.completed || "No"}</div>
                    </div>
                    {formData.firstAid?.completed === "Yes" && (
                      <>
                        <div>
                          <div className="text-xs text-muted-foreground">Provider</div>
                          <div>{formData.firstAid.provider || "N/A"}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Completion Date</div>
                          <div>{formData.firstAid.completionDate || "N/A"}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Certificate Number</div>
                          <div>{formData.firstAid.certificateNumber || "N/A"}</div>
                        </div>
                      </>
                    )}
                  </dd>
                </div>
                {formData.safeguarding && (
                  <div className="space-y-2">
                    <dt className="text-sm font-medium text-muted-foreground">Safeguarding Training</dt>
                    <dd className="mt-1 grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground">Completed</div>
                        <div>{formData.safeguarding.completed || "No"}</div>
                      </div>
                      {formData.safeguarding.completed === "Yes" && (
                        <>
                          <div>
                            <div className="text-xs text-muted-foreground">Provider</div>
                            <div>{formData.safeguarding.provider || "N/A"}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Completion Date</div>
                            <div>{formData.safeguarding.completionDate || "N/A"}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Certificate Number</div>
                            <div>{formData.safeguarding.certificateNumber || "N/A"}</div>
                          </div>
                        </>
                      )}
                    </dd>
                  </div>
                )}
                {formData.eyfsChildminding && (
                  <div className="space-y-2">
                    <dt className="text-sm font-medium text-muted-foreground">EYFS/Childminding Course</dt>
                    <dd className="mt-1 grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground">Completed</div>
                        <div>{formData.eyfsChildminding.completed || "No"}</div>
                      </div>
                      {formData.eyfsChildminding.completed === "Yes" && (
                        <>
                          <div>
                            <div className="text-xs text-muted-foreground">Provider</div>
                            <div>{formData.eyfsChildminding.provider || "N/A"}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Completion Date</div>
                            <div>{formData.eyfsChildminding.completionDate || "N/A"}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Certificate Number</div>
                            <div>{formData.eyfsChildminding.certificateNumber || "N/A"}</div>
                          </div>
                        </>
                      )}
                    </dd>
                  </div>
                )}
                {formData.level2Qual && (
                  <div className="space-y-2">
                    <dt className="text-sm font-medium text-muted-foreground">Level 2 Qualification</dt>
                    <dd className="mt-1 grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground">Completed</div>
                        <div>{formData.level2Qual.completed || "No"}</div>
                      </div>
                      {formData.level2Qual.completed === "Yes" && (
                        <>
                          <div>
                            <div className="text-xs text-muted-foreground">Provider</div>
                            <div>{formData.level2Qual.provider || "N/A"}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Completion Date</div>
                            <div>{formData.level2Qual.completionDate || "N/A"}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Certificate Number</div>
                            <div>{formData.level2Qual.certificateNumber || "N/A"}</div>
                          </div>
                        </>
                      )}
                    </dd>
                  </div>
                )}
              </dl>
            </section>

            {/* Section 6: Employment */}
            <section className="border-l-4 border-primary pl-6">
              <h2 className="text-2xl font-bold mb-4">6. Employment History & References</h2>
              <dl className="space-y-6">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground mb-2">Employment/Education History (5 Years)</dt>
                  {formData.employmentHistory && formData.employmentHistory.length > 0 ? (
                    <dd className="space-y-4">
                      {formData.employmentHistory.map((job: any, idx: number) => (
                        <div key={idx} className="border-l-2 border-muted pl-4 pb-3">
                          <h3 className="font-medium">{job.role} at {job.employer}</h3>
                          <p className="text-sm text-muted-foreground">
                            {job.startDate} to {job.endDate}
                          </p>
                          <p className="text-sm mt-1"><span className="font-medium">Reason for leaving:</span> {job.reasonForLeaving}</p>
                        </div>
                      ))}
                    </dd>
                  ) : (
                    <dd className="text-muted-foreground">No employment history provided</dd>
                  )}
                </div>
                {(formData as any).employmentGaps && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Explanation for Gaps</dt>
                    <dd className="mt-1">{(formData as any).employmentGaps}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Previously Worked/Volunteered with Children</dt>
                  <dd className="mt-1">{(formData as any).childVolunteered || "N/A"}</dd>
                </div>
                {(formData as any).childVolunteered === "Yes" && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Consent to Contact Previous Employers</dt>
                    <dd className="mt-1">{(formData as any).childVolunteeredConsent ? "Yes" : "No"}</dd>
                  </div>
                )}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-bold mb-4">References</h3>
                  <div className="space-y-6">
                    <div className="bg-muted/30 p-4 rounded">
                      <h4 className="font-medium mb-3">Reference 1</h4>
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-xs text-muted-foreground">Full Name</div>
                          <div>{(formData as any).reference1Name || "N/A"}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Relationship</div>
                          <div>{(formData as any).reference1Relationship || "N/A"}</div>
                        </div>
                        <div className="md:col-span-2">
                          <div className="text-xs text-muted-foreground">Contact Details</div>
                          <div>{(formData as any).reference1Contact || "N/A"}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Childcare Reference</div>
                          <div>{(formData as any).reference1Childcare || "N/A"}</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-muted/30 p-4 rounded">
                      <h4 className="font-medium mb-3">Reference 2</h4>
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-xs text-muted-foreground">Full Name</div>
                          <div>{(formData as any).reference2Name || "N/A"}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Relationship</div>
                          <div>{(formData as any).reference2Relationship || "N/A"}</div>
                        </div>
                        <div className="md:col-span-2">
                          <div className="text-xs text-muted-foreground">Contact Details</div>
                          <div>{(formData as any).reference2Contact || "N/A"}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Childcare Reference</div>
                          <div>{(formData as any).reference2Childcare || "N/A"}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </dl>
            </section>

            {/* Section 7: People Connected */}
            <section className="border-l-4 border-primary pl-6">
              <h2 className="text-2xl font-bold mb-4">7. People Connected to Application</h2>
              <dl className="space-y-4">
                {formData.assistants && formData.assistants.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Assistants</dt>
                    <dd className="mt-1 space-y-2">
                      {formData.assistants.map((person: any, idx: number) => (
                        <div key={idx} className="text-sm bg-muted/30 p-3 rounded">
                          <div className="font-medium">{person.fullName}</div>
                          <div className="text-muted-foreground">Relationship: {person.relationship}</div>
                          <div className="text-muted-foreground">DOB: {person.dob}</div>
                        </div>
                      ))}
                    </dd>
                  </div>
                )}
                {formData.adults && formData.adults.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Adults in Household</dt>
                    <dd className="mt-1 space-y-2">
                      {formData.adults.map((person: any, idx: number) => (
                        <div key={idx} className="text-sm bg-muted/30 p-3 rounded">
                          <div className="font-medium">{person.fullName}</div>
                          <div className="text-muted-foreground">Relationship: {person.relationship}</div>
                          <div className="text-muted-foreground">DOB: {person.dob}</div>
                        </div>
                      ))}
                    </dd>
                  </div>
                )}
                {formData.children && formData.children.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Children in Household</dt>
                    <dd className="mt-1 space-y-2">
                      {formData.children.map((child: any, idx: number) => (
                        <div key={idx} className="text-sm bg-muted/30 p-3 rounded">
                          <div className="font-medium">{child.fullName}</div>
                          <div className="text-muted-foreground">DOB: {child.dob}</div>
                        </div>
                      ))}
                    </dd>
                  </div>
                )}
                {(!formData.assistants || formData.assistants.length === 0) && 
                 (!formData.adults || formData.adults.length === 0) && 
                 (!formData.children || formData.children.length === 0) && (
                  <p className="text-muted-foreground">No people connected to application</p>
                )}
              </dl>
            </section>

            {/* Section 8: Suitability */}
            <section className="border-l-4 border-primary pl-6">
              <h2 className="text-2xl font-bold mb-4">8. Suitability & Vetting</h2>
              <dl className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Previous Registrations</h3>
                  <div className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Previously Registered with Ofsted</dt>
                      <dd className="mt-1">{formData.prevRegOfsted || "N/A"}</dd>
                      {formData.prevRegOfsted === "Yes" && formData.prevRegOfstedDetails && formData.prevRegOfstedDetails.length > 0 && (
                        <dd className="mt-2 space-y-2">
                          {formData.prevRegOfstedDetails.map((reg: any, idx: number) => (
                            <div key={idx} className="text-sm bg-muted/30 p-3 rounded">
                              <div><span className="font-medium">Regulator:</span> {reg.regulator}</div>
                              <div><span className="font-medium">Registration Number:</span> {reg.registrationNumber}</div>
                              <div><span className="font-medium">Dates:</span> {reg.dates}</div>
                              <div><span className="font-medium">Status:</span> {reg.status}</div>
                            </div>
                          ))}
                        </dd>
                      )}
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Previously Registered with Agency</dt>
                      <dd className="mt-1">{(formData as any).prevRegAgency || "N/A"}</dd>
                      {(formData as any).prevRegAgency === "Yes" && formData.prevRegAgencyDetails && formData.prevRegAgencyDetails.length > 0 && (
                        <dd className="mt-2 space-y-2">
                          {formData.prevRegAgencyDetails.map((reg: any, idx: number) => (
                            <div key={idx} className="text-sm bg-muted/30 p-3 rounded">
                              <div><span className="font-medium">Regulator:</span> {reg.regulator}</div>
                              <div><span className="font-medium">Registration Number:</span> {reg.registrationNumber}</div>
                              <div><span className="font-medium">Dates:</span> {reg.dates}</div>
                              <div><span className="font-medium">Status:</span> {reg.status}</div>
                            </div>
                          ))}
                        </dd>
                      )}
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Previously Registered in Other UK Jurisdiction</dt>
                      <dd className="mt-1">{(formData as any).prevRegOtherUK || "N/A"}</dd>
                      {(formData as any).prevRegOtherUK === "Yes" && formData.prevRegOtherUKDetails && formData.prevRegOtherUKDetails.length > 0 && (
                        <dd className="mt-2 space-y-2">
                          {formData.prevRegOtherUKDetails.map((reg: any, idx: number) => (
                            <div key={idx} className="text-sm bg-muted/30 p-3 rounded">
                              <div><span className="font-medium">Regulator:</span> {reg.regulator}</div>
                              <div><span className="font-medium">Registration Number:</span> {reg.registrationNumber}</div>
                              <div><span className="font-medium">Dates:</span> {reg.dates}</div>
                              <div><span className="font-medium">Status:</span> {reg.status}</div>
                            </div>
                          ))}
                        </dd>
                      )}
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Previously Registered in EU/EEA</dt>
                      <dd className="mt-1">{(formData as any).prevRegEU || "N/A"}</dd>
                      {(formData as any).prevRegEU === "Yes" && formData.prevRegEUDetails && formData.prevRegEUDetails.length > 0 && (
                        <dd className="mt-2 space-y-2">
                          {formData.prevRegEUDetails.map((reg: any, idx: number) => (
                            <div key={idx} className="text-sm bg-muted/30 p-3 rounded">
                              <div><span className="font-medium">Regulator:</span> {reg.regulator}</div>
                              <div><span className="font-medium">Registration Number:</span> {reg.registrationNumber}</div>
                              <div><span className="font-medium">Dates:</span> {reg.dates}</div>
                              <div><span className="font-medium">Status:</span> {reg.status}</div>
                            </div>
                          ))}
                        </dd>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">Health & Lifestyle</h3>
                  <div className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Health Conditions</dt>
                      <dd className="mt-1">{formData.healthCondition}</dd>
                      {formData.healthCondition === "Yes" && formData.healthConditionDetails && (
                        <dd className="mt-2 text-sm bg-muted/30 p-3 rounded">{formData.healthConditionDetails}</dd>
                      )}
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Smoker</dt>
                      <dd className="mt-1">{(formData as any).smoker || "N/A"}</dd>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">Suitability Declaration</h3>
                  <div className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Disqualified from Childcare</dt>
                      <dd className="mt-1">{(formData as any).disqualified || "N/A"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Social Services Involvement</dt>
                      <dd className="mt-1">{formData.socialServices}</dd>
                      {formData.socialServices === "Yes" && formData.socialServicesDetails && (
                        <dd className="mt-2 text-sm bg-muted/30 p-3 rounded">{formData.socialServicesDetails}</dd>
                      )}
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Other Circumstances</dt>
                      <dd className="mt-1">{(formData as any).otherCircumstances || "N/A"}</dd>
                      {(formData as any).otherCircumstances === "Yes" && (formData as any).otherCircumstancesDetails && (
                        <dd className="mt-2 text-sm bg-muted/30 p-3 rounded">{(formData as any).otherCircumstancesDetails}</dd>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">DBS & Vetting</h3>
                  <div className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Has DBS Certificate</dt>
                      <dd className="mt-1">{(formData as any).hasDBS || "N/A"}</dd>
                    </div>
                    {(formData as any).hasDBS === "Yes" && (
                      <>
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">DBS Certificate Number</dt>
                          <dd className="mt-1">{(formData as any).dbsNumber || "N/A"}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Enhanced DBS</dt>
                          <dd className="mt-1">{(formData as any).dbsEnhanced || "N/A"}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">On DBS Update Service</dt>
                          <dd className="mt-1">{(formData as any).dbsUpdate || "N/A"}</dd>
                        </div>
                      </>
                    )}
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Criminal Offence History</dt>
                      <dd className="mt-1">{formData.offenceHistory}</dd>
                      {formData.offenceHistory === "Yes" && formData.offenceDetails && formData.offenceDetails.length > 0 && (
                        <dd className="mt-2 space-y-2">
                          {formData.offenceDetails.map((offence: any, idx: number) => (
                            <div key={idx} className="text-sm bg-muted/30 p-3 rounded">
                              <div><span className="font-medium">Date:</span> {offence.date}</div>
                              <div><span className="font-medium">Description:</span> {offence.description}</div>
                              <div><span className="font-medium">Outcome:</span> {offence.outcome}</div>
                            </div>
                          ))}
                        </dd>
                      )}
                    </div>
                  </div>
                </div>
              </dl>
            </section>

            {/* Section 9: Declaration */}
            <section className="border-l-4 border-primary pl-6">
              <h2 className="text-2xl font-bold mb-4">9. Declaration & Payment</h2>
              <dl className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Final Declarations</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className={`w-5 h-5 flex-shrink-0 rounded border-2 ${formData.declarationAccuracy ? 'bg-primary border-primary' : 'border-muted'} flex items-center justify-center`}>
                        {formData.declarationAccuracy && <span className="text-primary-foreground text-xs">✓</span>}
                      </div>
                      <div className="text-sm">Confirmed information is accurate and complete</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className={`w-5 h-5 flex-shrink-0 rounded border-2 ${(formData as any).declarationChangeNotification ? 'bg-primary border-primary' : 'border-muted'} flex items-center justify-center`}>
                        {(formData as any).declarationChangeNotification && <span className="text-primary-foreground text-xs">✓</span>}
                      </div>
                      <div className="text-sm">Will notify of changes to circumstances</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className={`w-5 h-5 flex-shrink-0 rounded border-2 ${(formData as any).declarationInspectionCooperation ? 'bg-primary border-primary' : 'border-muted'} flex items-center justify-center`}>
                        {(formData as any).declarationInspectionCooperation && <span className="text-primary-foreground text-xs">✓</span>}
                      </div>
                      <div className="text-sm">Agrees to cooperate with inspections</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className={`w-5 h-5 flex-shrink-0 rounded border-2 ${(formData as any).declarationInformationSharing ? 'bg-primary border-primary' : 'border-muted'} flex items-center justify-center`}>
                        {(formData as any).declarationInformationSharing && <span className="text-primary-foreground text-xs">✓</span>}
                      </div>
                      <div className="text-sm">Consents to information sharing</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className={`w-5 h-5 flex-shrink-0 rounded border-2 ${(formData as any).declarationDataProcessing ? 'bg-primary border-primary' : 'border-muted'} flex items-center justify-center`}>
                        {(formData as any).declarationDataProcessing && <span className="text-primary-foreground text-xs">✓</span>}
                      </div>
                      <div className="text-sm">Consents to data processing (GDPR)</div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">Electronic Signature</h3>
                  <div className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Full Legal Name</dt>
                      <dd className="mt-1 font-medium">{formData.signatureFullName}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Date Signed</dt>
                      <dd className="mt-1">{formData.signatureDate ? format(new Date(formData.signatureDate), "MMMM dd, yyyy") : "N/A"}</dd>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">Payment Information</h3>
                  <div className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Payment Method</dt>
                      <dd className="mt-1">{formData.paymentMethod || "N/A"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Application Fee</dt>
                      <dd className="mt-1 font-medium">
                        {formData.ageGroups?.includes("0-5") || formData.ageGroups?.includes("5-7") ? "£200" : "£100"}
                      </dd>
                    </div>
                  </div>
                </div>
              </dl>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApplicationDetail;
