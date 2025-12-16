import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Building, 
  Mail, 
  Check, 
  Send, 
  AlertTriangle, 
  ExternalLink,
  X
} from "lucide-react";
import { NOTIFICATION_AGENCIES } from "@/lib/enforcementUtils";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { ProviderAddress } from "@/types/enforcement";

interface NotificationWorkflowProps {
  provider: { 
    id: string; 
    name: string;
    registrationRef?: string;
    address?: ProviderAddress;
  };
  actionType: string;
  caseId: string;
  caseReference?: string;
  effectiveDate?: string;
  concerns?: string[];
  onClose: (allSent: boolean) => void;
}

interface NotificationItem {
  id: string;
  name: string;
  detail: string;
  email: string;
  status: 'pending' | 'sent' | 'error';
  sentAt?: Date;
  error?: string;
}

export const NotificationWorkflow = ({ 
  provider, 
  actionType, 
  caseId,
  caseReference,
  effectiveDate,
  concerns,
  onClose 
}: NotificationWorkflowProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    NOTIFICATION_AGENCIES.map(a => ({
      id: a.id,
      name: a.name,
      detail: a.detail,
      email: a.email,
      status: 'pending'
    }))
  );
  const [sendingId, setSendingId] = useState<string | null>(null);

  const allSent = notifications.every(n => n.status === 'sent');

  const handleSend = async (notificationId: string) => {
    setSendingId(notificationId);
    const notification = notifications.find(n => n.id === notificationId);
    
    if (notification && caseId) {
      try {
        console.log('Sending enforcement notification to:', notification.name);
        
        const { data, error } = await supabase.functions.invoke('send-enforcement-notification', {
          body: {
            caseId,
            agency: notification.id,
            agencyName: notification.name,
            agencyDetail: notification.detail,
            agencyEmail: notification.email,
            sentBy: 'Admin User',
            provider: {
              id: provider.id,
              name: provider.name,
              registrationRef: provider.registrationRef,
              address: provider.address
            },
            actionType,
            effectiveDate,
            concerns,
            caseReference
          }
        });

        if (error) {
          console.error('Edge function error:', error);
          throw new Error(error.message || 'Failed to send notification');
        }

        console.log('Notification sent successfully:', data);
        
        setNotifications(prev => prev.map(n => 
          n.id === notificationId 
            ? { ...n, status: 'sent', sentAt: new Date() }
            : n
        ));
        
        queryClient.invalidateQueries({ queryKey: ['enforcement-notifications'] });
        
        toast({
          title: "Notification Sent",
          description: `Email sent to ${notification.name} (${notification.email}).`,
        });
      } catch (error: any) {
        console.error('Failed to send notification:', error);
        
        setNotifications(prev => prev.map(n => 
          n.id === notificationId 
            ? { ...n, status: 'error', error: error.message }
            : n
        ));
        
        toast({
          title: "Failed to Send",
          description: `Could not send notification to ${notification.name}. ${error.message}`,
          variant: "destructive"
        });
      }
    }
    
    setSendingId(null);
  };

  const handleSendAll = async () => {
    setSendingId('all');
    
    const pendingNotifications = notifications.filter(n => n.status === 'pending');
    
    for (const notification of pendingNotifications) {
      try {
        const { data, error } = await supabase.functions.invoke('send-enforcement-notification', {
          body: {
            caseId,
            agency: notification.id,
            agencyName: notification.name,
            agencyDetail: notification.detail,
            agencyEmail: notification.email,
            sentBy: 'Admin User',
            provider: {
              id: provider.id,
              name: provider.name,
              registrationRef: provider.registrationRef,
              address: provider.address
            },
            actionType,
            effectiveDate,
            concerns,
            caseReference
          }
        });

        if (error) throw error;
        
        setNotifications(prev => prev.map(n => 
          n.id === notification.id 
            ? { ...n, status: 'sent', sentAt: new Date() }
            : n
        ));
        
        // Small delay between sends
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error: any) {
        console.error(`Failed to send to ${notification.name}:`, error);
        setNotifications(prev => prev.map(n => 
          n.id === notification.id 
            ? { ...n, status: 'error', error: error.message }
            : n
        ));
      }
    }
    
    queryClient.invalidateQueries({ queryKey: ['enforcement-notifications'] });
    setSendingId(null);
    
    const sentCount = notifications.filter(n => n.status === 'sent').length + 
                      pendingNotifications.filter(n => !notifications.find(nn => nn.id === n.id && nn.status === 'error')).length;
    
    toast({
      title: "Notifications Complete",
      description: `${sentCount} of ${NOTIFICATION_AGENCIES.length} agencies have been notified.`,
    });
  };

  return (
    <Dialog open onOpenChange={() => onClose(allSent)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <Building className="w-7 h-7 text-blue-500" />
            Mandatory External Notifications
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-sm text-slate-600">
            <span className="font-semibold">Statutory Requirement:</span> Inform relevant agencies of {actionType} for {provider.name}
          </div>

          {/* Warning Banner */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold">Do not close this window until all notifications have been processed.</p>
              <p>Failure to notify these agencies within 24 hours is a regulatory breach.</p>
            </div>
          </div>

          {/* Notification List */}
          <div className="space-y-3">
            {notifications.map((n) => (
              <div 
                key={n.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border transition-all",
                  n.status === 'sent' 
                    ? 'bg-emerald-50 border-emerald-200' 
                    : n.status === 'error'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-white border-slate-200'
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    n.status === 'sent' ? 'bg-emerald-100' : n.status === 'error' ? 'bg-red-100' : 'bg-slate-100'
                  )}>
                    {n.status === 'sent' 
                      ? <Check className="w-5 h-5 text-emerald-600" /> 
                      : n.status === 'error'
                      ? <X className="w-5 h-5 text-red-600" />
                      : <Mail className="w-5 h-5 text-slate-500" />
                    }
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{n.name}</p>
                    <p className="text-sm text-slate-500">{n.detail}</p>
                    <p className="text-xs text-slate-400">{n.email}</p>
                    {n.status === 'sent' && n.sentAt && (
                      <p className="text-xs text-emerald-600 mt-1">
                        Sent: {n.sentAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                    {n.status === 'error' && n.error && (
                      <p className="text-xs text-red-600 mt-1">
                        Error: {n.error}
                      </p>
                    )}
                  </div>
                </div>
                
                <Button
                  onClick={() => handleSend(n.id)}
                  disabled={n.status === 'sent' || sendingId !== null}
                  variant={n.status === 'sent' ? 'ghost' : n.status === 'error' ? 'destructive' : 'outline'}
                  size="sm"
                  className={cn(
                    "gap-2",
                    n.status === 'sent' && 'text-emerald-600'
                  )}
                >
                  {sendingId === n.id ? (
                    <>Processing...</>
                  ) : n.status === 'sent' ? (
                    <>Verified</>
                  ) : n.status === 'error' ? (
                    <>Retry <Send className="w-3 h-3" /></>
                  ) : (
                    <>Send Notice <Send className="w-3 h-3" /></>
                  )}
                </Button>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onClose(allSent)}
            >
              {allSent ? 'Close' : 'Defer (Requires Reason)'}
            </Button>

            {!allSent && (
              <Button
                onClick={handleSendAll}
                disabled={sendingId !== null}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                {sendingId === 'all' ? 'Sending All...' : 'Notify All Parties Now'}
                {!sendingId && <ExternalLink className="w-4 h-4" />}
              </Button>
            )}

            {allSent && (
              <Button
                onClick={() => onClose(true)}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                <Check className="w-4 h-4" />
                Complete Enforcement Action
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
