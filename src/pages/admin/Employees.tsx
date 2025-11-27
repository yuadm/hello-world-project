import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Eye, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import AdminLayout from "@/components/admin/AdminLayout";
import { Employee } from "@/types/employee";
import { getEmploymentStatusConfig } from "@/lib/employeeHelpers";
import { Badge } from "@/components/ui/badge";

const AdminEmployees = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm, statusFilter]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setEmployees((data || []) as unknown as Employee[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load employees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = [...employees];

    if (statusFilter !== "all") {
      filtered = filtered.filter(emp => emp.employment_status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(emp =>
        emp.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEmployees(filtered);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="mb-8">
          <div className="h-8 w-64 bg-muted rounded-xl animate-shimmer mb-2" />
          <div className="h-5 w-96 bg-muted rounded-lg animate-shimmer" />
        </div>

        <div className="rounded-2xl border-0 bg-card shadow-apple-sm overflow-hidden">
          <div className="p-6 border-b border-border/50">
            <div className="flex gap-4">
              <div className="flex-1 h-10 bg-muted rounded-xl animate-shimmer" />
              <div className="w-48 h-10 bg-muted rounded-xl animate-shimmer" />
            </div>
          </div>
          <div className="divide-y divide-border/50">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="p-4 flex items-center gap-4">
                <div className="flex-1 h-6 bg-muted rounded-lg animate-shimmer" />
                <div className="w-32 h-6 bg-muted rounded-lg animate-shimmer" />
                <div className="w-24 h-9 bg-muted rounded-lg animate-shimmer" />
              </div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-1 w-12 rounded-full bg-gradient-to-r from-accent to-primary" />
          <span className="text-sm font-medium text-accent uppercase tracking-widest">Employee Management</span>
        </div>
        <h2 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Employees
        </h2>
        <p className="text-muted-foreground text-lg">
          View and manage all approved childminders
        </p>
      </div>

      <Card className="rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <CardHeader className="border-b border-border/50 pb-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 rounded-xl border-border/50 bg-muted/30 focus:bg-muted/50 transition-all duration-300 text-base"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px] h-12 rounded-xl border-border/50 bg-muted/30">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/50 bg-popover">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20 hover:bg-muted/20 border-b border-border/50">
                  <TableHead className="font-bold text-foreground">Name</TableHead>
                  <TableHead className="font-bold text-foreground">Email</TableHead>
                  <TableHead className="font-bold text-foreground">Service Type</TableHead>
                  <TableHead className="font-bold text-foreground">Status</TableHead>
                  <TableHead className="font-bold text-foreground">Start Date</TableHead>
                  <TableHead className="text-right font-bold text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <Users className="h-12 w-12 text-muted-foreground/50" />
                        <p className="text-muted-foreground text-lg">No employees found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((emp, index) => (
                    <TableRow 
                      key={emp.id}
                      className="border-b border-border/30 hover:bg-muted/30 transition-all duration-300 group animate-fade-in"
                      style={{ animationDelay: `${0.05 * index}s` }}
                    >
                      <TableCell className="font-semibold text-foreground py-4">
                        {emp.first_name} {emp.last_name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{emp.email}</TableCell>
                      <TableCell className="text-foreground/80">{emp.service_type || "N/A"}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={getEmploymentStatusConfig(emp.employment_status).variant}
                          className="rounded-full px-4 py-1.5 font-medium"
                        >
                          {getEmploymentStatusConfig(emp.employment_status).label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {emp.employment_start_date 
                          ? format(new Date(emp.employment_start_date), "MMM dd, yyyy")
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/employees/${emp.id}`)}
                          className="rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-300 opacity-0 group-hover:opacity-100"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminEmployees;
