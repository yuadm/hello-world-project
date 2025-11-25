import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const brevoApiKey = Deno.env.get("BREVO_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DBSRequestData {
  memberId: string;
  memberName: string;
  memberEmail: string;
  applicationId: string;
  applicantName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { memberId, memberName, memberEmail, applicationId, applicantName }: DBSRequestData = await req.json();
    
    console.log("Sending DBS request email to:", memberEmail);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Send email via Brevo
    const emailResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": brevoApiKey!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { 
          name: "Childminder Registration", 
          email: Deno.env.get("BREVO_SENDER_EMAIL") || "noreply@yourdomain.com"
        },
        to: [{ email: memberEmail, name: memberName }],
        subject: "DBS Check Required - Childminder Registration",
        htmlContent: `
          <h1>DBS Check Required</h1>
          <p>Dear ${memberName},</p>
          <p>As part of the childminder registration process for <strong>${applicantName}</strong>, you are required to complete a DBS (Disclosure and Barring Service) check.</p>
          
          <h2>What You Need to Do:</h2>
          <ol>
            <li>Apply for an Enhanced DBS check with barred list check for working with children</li>
            <li>You can apply online at: <a href="https://www.gov.uk/request-copy-criminal-record">https://www.gov.uk/request-copy-criminal-record</a></li>
            <li>Keep your DBS certificate number safe - you'll need to provide it to the registration team</li>
          </ol>

          <h2>Important Information:</h2>
          <ul>
            <li>The DBS check must be an Enhanced check</li>
            <li>Processing typically takes 2-4 weeks</li>
            <li>You may need to pay a fee (check current rates)</li>
            <li>You'll need proof of identity and address</li>
          </ul>

          <p><strong>Application Reference:</strong> ${applicationId}</p>

          <p>If you have any questions about this requirement, please contact the registration team.</p>

          <p>Best regards,<br>Childminder Registration Team</p>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error("Brevo email error:", errorData);
      throw new Error(`Email failed: ${JSON.stringify(errorData)}`);
    }

    const emailData = await emailResponse.json();
    console.log("Email sent successfully:", emailData);

    // Get current member data to track reminder history
    const { data: memberData } = await supabase
      .from("household_member_dbs_tracking")
      .select("reminder_count, reminder_history")
      .eq("id", memberId)
      .single();

    const currentReminderCount = memberData?.reminder_count || 0;
    const currentHistory = memberData?.reminder_history || [];
    
    // Add to reminder history
    const newHistoryEntry = {
      date: new Date().toISOString(),
      type: 'dbs_request',
      recipient: memberEmail,
      success: true
    };
    
    // Update request date and reminder tracking in table
    const { error: updateError } = await supabase
      .from("household_member_dbs_tracking")
      .update({
        dbs_status: "requested",
        dbs_request_date: new Date().toISOString(),
        last_contact_date: new Date().toISOString(),
        reminder_count: currentReminderCount + 1,
        last_reminder_date: new Date().toISOString(),
        reminder_history: [...currentHistory, newHistoryEntry],
      })
      .eq("id", memberId);

    if (updateError) {
      console.error("Error updating DBS tracking:", updateError);
      throw updateError;
    }

    return new Response(JSON.stringify({ success: true, emailData }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-dbs-request-email:", error);
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
