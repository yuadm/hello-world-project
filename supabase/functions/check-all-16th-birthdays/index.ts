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
    console.log("Checking for children turning 16 soon across ALL households...");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check BOTH applicant households AND employee households for children turning 16
    
    // 1. Check applicant households
    const { data: applicantChildren, error: applicantError } = await supabase
      .rpc('get_applicant_children_turning_16_soon', { days_ahead: 90 });

    if (applicantError) {
      console.error("Error fetching applicant children:", applicantError);
      throw applicantError;
    }

    console.log(`Found ${applicantChildren?.length || 0} applicant household children turning 16 soon`);

    // 2. Check employee households
    const { data: employeeChildren, error: employeeError } = await supabase
      .rpc('get_children_turning_16_soon', { days_ahead: 90 });

    if (employeeError) {
      console.error("Error fetching employee children:", employeeError);
      throw employeeError;
    }

    console.log(`Found ${employeeChildren?.length || 0} employee household children turning 16 soon`);

    const notifications = [];

    // Process applicant household children
    for (const child of applicantChildren || []) {
      // Skip if notification already sent
      if (child.turning_16_notification_sent) {
        console.log(`Notification already sent for ${child.full_name}`);
        continue;
      }

      // Get application details for the applicant
      const { data: application } = await supabase
        .from('childminder_applications')
        .select('first_name, last_name, email')
        .eq('id', child.application_id)
        .single();

      if (!application?.email) {
        console.error(`No applicant email found for child ${child.full_name}`);
        continue;
      }

      // Send 16th birthday alert
      const applicantName = `${application.first_name} ${application.last_name}`;
      
      try {
        const { error: emailError } = await supabase.functions.invoke('send-16th-birthday-alert', {
          body: {
            memberId: child.id,
            childName: child.full_name,
            dateOfBirth: child.date_of_birth,
            daysUntil16: child.days_until_16,
            applicantEmail: application.email,
            applicantName,
            applicationId: child.application_id
          }
        });

        if (emailError) {
          console.error(`Failed to send email for ${child.full_name}:`, emailError);
        } else {
          notifications.push({
            type: 'applicant',
            child: child.full_name,
            daysUntil16: child.days_until_16,
            notified: applicantName
          });
        }
      } catch (error) {
        console.error(`Error sending notification for ${child.full_name}:`, error);
      }
    }

    // Process employee household children
    for (const child of employeeChildren || []) {
      // Get employee details
      const { data: employee } = await supabase
        .from('employees')
        .select('first_name, last_name, email')
        .eq('id', child.employee_id)
        .single();

      if (!employee?.email) {
        console.error(`No employee email found for child ${child.full_name}`);
        continue;
      }

      // Send 16th birthday alert
      const employeeName = `${employee.first_name} ${employee.last_name}`;
      
      try {
        const { error: emailError } = await supabase.functions.invoke('send-16th-birthday-alert', {
          body: {
            memberId: child.id,
            childName: child.full_name,
            dateOfBirth: child.date_of_birth,
            daysUntil16: child.days_until_16,
            applicantEmail: employee.email,
            applicantName: employeeName,
            applicationId: child.employee_id
          }
        });

        if (emailError) {
          console.error(`Failed to send email for ${child.full_name}:`, emailError);
        } else {
          notifications.push({
            type: 'employee',
            child: child.full_name,
            daysUntil16: child.days_until_16,
            notified: employeeName
          });
        }
      } catch (error) {
        console.error(`Error sending notification for ${child.full_name}:`, error);
      }
    }

    console.log(`Sent ${notifications.length} birthday notifications`);

    return new Response(
      JSON.stringify({
        success: true,
        applicantChildrenChecked: applicantChildren?.length || 0,
        employeeChildrenChecked: employeeChildren?.length || 0,
        notificationsSent: notifications.length,
        notifications
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in check-all-16th-birthdays:", error);
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
