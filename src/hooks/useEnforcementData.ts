import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  SuspensionFormData, 
  WarningFormData, 
  CancellationFormData,
  SuspensionReviewFormData,
  DecisionFormData,
  EnforcementCase 
} from "@/types/enforcement";

export interface EnforcementCaseDB {
  id: string;
  employee_id: string;
  type: 'suspension' | 'warning' | 'cancellation';
  status: 'pending' | 'in_effect' | 'representations_received' | 'decision_pending' | 'lifted' | 'cancelled' | 'closed';
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  concern: string | null;
  risk_detail: string | null;
  risk_categories: string[] | null;
  deadline: string | null;
  date_created: string;
  date_closed: string | null;
  supervisor_id: string | null;
  supervisor_name: string | null;
  form_data: any;
  created_at: string;
  updated_at: string;
  employees?: {
    first_name: string;
    last_name: string;
    email: string;
    local_authority: string | null;
    service_type: string | null;
  };
}

export interface EnforcementTimelineDB {
  id: string;
  case_id: string;
  event: string;
  date: string;
  type: 'completed' | 'pending' | 'urgent';
  created_by: string | null;
  created_at: string;
}

export interface EnforcementNotificationDB {
  id: string;
  case_id: string;
  agency: string;
  agency_name: string;
  agency_detail: string | null;
  agency_email: string;
  status: 'pending' | 'sent' | 'failed';
  sent_at: string | null;
  sent_by: string | null;
  created_at: string;
}

export const useEnforcementCases = () => {
  return useQuery({
    queryKey: ['enforcement-cases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enforcement_cases')
        .select(`
          *,
          employees (
            first_name,
            last_name,
            email,
            local_authority,
            service_type
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match EnforcementCase interface
      return (data as EnforcementCaseDB[]).map(c => ({
        ...c,
        employee_name: c.employees ? `${c.employees.first_name} ${c.employees.last_name}` : 'Unknown',
        employee_email: c.employees?.email,
        employee_local_authority: c.employees?.local_authority || 'Unknown',
        employee_service_type: c.employees?.service_type
      })) as EnforcementCase[];
    }
  });
};

export const useEnforcementTimeline = (caseId: string | null) => {
  return useQuery({
    queryKey: ['enforcement-timeline', caseId],
    queryFn: async () => {
      if (!caseId) return [];
      
      const { data, error } = await supabase
        .from('enforcement_timeline')
        .select('*')
        .eq('case_id', caseId)
        .order('date', { ascending: true });

      if (error) throw error;
      return data as EnforcementTimelineDB[];
    },
    enabled: !!caseId
  });
};

export const useAllTimelines = (caseIds: string[]) => {
  return useQuery({
    queryKey: ['enforcement-timelines', caseIds],
    queryFn: async () => {
      if (caseIds.length === 0) return {};
      
      const { data, error } = await supabase
        .from('enforcement_timeline')
        .select('*')
        .in('case_id', caseIds)
        .order('date', { ascending: true });

      if (error) throw error;

      // Group by case_id
      const grouped: Record<string, EnforcementTimelineDB[]> = {};
      (data as EnforcementTimelineDB[]).forEach(t => {
        if (!grouped[t.case_id]) grouped[t.case_id] = [];
        grouped[t.case_id].push(t);
      });
      return grouped;
    },
    enabled: caseIds.length > 0
  });
};

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['enforcement-recent-activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enforcement_timeline')
        .select(`
          *,
          enforcement_cases (
            employee_id,
            employees (
              first_name,
              last_name
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    }
  });
};

export const useCreateEnforcementCase = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      employeeId,
      type,
      formData,
      supervisorId,
      supervisorName
    }: {
      employeeId: string;
      type: 'suspension' | 'warning' | 'cancellation';
      formData: SuspensionFormData | WarningFormData | CancellationFormData;
      supervisorId: string;
      supervisorName: string;
    }) => {
      // Determine initial status and deadline
      const today = new Date().toISOString().split('T')[0];
      let status: 'pending' | 'in_effect' = 'in_effect';
      let deadline: string | null = null;
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium';

      if (type === 'suspension') {
        // 6 weeks review deadline
        const reviewDate = new Date();
        reviewDate.setDate(reviewDate.getDate() + 42);
        deadline = reviewDate.toISOString().split('T')[0];
        riskLevel = 'critical';
      } else if (type === 'warning') {
        const warningData = formData as WarningFormData;
        const complianceDays = parseInt(warningData.complianceDeadline) || 14;
        const complianceDate = new Date();
        complianceDate.setDate(complianceDate.getDate() + complianceDays);
        deadline = complianceDate.toISOString().split('T')[0];
        riskLevel = 'high';
      } else if (type === 'cancellation') {
        const cancellationData = formData as CancellationFormData;
        const repsDays = parseInt(cancellationData.repPeriod) || 14;
        const repsDate = new Date();
        repsDate.setDate(repsDate.getDate() + repsDays);
        deadline = repsDate.toISOString().split('T')[0];
        status = 'pending';
        riskLevel = 'high';
      }

      // Get concern and risk_detail from form data
      let concern = '';
      let riskDetail = '';
      let riskCategories: string[] = [];

      if ('concern' in formData) {
        concern = formData.concern;
        riskDetail = formData.riskDetail;
        riskCategories = formData.riskCategories;
      } else if ('evidenceSummary' in formData) {
        concern = 'Cancellation of registration';
        riskDetail = (formData as CancellationFormData).evidenceSummary;
        riskCategories = (formData as CancellationFormData).grounds;
      }

      // Insert the case
      // supervisor_id is set to null since the form uses display identifiers, not real UUIDs
      const { data: caseData, error: caseError } = await supabase
        .from('enforcement_cases')
        .insert([{
          employee_id: employeeId,
          type: type as any,
          status: status as any,
          risk_level: riskLevel as any,
          concern,
          risk_detail: riskDetail,
          risk_categories: riskCategories,
          deadline,
          date_created: today,
          supervisor_id: null,
          supervisor_name: supervisorName,
          form_data: formData as any
        }])
        .select()
        .single();

      if (caseError) throw caseError;

      // Create initial timeline events
      const timelineEvents = [];
      
      if (type === 'suspension' || type === 'warning') {
        timelineEvents.push({
          case_id: caseData.id,
          event: 'Risk Assessment Completed',
          date: today,
          type: 'completed' as const,
          created_by: supervisorName
        });
        timelineEvents.push({
          case_id: caseData.id,
          event: type === 'suspension' ? 'Suspension Notice Issued' : 'Warning Notice Issued',
          date: today,
          type: 'completed' as const,
          created_by: supervisorName
        });
        if (type === 'suspension') {
          timelineEvents.push({
            case_id: caseData.id,
            event: '6-Week Review Deadline',
            date: deadline!,
            type: 'pending' as const,
            created_by: null
          });
        } else {
          timelineEvents.push({
            case_id: caseData.id,
            event: 'Compliance Deadline',
            date: deadline!,
            type: 'pending' as const,
            created_by: null
          });
        }
      } else if (type === 'cancellation') {
        timelineEvents.push({
          case_id: caseData.id,
          event: 'Notice of Intention Issued',
          date: today,
          type: 'completed' as const,
          created_by: supervisorName
        });
        timelineEvents.push({
          case_id: caseData.id,
          event: 'Representations Deadline',
          date: deadline!,
          type: 'pending' as const,
          created_by: null
        });
      }

      if (timelineEvents.length > 0) {
        const { error: timelineError } = await supabase
          .from('enforcement_timeline')
          .insert(timelineEvents);
        
        if (timelineError) throw timelineError;
      }

      return caseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enforcement-cases'] });
      queryClient.invalidateQueries({ queryKey: ['enforcement-timelines'] });
      queryClient.invalidateQueries({ queryKey: ['enforcement-recent-activity'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create enforcement case: " + error.message,
        variant: "destructive"
      });
    }
  });
};

export const useUpdateEnforcementCase = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      caseId,
      updates,
      timelineEvent,
      supervisorName
    }: {
      caseId: string;
      updates: Partial<EnforcementCaseDB>;
      timelineEvent?: { event: string; type: 'completed' | 'pending' | 'urgent' };
      supervisorName?: string;
    }) => {
      const { error: updateError } = await supabase
        .from('enforcement_cases')
        .update(updates)
        .eq('id', caseId);

      if (updateError) throw updateError;

      if (timelineEvent) {
        const { error: timelineError } = await supabase
          .from('enforcement_timeline')
          .insert({
            case_id: caseId,
            event: timelineEvent.event,
            date: new Date().toISOString().split('T')[0],
            type: timelineEvent.type,
            created_by: supervisorName || null
          });
        
        if (timelineError) throw timelineError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enforcement-cases'] });
      queryClient.invalidateQueries({ queryKey: ['enforcement-timelines'] });
      queryClient.invalidateQueries({ queryKey: ['enforcement-recent-activity'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update case: " + error.message,
        variant: "destructive"
      });
    }
  });
};

export const useSendNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      caseId,
      agency,
      agencyName,
      agencyDetail,
      agencyEmail,
      sentBy
    }: {
      caseId: string;
      agency: string;
      agencyName: string;
      agencyDetail: string;
      agencyEmail: string;
      sentBy: string;
    }) => {
      const { error } = await supabase
        .from('enforcement_notifications')
        .insert({
          case_id: caseId,
          agency,
          agency_name: agencyName,
          agency_detail: agencyDetail,
          agency_email: agencyEmail,
          status: 'sent',
          sent_at: new Date().toISOString(),
          sent_by: sentBy
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enforcement-notifications'] });
    }
  });
};

export const useCaseNotifications = (caseId: string | null) => {
  return useQuery({
    queryKey: ['enforcement-notifications', caseId],
    queryFn: async () => {
      if (!caseId) return [];
      
      const { data, error } = await supabase
        .from('enforcement_notifications')
        .select('*')
        .eq('case_id', caseId);

      if (error) throw error;
      return data as EnforcementNotificationDB[];
    },
    enabled: !!caseId
  });
};
