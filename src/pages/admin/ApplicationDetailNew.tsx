import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { pdf } from '@react-pdf/renderer';
import { ApplicationPDF } from "@/components/admin/ApplicationPDF";
import AdminLayout from "@/components/admin/AdminLayout";
import { ApplicationHero } from "@/components/admin/application-detail/ApplicationHero";
import { UnifiedHouseholdComplianceCard } from "@/components/admin/unified/UnifiedHouseholdComplianceCard";
import { UnifiedAssistantComplianceCard } from "@/components/admin/unified/UnifiedAssistantComplianceCard";
import { PersonalInfoCard } from "@/components/admin/application-detail/PersonalInfoCard";
import { ServiceDetailsCard } from "@/components/admin/application-detail/ServiceDetailsCard";
import { AddressCard } from "@/components/admin/application-detail/AddressCard";
import { PremisesCard } from "@/components/admin/application-detail/PremisesCard";
import { QuickStatsCard } from "@/components/admin/application-detail/QuickStatsCard";
import { QualificationsCard } from "@/components/admin/application-detail/QualificationsCard";
import { DBSVettingCard } from "@/components/admin/application-detail/DBSVettingCard";
import { ReferencesCard } from "@/components/admin/application-detail/ReferencesCard";
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
}

const ApplicationDetailNew = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [dbApplication, setDbApplication] = useState<DBApplication | null>(null);
  const [existingEmployeeId, setExistingEmployeeId] = useState<string | null>(null);

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
  const addressHistoryYears = Math.floor((dbApplication.address_history?.length || 0) * 0.5) + 2;

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
        <ApplicationHero
          applicantName={`${dbApplication.first_name} ${dbApplication.last_name}`}
          email={dbApplication.email}
          status={dbApplication.status}
          updating={updating}
          existingEmployeeId={existingEmployeeId}
          onStatusChange={updateStatus}
          onDownloadPDF={downloadPDF}
          onViewEmployee={() => navigate(`/admin/employees/${existingEmployeeId}`)}
        />

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
          />
          
          <ServiceDetailsCard
            serviceType={dbApplication.service_type}
            ageGroups={dbApplication.service_age_range}
            capacity={serviceCapacity}
            localAuthority={dbApplication.service_local_authority}
            workWithOthers={dbApplication.work_with_others}
            numberOfAssistants={dbApplication.number_of_assistants}
          />

          {/* Row 2 */}
          <AddressCard
            address={dbApplication.current_address}
            moveIn={dbApplication.home_move_in}
          />

          <PremisesCard
            ownership={dbApplication.premises_ownership}
            outdoorSpace={dbApplication.outdoor_space}
            pets={dbApplication.premises_animals}
            petsDetails={dbApplication.premises_animal_details}
          />

          <QuickStatsCard
            addressHistoryYears={addressHistoryYears}
            employmentGaps={dbApplication.employment_gaps}
            hasGaps={!!dbApplication.employment_gaps}
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
          />

          <ReferencesCard
            reference1Name={references.reference1?.name}
            reference1Relationship={references.reference1?.relationship}
            reference1Contact={references.reference1?.contact}
            reference2Name={references.reference2?.name}
            reference2Relationship={references.reference2?.relationship}
            reference2Contact={references.reference2?.contact}
          />

        </div>

        {/* Compliance Management - Traffic Light Style */}
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
      </div>
    </AdminLayout>
  );
};

export default ApplicationDetailNew;
