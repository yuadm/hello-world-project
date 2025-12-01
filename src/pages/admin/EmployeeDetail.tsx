import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import AdminLayout from "@/components/admin/AdminLayout";
import { Employee } from "@/types/employee";
import { UnifiedHouseholdComplianceCard } from "@/components/admin/unified/UnifiedHouseholdComplianceCard";
import { UnifiedAssistantComplianceCard } from "@/components/admin/unified/UnifiedAssistantComplianceCard";
import { ReferencesCard } from "@/components/admin/application-detail/ReferencesCard";
import { 
  getEmploymentStatusConfig,
} from "@/lib/employeeHelpers";
import { Badge } from "@/components/ui/badge";
import { ApplicantReferences } from "@/types/employee";

const AdminEmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    fetchEmployeeData();
  }, [id]);

  const fetchEmployeeData = async () => {
    try {
      const { data: empData, error: empError } = await supabase
        .from('employees' as any)
        .select('*')
        .eq('id', id)
        .single();

      if (empError) throw empError;

      setEmployee(empData as unknown as Employee);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load employee details",
        variant: "destructive",
      });
      navigate('/admin/employees');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !employee) {
    return (
      <AdminLayout>
        <div className="mb-8">
          <div className="h-10 w-48 bg-muted rounded-lg animate-shimmer mb-4" />
          <div className="h-9 w-96 bg-muted rounded-xl animate-shimmer mb-2" />
          <div className="h-5 w-64 bg-muted rounded-lg animate-shimmer" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border-0 bg-card shadow-apple-sm p-6">
              <div className="space-y-4">
                <div className="h-6 w-48 bg-muted rounded-lg animate-shimmer" />
                <div className="space-y-3">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="space-y-1">
                      <div className="h-4 w-32 bg-muted rounded animate-shimmer" />
                      <div className="h-5 w-full bg-muted rounded animate-shimmer" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/employees')}
              className="mb-3 -ml-2 rounded-lg hover:bg-muted/50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Employees
            </Button>
            <h1 className="text-3xl font-semibold tracking-tight">
              {employee.first_name} {employee.last_name}
            </h1>
            <p className="text-muted-foreground mt-1">{employee.email}</p>
          </div>
          <Badge 
            variant={getEmploymentStatusConfig(employee.employment_status).variant}
            className="px-4 py-2 rounded-full text-sm font-medium"
          >
            {getEmploymentStatusConfig(employee.employment_status).label}
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="rounded-2xl border-0 shadow-apple-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold tracking-tight">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <p className="text-sm font-medium text-muted-foreground">Name:</p>
                <p className="text-sm font-medium">{employee.first_name} {employee.last_name}</p>
                
                <p className="text-sm font-medium text-muted-foreground">Email:</p>
                <p className="text-sm">{employee.email}</p>
                
                <p className="text-sm font-medium text-muted-foreground">Phone:</p>
                <p className="text-sm">{employee.phone || "N/A"}</p>
                
                <p className="text-sm font-medium text-muted-foreground">Date of Birth:</p>
                <p className="text-sm">
                  {employee.date_of_birth 
                    ? format(new Date(employee.date_of_birth), "MMM dd, yyyy")
                    : "N/A"}
                </p>
                
                <p className="text-sm font-medium text-muted-foreground">NI Number:</p>
                <p className="text-sm">{employee.ni_number || "N/A"}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-apple-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold tracking-tight">Employment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <p className="text-sm font-medium text-muted-foreground">Start Date:</p>
                <p className="text-sm">
                  {employee.employment_start_date
                    ? format(new Date(employee.employment_start_date), "MMM dd, yyyy")
                    : "N/A"}
                </p>
                
                <p className="text-sm font-medium text-muted-foreground">Status:</p>
                <div>
                  <Badge 
                    variant={getEmploymentStatusConfig(employee.employment_status).variant}
                    className="rounded-full px-3 py-1"
                  >
                    {getEmploymentStatusConfig(employee.employment_status).label}
                  </Badge>
                </div>
                
                <p className="text-sm font-medium text-muted-foreground">Service Type:</p>
                <p className="text-sm">{employee.service_type || "N/A"}</p>
                
                <p className="text-sm font-medium text-muted-foreground">Local Authority:</p>
                <p className="text-sm">{employee.local_authority || "N/A"}</p>
                
                <p className="text-sm font-medium text-muted-foreground">Max Capacity:</p>
                <p className="text-sm">{employee.max_capacity || "N/A"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <UnifiedHouseholdComplianceCard
            parentId={id!}
            parentType="employee"
            parentEmail={employee.email}
            parentName={`${employee.first_name} ${employee.last_name}`}
          />
          <UnifiedAssistantComplianceCard
            parentId={id!}
            parentType="employee"
            parentEmail={employee.email}
            parentName={`${employee.first_name} ${employee.last_name}`}
          />
          <ReferencesCard
            employeeId={id!}
            applicantName={`${employee.first_name} ${employee.last_name}`}
            reference1Name={(employee.applicant_references as ApplicantReferences)?.reference1?.name || ""}
            reference1Relationship={(employee.applicant_references as ApplicantReferences)?.reference1?.relationship || ""}
            reference1Contact={(employee.applicant_references as ApplicantReferences)?.reference1?.contact || ""}
            reference1Childcare={(employee.applicant_references as ApplicantReferences)?.reference1?.childcare ? "Yes" : "No"}
            reference2Name={(employee.applicant_references as ApplicantReferences)?.reference2?.name || ""}
            reference2Relationship={(employee.applicant_references as ApplicantReferences)?.reference2?.relationship || ""}
            reference2Contact={(employee.applicant_references as ApplicantReferences)?.reference2?.contact || ""}
            reference2Childcare={(employee.applicant_references as ApplicantReferences)?.reference2?.childcare ? "Yes" : "No"}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminEmployeeDetail;
