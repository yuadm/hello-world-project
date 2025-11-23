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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log("Checking for upcoming 16th birthdays...");

    // Get children approaching 16 who haven't been notified
    const { data: approaching16, error: queryError } = await supabase
      .rpc('get_members_approaching_16', { days_ahead: 90 });

    if (queryError) {
      console.error("Error querying approaching 16:", queryError);
      throw queryError;
    }

    console.log(`Found ${approaching16?.length || 0} children approaching 16`);

    const results = [];

    for (const member of approaching16 || []) {
      if (member.turning_16_notification_sent) {
        console.log(`Already notified for ${member.full_name}`);
        continue;
      }

      // Get application details
      const { data: application, error: appError } = await supabase
        .from('childminder_applications')
        .select('email, first_name, last_name')
        .eq('id', member.application_id)
        .single();

      if (appError || !application) {
        console.error(`Error fetching application ${member.application_id}:`, appError);
        continue;
      }

      // Only send notifications for: today, 7 days, 30 days, 90 days
      const shouldNotify = member.days_until_16 === 0 || 
                          member.days_until_16 === 7 || 
                          member.days_until_16 === 30 || 
                          member.days_until_16 === 90;

      if (!shouldNotify) {
        console.log(`Skipping notification for ${member.full_name} (${member.days_until_16} days)`);
        continue;
      }

      // Call the birthday alert edge function
      const alertResponse = await fetch(`${supabaseUrl}/functions/v1/send-16th-birthday-alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          memberId: member.id,
          childName: member.full_name,
          dateOfBirth: member.date_of_birth,
          daysUntil16: member.days_until_16,
          applicantEmail: application.email,
          applicantName: `${application.first_name} ${application.last_name}`,
          applicationId: member.application_id,
        }),
      });

      const alertResult = await alertResponse.json();
      results.push({
        member: member.full_name,
        daysUntil16: member.days_until_16,
        success: alertResponse.ok,
        result: alertResult,
      });

      console.log(`Notification sent for ${member.full_name}:`, alertResult);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        checked: approaching16?.length || 0,
        notified: results.length,
        results 
      }), 
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in check-upcoming-birthdays:", error);
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
