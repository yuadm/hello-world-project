import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting compliance status check...");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all household members with their current compliance data
    const { data: members, error: fetchError } = await supabase
      .from("household_member_dbs_tracking")
      .select("*");

    if (fetchError) {
      console.error("Error fetching members:", fetchError);
      throw fetchError;
    }

    console.log(`Processing ${members?.length || 0} household members`);

    const updates: any[] = [];
    const today = new Date();

    for (const member of members || []) {
      // Calculate compliance status using the database function
      const { data: statusData } = await supabase.rpc("calculate_compliance_status", {
        member_row: member,
      });

      if (statusData && statusData.length > 0) {
        const { calculated_compliance_status, calculated_risk_level, days_overdue } = statusData[0];

        // Prepare update
        const update: any = {
          compliance_status: calculated_compliance_status,
          risk_level: calculated_risk_level,
        };

        // Calculate follow-up due date based on risk level
        if (calculated_risk_level === 'critical') {
          // Follow up immediately
          update.follow_up_due_date = today.toISOString().split('T')[0];
        } else if (calculated_risk_level === 'high') {
          // Follow up in 3 days
          const followUp = new Date(today);
          followUp.setDate(followUp.getDate() + 3);
          update.follow_up_due_date = followUp.toISOString().split('T')[0];
        } else if (calculated_risk_level === 'medium') {
          // Follow up in 7 days
          const followUp = new Date(today);
          followUp.setDate(followUp.getDate() + 7);
          update.follow_up_due_date = followUp.toISOString().split('T')[0];
        }

        // Check if reminders need to be sent
        let needsReminder = false;
        let reminderType = '';

        // Check for overdue DBS requests
        if (member.dbs_status === 'requested' && member.dbs_request_date) {
          const requestDate = new Date(member.dbs_request_date);
          const daysSinceRequest = Math.floor((today.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24));
          const lastReminderDate = member.last_reminder_date ? new Date(member.last_reminder_date) : null;
          const daysSinceLastReminder = lastReminderDate 
            ? Math.floor((today.getTime() - lastReminderDate.getTime()) / (1000 * 60 * 60 * 24))
            : 999;

          // Send reminders at 7, 14, 21, 28 days
          if ([7, 14, 21, 28].includes(daysSinceRequest) && daysSinceLastReminder >= 7) {
            needsReminder = true;
            reminderType = 'overdue_dbs';
          }
        }

        // Check for certificate expiry
        if (member.dbs_certificate_expiry_date) {
          const expiryDate = new Date(member.dbs_certificate_expiry_date);
          const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

          // Send expiry reminders at 90, 60, 30, 14 days before expiry
          if ([90, 60, 30, 14].includes(daysUntilExpiry) && !member.expiry_reminder_sent) {
            needsReminder = true;
            reminderType = 'certificate_expiry';
          }
        }

        // Check for approaching 16th birthday
        if (member.member_type === 'child') {
          const birthDate = new Date(member.date_of_birth);
          const sixteenthBirthday = new Date(birthDate);
          sixteenthBirthday.setFullYear(birthDate.getFullYear() + 16);
          const daysUntil16 = Math.floor((sixteenthBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

          // Send 16th birthday alerts at 90, 30, 7, 0 days
          if ([90, 30, 7, 0].includes(daysUntil16) && !member.turning_16_notification_sent) {
            needsReminder = true;
            reminderType = '16th_birthday';
          }
        }

        // Log what would be updated (actual reminder sending would be done by other functions)
        if (needsReminder) {
          console.log(`Member ${member.full_name} needs ${reminderType} reminder`);
          // In a full implementation, you would invoke the appropriate email function here
        }

        // Apply the update
        const { error: updateError } = await supabase
          .from("household_member_dbs_tracking")
          .update(update)
          .eq("id", member.id);

        if (updateError) {
          console.error(`Error updating member ${member.id}:`, updateError);
        } else {
          updates.push({ id: member.id, ...update });
        }
      }
    }

    console.log(`Successfully updated ${updates.length} members`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${members?.length || 0} members, updated ${updates.length}`,
        updates,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in check-compliance-status:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
