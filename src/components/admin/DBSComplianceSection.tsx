import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, AlertCircle, CheckCircle, Clock, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RecordCertificateModal } from "./RecordCertificateModal";
import { format, differenceInYears, addYears, differenceInDays } from "date-fns";

interface DBSMember {
  id: string;
  application_id: string;
  member_type: string;
  full_name: string;
  date_of_birth: string;
  relationship: string | null;
  email: string | null;
  dbs_status: string;
  dbs_request_date: string | null;
  dbs_certificate_number: string | null;
  dbs_certificate_date: string | null;
  turning_16_notification_sent: boolean;
  notes: string | null;
}

interface DBSComplianceSectionProps {
  applicationId: string;
  applicantEmail: string;
  applicantName: string;
}

export const DBSComplianceSection = ({ applicationId, applicantEmail, applicantName }: DBSComplianceSectionProps) => {
  const [members, setMembers] = useState<DBSMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedMember, setSelectedMember] = useState<DBSMember | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadMembers();
  }, [applicationId]);

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('household_member_dbs_tracking')
        .select('*')
        .eq('application_id', applicationId)
        .order('member_type')
        .order('full_name');

      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load DBS tracking data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const syncMembers = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-household-members', {
        body: { applicationId },
      });

      if (error) throw error;

      toast({
        title: "Sync Complete",
        description: `Synced ${data.total} household members`,
      });

      loadMembers();
    } catch (error: any) {
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const sendDBSRequest = async (member: DBSMember) => {
    if (!member.email) {
      toast({
        title: "No Email",
        description: "Please add an email address for this member first",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('send-dbs-request-email', {
        body: {
          memberId: member.id,
          memberName: member.full_name,
          memberEmail: member.email,
          applicationId,
          applicantName,
        },
      });

      if (error) throw error;

      toast({
        title: "Email Sent",
        description: `DBS request sent to ${member.full_name}`,
      });

      loadMembers();
    } catch (error: any) {
      toast({
        title: "Failed to Send Email",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const sendBirthdayAlert = async (member: DBSMember) => {
    const daysUntil16 = differenceInDays(addYears(new Date(member.date_of_birth), 16), new Date());

    try {
      const { error } = await supabase.functions.invoke('send-16th-birthday-alert', {
        body: {
          memberId: member.id,
          childName: member.full_name,
          dateOfBirth: member.date_of_birth,
          daysUntil16,
          applicantEmail,
          applicantName,
          applicationId,
        },
      });

      if (error) throw error;

      toast({
        title: "Alert Sent",
        description: `Birthday alert sent to ${applicantName}`,
      });

      loadMembers();
    } catch (error: any) {
      toast({
        title: "Failed to Send Alert",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRecordCertificate = (member: DBSMember) => {
    setSelectedMember(member);
    setShowCertificateModal(true);
  };

  const handleCertificateSaved = () => {
    setShowCertificateModal(false);
    setSelectedMember(null);
    loadMembers();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      not_requested: { label: "Not Requested", variant: "destructive" as const, icon: AlertCircle },
      requested: { label: "Requested", variant: "secondary" as const, icon: Mail },
      applied: { label: "Applied", variant: "secondary" as const, icon: Clock },
      certificate_received: { label: "Received", variant: "default" as const, icon: CheckCircle },
      exempt: { label: "Exempt", variant: "outline" as const, icon: FileText },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.not_requested;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const calculateAge = (dob: string) => {
    return differenceInYears(new Date(), new Date(dob));
  };

  const getApproaching16 = () => {
    return members.filter(m => {
      if (m.member_type !== 'child') return false;
      const age = calculateAge(m.date_of_birth);
      if (age >= 16) return false;
      const daysUntil16 = differenceInDays(addYears(new Date(m.date_of_birth), 16), new Date());
      return daysUntil16 <= 90;
    });
  };

  const getComplianceStats = () => {
    const adults = members.filter(m => {
      if (m.member_type === 'child') {
        return calculateAge(m.date_of_birth) >= 16;
      }
      return m.member_type === 'adult' || m.member_type === 'assistant';
    });

    const completed = adults.filter(m => m.dbs_status === 'certificate_received' || m.dbs_status === 'exempt').length;
    const total = adults.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  };

  const approaching16 = getApproaching16();
  const stats = getComplianceStats();
  const adults = members.filter(m => m.member_type === 'adult' || m.member_type === 'assistant');
  const children = members.filter(m => m.member_type === 'child');

  if (loading) {
    return <div className="text-center py-8">Loading DBS compliance data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Compliance Overview */}
      <div className="bg-muted/30 p-6 rounded-lg border">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">DBS Compliance Status</h3>
            <p className="text-sm text-muted-foreground">
              {stats.completed} of {stats.total} required DBS checks completed
            </p>
          </div>
          <Button onClick={syncMembers} disabled={syncing} variant="outline" size="sm">
            {syncing ? "Syncing..." : "Sync from Application"}
          </Button>
        </div>
        
        <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
          <div
            className={`h-full transition-all ${
              stats.percentage === 100 ? 'bg-green-500' :
              stats.percentage >= 50 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${stats.percentage}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2">{stats.percentage}% complete</p>
      </div>

      {/* Children Approaching 16 Alert */}
      {approaching16.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-950/20 border-l-4 border-orange-500 p-4 rounded">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-orange-900 dark:text-orange-100">
                Children Approaching 16
              </h4>
              <div className="mt-2 space-y-2">
                {approaching16.map(child => {
                  const daysUntil16 = differenceInDays(addYears(new Date(child.date_of_birth), 16), new Date());
                  return (
                    <div key={child.id} className="flex items-center justify-between bg-white dark:bg-gray-900 p-3 rounded">
                      <div>
                        <p className="font-medium">{child.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Turns 16 in <strong>{daysUntil16} days</strong> - {format(addYears(new Date(child.date_of_birth), 16), 'dd/MM/yyyy')}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant={child.turning_16_notification_sent ? "outline" : "default"}
                        onClick={() => sendBirthdayAlert(child)}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        {child.turning_16_notification_sent ? "Resend Alert" : "Send Alert"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Adults & Assistants Table */}
      {adults.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Adults & Assistants (16+)</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium">Relationship</th>
                  <th className="text-left p-3 font-medium">DOB / Age</th>
                  <th className="text-left p-3 font-medium">DBS Status</th>
                  <th className="text-left p-3 font-medium">Certificate #</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {adults.map(member => (
                  <tr key={member.id} className="border-t">
                    <td className="p-3 font-medium">{member.full_name}</td>
                    <td className="p-3 text-sm">{member.relationship || member.member_type}</td>
                    <td className="p-3 text-sm">
                      {format(new Date(member.date_of_birth), 'dd/MM/yyyy')}
                      <br />
                      <span className="text-muted-foreground">({calculateAge(member.date_of_birth)} years)</span>
                    </td>
                    <td className="p-3">{getStatusBadge(member.dbs_status)}</td>
                    <td className="p-3 text-sm">
                      {member.dbs_certificate_number || "-"}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        {member.dbs_status === 'not_requested' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendDBSRequest(member)}
                            disabled={!member.email}
                          >
                            <Mail className="h-4 w-4 mr-1" />
                            Request
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleRecordCertificate(member)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          {member.dbs_certificate_number ? 'Update' : 'Record'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Children Table */}
      {children.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Children in Household</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium">DOB / Age</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {children.map(child => {
                  const age = calculateAge(child.date_of_birth);
                  const is16Plus = age >= 16;
                  return (
                    <tr key={child.id} className="border-t">
                      <td className="p-3 font-medium">{child.full_name}</td>
                      <td className="p-3 text-sm">
                        {format(new Date(child.date_of_birth), 'dd/MM/yyyy')}
                        <br />
                        <span className="text-muted-foreground">({age} years)</span>
                      </td>
                      <td className="p-3">
                        {is16Plus ? getStatusBadge(child.dbs_status) : (
                          <Badge variant="outline">Under 16 - No DBS Required</Badge>
                        )}
                      </td>
                      <td className="p-3">
                        {is16Plus && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleRecordCertificate(child)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            {child.dbs_certificate_number ? 'Update' : 'Record'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {members.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No household members found.</p>
          <Button onClick={syncMembers} className="mt-4" disabled={syncing}>
            {syncing ? "Syncing..." : "Sync from Application Data"}
          </Button>
        </div>
      )}

      {selectedMember && (
        <RecordCertificateModal
          open={showCertificateModal}
          onOpenChange={setShowCertificateModal}
          member={selectedMember}
          onSave={handleCertificateSaved}
        />
      )}
    </div>
  );
};
