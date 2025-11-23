import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Application {
  id: string;
  title: string;
  first_name: string;
  middle_names: string;
  last_name: string;
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
  declaration_confirmed: boolean;
  declaration_date: string;
  declaration_signature: string;
}

const ApplicationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<Application | null>(null);
  const [updating, setUpdating] = useState(false);

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

      setApplication(data as unknown as Application);
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

      setApplication(prev => prev ? { ...prev, status: newStatus } : null);
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
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

  if (!application) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate('/admin/applications')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Applications
          </Button>
          <div className="flex gap-2 items-center">
            {getStatusBadge(application.status)}
            <Select value={application.status} onValueChange={updateStatus} disabled={updating}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Change status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Personal Details */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
              <CardDescription>Section 1: Applicant Information</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{application.title} {application.first_name} {application.middle_names} {application.last_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">{application.date_of_birth ? format(new Date(application.date_of_birth), "MMM dd, yyyy") : "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-medium">{application.gender || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{application.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mobile Phone</p>
                <p className="font-medium">{application.phone_mobile || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Home Phone</p>
                <p className="font-medium">{application.phone_home || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">National Insurance Number</p>
                <p className="font-medium">{application.national_insurance_number || "N/A"}</p>
              </div>
              {application.previous_names && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Previous Names</p>
                  <pre className="text-sm bg-muted p-2 rounded mt-1">{JSON.stringify(application.previous_names, null, 2)}</pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle>Address History</CardTitle>
              <CardDescription>Section 2: Current and Previous Addresses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {application.current_address && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Current Address</p>
                  <pre className="text-sm bg-muted p-2 rounded">{JSON.stringify(application.current_address, null, 2)}</pre>
                </div>
              )}
              {application.address_history && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Address History</p>
                  <pre className="text-sm bg-muted p-2 rounded">{JSON.stringify(application.address_history, null, 2)}</pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service Details */}
          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
              <CardDescription>Section 4: Childcare Service Information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Service Type</p>
                <p className="font-medium">{application.service_type || "N/A"}</p>
              </div>
              {application.service_age_range && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Age Range</p>
                  <pre className="text-sm bg-muted p-2 rounded">{JSON.stringify(application.service_age_range, null, 2)}</pre>
                </div>
              )}
              {application.service_capacity && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Capacity</p>
                  <pre className="text-sm bg-muted p-2 rounded">{JSON.stringify(application.service_capacity, null, 2)}</pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Qualifications */}
          {application.qualifications && (
            <Card>
              <CardHeader>
                <CardTitle>Qualifications & Training</CardTitle>
                <CardDescription>Section 5: Professional Qualifications</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-muted p-2 rounded">{JSON.stringify(application.qualifications, null, 2)}</pre>
              </CardContent>
            </Card>
          )}

          {/* Employment History */}
          {application.employment_history && (
            <Card>
              <CardHeader>
                <CardTitle>Employment History</CardTitle>
                <CardDescription>Section 6: Work Experience</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-muted p-2 rounded">{JSON.stringify(application.employment_history, null, 2)}</pre>
              </CardContent>
            </Card>
          )}

          {/* People Connected */}
          {application.people_in_household && (
            <Card>
              <CardHeader>
                <CardTitle>People in Household</CardTitle>
                <CardDescription>Section 7: Household Members</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-muted p-2 rounded">{JSON.stringify(application.people_in_household, null, 2)}</pre>
              </CardContent>
            </Card>
          )}

          {/* Health & Suitability */}
          <Card>
            <CardHeader>
              <CardTitle>Health & Suitability</CardTitle>
              <CardDescription>Section 8: Health and Background Information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Health Conditions</p>
                <p className="font-medium">{application.health_conditions || "N/A"}</p>
                {application.health_details && (
                  <p className="text-sm mt-1">{application.health_details}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Criminal Convictions</p>
                <p className="font-medium">{application.criminal_convictions || "N/A"}</p>
                {application.convictions_details && (
                  <p className="text-sm mt-1">{application.convictions_details}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Declaration */}
          <Card>
            <CardHeader>
              <CardTitle>Declaration</CardTitle>
              <CardDescription>Section 9: Application Declaration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Declaration Confirmed</p>
                <p className="font-medium">{application.declaration_confirmed ? "Yes" : "No"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Signature</p>
                <p className="font-medium">{application.declaration_signature || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{application.declaration_date ? format(new Date(application.declaration_date), "MMM dd, yyyy") : "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p className="font-medium">{format(new Date(application.created_at), "MMM dd, yyyy 'at' HH:mm")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ApplicationDetail;
