import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Plus, Mail, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import AdminLayout from "@/components/admin/AdminLayout";
import { Employee, EmployeeHouseholdMember } from "@/types/employee";
import { 
  calculateAge, 
  daysUntil16thBirthday, 
  getEmploymentStatusConfig,
  getDBSStatusConfig,
  get16thBirthdayDate,
  isTurning16Soon
} from "@/lib/employeeHelpers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EditEmployeeModal } from "@/components/admin/employee/EditEmployeeModal";
import { AddHouseholdMemberModal } from "@/components/admin/employee/AddHouseholdMemberModal";
import { EditHouseholdMemberModal } from "@/components/admin/employee/EditHouseholdMemberModal";
import { RequestEmployeeDBSModal } from "@/components/admin/employee/RequestEmployeeDBSModal";

const AdminEmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [householdMembers, setHouseholdMembers] = useState<EmployeeHouseholdMember[]>([]);
  const [editEmployeeOpen, setEditEmployeeOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [editMemberOpen, setEditMemberOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<EmployeeHouseholdMember | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [dbsRequestOpen, setDbsRequestOpen] = useState(false);
  const [dbsRequestMember, setDbsRequestMember] = useState<{ id: string; name: string } | null>(null);

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

      const { data: membersData, error: membersError } = await supabase
        .from('employee_household_members' as any)
        .select('*')
        .eq('employee_id', id)
        .order('date_of_birth', { ascending: true });

      if (membersError) throw membersError;

      setHouseholdMembers((membersData || []) as unknown as EmployeeHouseholdMember[]);
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

  const adults = householdMembers.filter(m => m.member_type === 'adult');
  const children = householdMembers.filter(m => m.member_type === 'child');

  const handleDeleteMember = async () => {
    if (!memberToDelete) return;

    try {
      const { error } = await supabase
        .from('employee_household_members')
        .delete()
        .eq('id', memberToDelete);

      if (error) throw error;

      toast({
        title: "Member Deleted",
        description: "Household member has been removed",
      });

      fetchEmployeeData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete household member",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
    }
  };

  const handleEditMember = (member: EmployeeHouseholdMember) => {
    setSelectedMember(member);
    setEditMemberOpen(true);
  };

  const handleRequestDBS = (memberId: string, memberName: string) => {
    setDbsRequestMember({ id: memberId, name: memberName });
    setDbsRequestOpen(true);
  };

  if (loading || !employee) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading employee details...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/employees')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Employees
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {employee.first_name} {employee.last_name}
              </h1>
              <p className="text-muted-foreground">{employee.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditEmployeeOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Employee
            </Button>
            <Badge variant={getEmploymentStatusConfig(employee.employment_status).variant}>
              {getEmploymentStatusConfig(employee.employment_status).label}
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <p className="text-sm font-medium">Name:</p>
                <p className="text-sm">{employee.first_name} {employee.last_name}</p>
                
                <p className="text-sm font-medium">Email:</p>
                <p className="text-sm">{employee.email}</p>
                
                <p className="text-sm font-medium">Phone:</p>
                <p className="text-sm">{employee.phone || "N/A"}</p>
                
                <p className="text-sm font-medium">Date of Birth:</p>
                <p className="text-sm">
                  {employee.date_of_birth 
                    ? format(new Date(employee.date_of_birth), "MMM dd, yyyy")
                    : "N/A"}
                </p>
                
                <p className="text-sm font-medium">NI Number:</p>
                <p className="text-sm">{employee.ni_number || "N/A"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Employment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <p className="text-sm font-medium">Start Date:</p>
                <p className="text-sm">
                  {employee.employment_start_date
                    ? format(new Date(employee.employment_start_date), "MMM dd, yyyy")
                    : "N/A"}
                </p>
                
                <p className="text-sm font-medium">Status:</p>
                <div>
                  <Badge variant={getEmploymentStatusConfig(employee.employment_status).variant}>
                    {getEmploymentStatusConfig(employee.employment_status).label}
                  </Badge>
                </div>
                
                <p className="text-sm font-medium">Service Type:</p>
                <p className="text-sm">{employee.service_type || "N/A"}</p>
                
                <p className="text-sm font-medium">Local Authority:</p>
                <p className="text-sm">{employee.local_authority || "N/A"}</p>
                
                <p className="text-sm font-medium">Max Capacity:</p>
                <p className="text-sm">{employee.max_capacity || "N/A"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Household Members</CardTitle>
                <CardDescription>
                  Adults (16+) and Children (Under 16) living in the household
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddMemberOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="adults">
              <TabsList>
                <TabsTrigger value="adults">Adults (16+) - {adults.length}</TabsTrigger>
                <TabsTrigger value="children">Children (Under 16) - {children.length}</TabsTrigger>
              </TabsList>

              <TabsContent value="adults" className="mt-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Relationship</TableHead>
                        <TableHead>DBS Status</TableHead>
                        <TableHead>DBS Expiry</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adults.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No adult household members
                          </TableCell>
                        </TableRow>
                      ) : (
                        adults.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell className="font-medium">{member.full_name}</TableCell>
                            <TableCell>{calculateAge(member.date_of_birth)}</TableCell>
                            <TableCell>{member.relationship || "N/A"}</TableCell>
                            <TableCell>
                              <Badge variant={getDBSStatusConfig(member.dbs_status).variant}>
                                {getDBSStatusConfig(member.dbs_status).label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {member.dbs_certificate_expiry_date
                                ? format(new Date(member.dbs_certificate_expiry_date), "MMM dd, yyyy")
                                : "N/A"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRequestDBS(member.id, member.full_name)}
                                  title="Request DBS"
                                >
                                  <Mail className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditMember(member)}
                                  title="Edit member"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setMemberToDelete(member.id);
                                    setDeleteDialogOpen(true);
                                  }}
                                  title="Delete member"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="children" className="mt-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Date of Birth</TableHead>
                        <TableHead>Relationship</TableHead>
                        <TableHead>Turns 16 On</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {children.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No children household members
                          </TableCell>
                        </TableRow>
                      ) : (
                        children.map((member) => {
                          const age = calculateAge(member.date_of_birth);
                          const daysUntil16 = daysUntil16thBirthday(member.date_of_birth);
                          const turning16Soon = isTurning16Soon(member.date_of_birth);
                          
                          return (
                            <TableRow key={member.id}>
                              <TableCell className="font-medium">
                                {member.full_name}
                                {turning16Soon && (
                                  <Badge variant="secondary" className="ml-2">
                                    Turning 16 Soon
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>{age}</TableCell>
                              <TableCell>
                                {format(new Date(member.date_of_birth), "MMM dd, yyyy")}
                              </TableCell>
                              <TableCell>{member.relationship || "N/A"}</TableCell>
                              <TableCell>
                                {format(get16thBirthdayDate(member.date_of_birth), "MMM dd, yyyy")}
                                <span className="text-muted-foreground text-sm ml-2">
                                  ({daysUntil16} days)
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditMember(member)}
                                    title="Edit member"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setMemberToDelete(member.id);
                                      setDeleteDialogOpen(true);
                                    }}
                                    title="Delete member"
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {employee && (
        <>
          <EditEmployeeModal
            open={editEmployeeOpen}
            onOpenChange={setEditEmployeeOpen}
            employee={employee}
            onSuccess={fetchEmployeeData}
          />

          <AddHouseholdMemberModal
            open={addMemberOpen}
            onOpenChange={setAddMemberOpen}
            employeeId={employee.id}
            onSuccess={fetchEmployeeData}
          />

          {selectedMember && (
            <EditHouseholdMemberModal
              open={editMemberOpen}
              onOpenChange={setEditMemberOpen}
              member={selectedMember}
              onSuccess={fetchEmployeeData}
            />
          )}

          {dbsRequestMember && (
            <RequestEmployeeDBSModal
              open={dbsRequestOpen}
              onOpenChange={setDbsRequestOpen}
              memberId={dbsRequestMember.id}
              memberName={dbsRequestMember.name}
              employeeId={employee.id}
              employeeName={`${employee.first_name} ${employee.last_name}`}
              onSuccess={fetchEmployeeData}
            />
          )}
        </>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Household Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this household member? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMember}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminEmployeeDetail;
