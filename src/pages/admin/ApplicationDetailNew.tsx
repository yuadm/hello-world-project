import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileCheck, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { pdf } from '@react-pdf/renderer';
import { ApplicationPDF } from "@/components/admin/ApplicationPDF";
import { GenerateOfstedFormModal } from "@/components/admin/GenerateOfstedFormModal";
import AdminLayout from "@/components/admin/AdminLayout";
import { ApplicationHero } from "@/components/admin/application-detail/ApplicationHero";
import { AdminApplicationEditForm } from "@/components/admin/AdminApplicationEditForm";
import { dbToFormData } from "@/lib/applicationDataMapper";
import { UnifiedHouseholdComplianceCard } from "@/components/admin/unified/UnifiedHouseholdComplianceCard";
import { UnifiedAssistantComplianceCard } from "@/components/admin/unified/UnifiedAssistantComplianceCard";
import { RequestApplicantDBSModal } from "@/components/admin/RequestApplicantDBSModal";
import { AppleCard } from "@/components/admin/AppleCard";
import { PersonalInfoCard } from "@/components/admin/application-detail/PersonalInfoCard";
import { ServiceDetailsCard } from "@/components/admin/application-detail/ServiceDetailsCard";
import { AddressCard } from "@/components/admin/application-detail/AddressCard";
import { PremisesCard } from "@/components/admin/application-detail/PremisesCard";
import { EmploymentHistoryCard } from "@/components/admin/application-detail/EmploymentHistoryCard";
import { QualificationsCard } from "@/components/admin/application-detail/QualificationsCard";
import { DBSVettingCard } from "@/components/admin/application-detail/DBSVettingCard";
import { ReferencesCard } from "@/components/admin/application-detail/ReferencesCard";
import { DeclarationCard } from "@/components/admin/application-detail/DeclarationCard";
import { Shimmer } from "@/components/ui/shimmer";

interface DBApplication {
  id: string;
  title: string;
  first_name: string;
  middle_names: string;
  last_name: string;
  email: string;
  phone_mobile: string;
  date_of_birth: string;
  gender: string;
  national_insurance_number: string;
  status: string;
  current_address: any;
  service_type: string;
  service_age_range: any;
  service_capacity: any;
  service_local_authority: string;
  work_with_others: string;
  number_of_assistants: number;
  qualifications: any;
  people_in_household: any;
  people_regular_contact: any;
  home_move_in: string;
  premises_ownership: string;
  outdoor_space: string;
  premises_animals: string;
  premises_animal_details: string;
  has_dbs: string;
  dbs_number: string;
  dbs_enhanced: string;
  dbs_update: string;
  criminal_convictions: string;
  applicant_references: any;
  address_history: any;
  employment_gaps: string;
  right_to_work: string;
  previous_names: any;
  place_of_birth: string;
  service_hours: any;
  overnight_care: string;
  service_ofsted_registered: string;
  service_ofsted_number: string;
  address_gaps: string;
  lived_outside_uk: string;
  military_base: string;
  same_address: string;
  premises_address: any;
  use_additional_premises: string;
  additional_premises: any;
  employment_history: any;
  current_employment: string;
  previous_registration: string;
  registration_details: any;
  health_conditions: string;
  health_details: string;
  smoker: string;
  disqualified: string;
  safeguarding_concerns: string;
  safeguarding_details: string;
  other_circumstances: string;
  other_circumstances_details: string;
  convictions_details: string;
  child_volunteered: string;
  child_volunteered_consent: boolean;
  declaration_confirmed: boolean;
  declaration_change_notification: boolean;
  declaration_inspection_cooperation: boolean;
  declaration_information_sharing: boolean;
  declaration_data_processing: boolean;
  declaration_signature: string;
  declaration_date: string;
  payment_method: string;
}

const ApplicationDetailNew = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [dbApplication, setDbApplication] = useState<DBApplication | null>(null);
  const [existingEmployeeId, setExistingEmployeeId] = useState<string | null>(null);
  const [showDBSRequestModal, setShowDBSRequestModal] = useState(false);
  const [showOfstedModal, setShowOfstedModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchApplication();
  }, [id]);

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
      
      const { data: employeeData } = await supabase
        .from('employees')
        .select('id')
        .eq('application_id', id)
        .maybeSingle();

      if (employeeData) {
        setExistingEmployeeId(employeeData.id);
      }
      
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
      if (newStatus === 'approved') {
        const { data, error } = await supabase.functions.invoke('approve-and-convert-to-employee', {
          body: { applicationId: id },
        });

        if (error) throw error;

        if (data?.success) {
          setDbApplication(prev => prev ? { ...prev, status: newStatus } : null);
          setExistingEmployeeId(data.employeeId);
          
          toast({
            title: data.alreadyExists ? "Already Approved" : "Application Approved",
            description: data.message || `Successfully converted to employee.`,
            action: (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/admin/employees/${data.employeeId}`)}
              >
                View Employee
              </Button>
            ),
          });
        }
      } else {
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
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const downloadPDF = async () => {
    if (!dbApplication) return;
    
    try {
      const blob = await pdf(
        <ApplicationPDF 
          application={dbApplication as any} 
          applicationId={dbApplication.id}
          submittedDate={new Date().toISOString()}
          status={dbApplication.status}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `application-${dbApplication.first_name}-${dbApplication.last_name}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 space-y-6">
          <Shimmer variant="card" className="h-32" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Shimmer key={i} variant="card" className="h-64" />
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!dbApplication) {
    return null;
  }

  const qualifications = dbApplication.qualifications || {};
  const serviceCapacity = dbApplication.service_capacity || {};
  const peopleInHousehold = dbApplication.people_in_household || {};
  const references = dbApplication.applicant_references || {};
  const serviceHours = dbApplication.service_hours || [];
  const registrationDetails = dbApplication.registration_details || {};

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin/applications')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Applications
        </Button>

        {/* Hero Section */}
        <div className="space-y-4">
          <ApplicationHero
            applicantName={`${dbApplication.first_name} ${dbApplication.last_name}`}
            email={dbApplication.email}
            status={dbApplication.status}
            updating={updating}
            existingEmployeeId={existingEmployeeId}
            onStatusChange={updateStatus}
            onDownloadPDF={downloadPDF}
            onViewEmployee={() => navigate(`/admin/employees/${existingEmployeeId}`)}
            onEdit={() => setIsEditing(true)}
          />
          
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowOfstedModal(true)}
          >
            <FileText className="h-4 w-4" />
            Generate Known to Ofsted Form
          </Button>
        </div>

        {/* Edit Mode or View Mode */}
        {isEditing ? (
          <AdminApplicationEditForm
            applicationId={id!}
            initialData={dbToFormData(dbApplication as any)}
            onCancel={() => setIsEditing(false)}
            onSaveSuccess={() => {
              setIsEditing(false);
              fetchApplication();
            }}
          />
        ) : (
          <>

        {/* Main Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Row 1 */}
          <PersonalInfoCard
            title={dbApplication.title}
            firstName={dbApplication.first_name}
            middleNames={dbApplication.middle_names}
            lastName={dbApplication.last_name}
            email={dbApplication.email}
            phone={dbApplication.phone_mobile}
            dob={dbApplication.date_of_birth}
            gender={dbApplication.gender}
            niNumber={dbApplication.national_insurance_number}
            rightToWork={dbApplication.right_to_work}
            previousNames={dbApplication.previous_names}
            placeOfBirth={dbApplication.place_of_birth}
          />
          
          <ServiceDetailsCard
            serviceType={dbApplication.service_type}
            ageGroups={dbApplication.service_age_range}
            capacity={serviceCapacity}
            localAuthority={dbApplication.service_local_authority}
            workWithOthers={dbApplication.work_with_others}
            numberOfAssistants={dbApplication.number_of_assistants}
            serviceHours={serviceHours}
            overnightCare={dbApplication.overnight_care}
            ofstedRegistered={dbApplication.service_ofsted_registered}
            ofstedNumber={dbApplication.service_ofsted_number}
          />

          {/* Row 2 */}
          <AddressCard
            address={dbApplication.current_address}
            moveIn={dbApplication.home_move_in}
            addressHistory={dbApplication.address_history}
            addressGaps={dbApplication.address_gaps}
            livedOutsideUk={dbApplication.lived_outside_uk}
            militaryBase={dbApplication.military_base}
          />

          <PremisesCard
            ownership={dbApplication.premises_ownership}
            outdoorSpace={dbApplication.outdoor_space}
            pets={dbApplication.premises_animals}
            petsDetails={dbApplication.premises_animal_details}
            sameAddress={dbApplication.same_address}
            premisesAddress={dbApplication.premises_address}
            useAdditionalPremises={dbApplication.use_additional_premises}
            additionalPremises={dbApplication.additional_premises}
          />

          <EmploymentHistoryCard
            employmentHistory={dbApplication.employment_history}
            employmentGaps={dbApplication.employment_gaps}
            currentEmployment={dbApplication.current_employment}
          />

          {/* Row 3 */}
          <QualificationsCard
            firstAid={qualifications.firstAid}
            safeguarding={qualifications.safeguarding}
            eyfsChildminding={qualifications.eyfsChildminding}
            level2Qual={qualifications.level2Qual}
          />

          <DBSVettingCard
            hasDBS={dbApplication.has_dbs}
            dbsNumber={dbApplication.dbs_number}
            dbsEnhanced={dbApplication.dbs_enhanced}
            dbsUpdate={dbApplication.dbs_update}
            offenceHistory={dbApplication.criminal_convictions}
            previousRegistration={dbApplication.previous_registration}
            registrationDetails={registrationDetails}
            healthConditions={dbApplication.health_conditions}
            healthDetails={dbApplication.health_details}
            smoker={dbApplication.smoker}
            disqualified={dbApplication.disqualified}
            safeguardingConcerns={dbApplication.safeguarding_concerns}
            safeguardingDetails={dbApplication.safeguarding_details}
            otherCircumstances={dbApplication.other_circumstances}
            otherCircumstancesDetails={dbApplication.other_circumstances_details}
            convictionsDetails={dbApplication.convictions_details}
            applicationId={id}
            applicantName={`${dbApplication.first_name} ${dbApplication.last_name}`}
            applicantEmail={dbApplication.email}
            onRequestDBS={() => setShowDBSRequestModal(true)}
          />

          <ReferencesCard
            applicationId={id}
            applicantName={`${dbApplication.first_name} ${dbApplication.last_name}`}
            reference1Name={references.reference1?.name}
            reference1Relationship={references.reference1?.relationship}
            reference1Contact={references.reference1?.contact}
            reference1Childcare={references.reference1?.childcare}
            reference2Name={references.reference2?.name}
            reference2Relationship={references.reference2?.relationship}
            reference2Contact={references.reference2?.contact}
            reference2Childcare={references.reference2?.childcare}
            childVolunteered={dbApplication.child_volunteered}
            childVolunteeredConsent={dbApplication.child_volunteered_consent}
          />

          <DeclarationCard
            declarationConfirmed={dbApplication.declaration_confirmed}
            declarationChangeNotification={dbApplication.declaration_change_notification}
            declarationInspectionCooperation={dbApplication.declaration_inspection_cooperation}
            declarationInformationSharing={dbApplication.declaration_information_sharing}
            declarationDataProcessing={dbApplication.declaration_data_processing}
            declarationSignature={dbApplication.declaration_signature}
            declarationDate={dbApplication.declaration_date}
            paymentMethod={dbApplication.payment_method}
          />
        </div>

        {/* Compliance Management - Traffic Light Style */}
        {dbApplication.status === 'approved' && existingEmployeeId ? (
          <AppleCard className="p-8 text-center">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                <FileCheck className="h-6 w-6" />
                <h3 className="text-lg font-semibold">Application Approved</h3>
              </div>
              <p className="text-muted-foreground">
                This application has been approved and all compliance data has been transferred to the employee record.
              </p>
              <Button onClick={() => navigate(`/admin/employees/${existingEmployeeId}`)}>
                View Employee Record →
              </Button>
            </div>
          </AppleCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UnifiedHouseholdComplianceCard
              parentId={id!}
              parentType="application"
              parentEmail={dbApplication.email}
              parentName={`${dbApplication.first_name} ${dbApplication.last_name}`}
            />
            <UnifiedAssistantComplianceCard
              parentId={id!}
              parentType="application"
              parentEmail={dbApplication.email}
              parentName={`${dbApplication.first_name} ${dbApplication.last_name}`}
            />
          </div>
        )}
        </>
        )}

        <RequestApplicantDBSModal
          open={showDBSRequestModal}
          onOpenChange={setShowDBSRequestModal}
          applicationId={id!}
          applicantName={`${dbApplication.first_name} ${dbApplication.last_name}`}
          applicantEmail={dbApplication.email}
          onSuccess={fetchApplication}
        />

        <GenerateOfstedFormModal
          open={showOfstedModal}
          onOpenChange={setShowOfstedModal}
          applicantName={`${dbApplication.first_name} ${dbApplication.last_name}`}
          dateOfBirth={dbApplication.date_of_birth}
          currentAddress={{
            line1: dbApplication.current_address?.line1 || '',
            line2: dbApplication.current_address?.line2,
            town: dbApplication.current_address?.town || '',
            postcode: dbApplication.current_address?.postcode || '',
            moveInDate: dbApplication.home_move_in || '',
          }}
          previousAddresses={dbApplication.address_history?.map((addr: any) => ({
            address: addr.address || '',
            dateFrom: addr.moveIn || '',
            dateTo: addr.moveOut || '',
          }))}
          previousNames={dbApplication.previous_names?.map((prev: any) => ({
            name: prev.fullName || '',
            dateFrom: prev.dateFrom || '',
            dateTo: prev.dateTo || '',
          }))}
          role="childminder"
        />
      </div>
    </AdminLayout>
  );
};

export default ApplicationDetailNew;
