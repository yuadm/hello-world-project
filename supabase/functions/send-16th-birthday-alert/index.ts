import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const brevoApiKey = Deno.env.get("BREVO_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BirthdayAlertData {
  memberId: string;
  childName: string;
  dateOfBirth: string;
  daysUntil16: number;
  applicantEmail: string;
  applicantName: string;
  applicationId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { memberId, childName, dateOfBirth, daysUntil16, applicantEmail, applicantName, applicationId }: BirthdayAlertData = await req.json();
    
    console.log("Sending 16th birthday alert for:", childName);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const urgencyLevel = daysUntil16 === 0 ? "URGENT - TODAY" : 
                        daysUntil16 <= 7 ? "URGENT" : 
                        daysUntil16 <= 30 ? "Important" : 
                        "Advance Notice";

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
        to: [{ email: applicantEmail, name: applicantName }],
        subject: `${urgencyLevel}: DBS Check Required for ${childName} Turning 16`,
        htmlContent: `
          <h1 style="color: ${daysUntil16 <= 7 ? '#dc2626' : '#ea580c'};">${urgencyLevel}: Child Turning 16</h1>
          <p>Dear ${applicantName},</p>
          
          ${daysUntil16 === 0 ? 
            `<p style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px;"><strong>URGENT: ${childName} turns 16 TODAY!</strong> They now require a DBS check immediately.</p>` :
            `<p><strong>${childName}</strong> will turn 16 in <strong>${daysUntil16} days</strong> (on ${dateOfBirth}).</p>`
          }

          <h2>Action Required:</h2>
          <p>Once ${childName} turns 16, they will require an Enhanced DBS check as they will be living at the registered childminding premises.</p>

          <h3>What You Need to Do:</h3>
          <ol>
            <li>Ensure ${childName} applies for an Enhanced DBS check ${daysUntil16 === 0 ? 'immediately' : 'on or shortly after their 16th birthday'}</li>
            <li>The check must be Enhanced with barred list for working with children</li>
            <li>Apply online at: <a href="https://www.gov.uk/request-copy-criminal-record">https://www.gov.uk/request-copy-criminal-record</a></li>
            <li>Keep the DBS certificate number for your records</li>
          </ol>

          <h3>Important Notes:</h3>
          <ul>
            <li>Processing typically takes 2-4 weeks</li>
            <li>Proof of identity and address will be required</li>
            <li>There may be a fee (check current rates)</li>
            <li>This is a regulatory requirement for all household members aged 16+</li>
          </ul>

          <p><strong>Application Reference:</strong> ${applicationId}</p>

          <p>If you have any questions, please contact the registration team.</p>

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
    console.log("Birthday alert sent successfully:", emailData);

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
      type: '16th_birthday_alert',
      recipient: applicantEmail,
      success: true,
      urgency: urgencyLevel
    };

    // Update notification sent flag and reminder tracking
    const { error: updateError } = await supabase
      .from("household_member_dbs_tracking")
      .update({
        turning_16_notification_sent: true,
        last_contact_date: new Date().toISOString(),
        reminder_count: currentReminderCount + 1,
        last_reminder_date: new Date().toISOString(),
        reminder_history: [...currentHistory, newHistoryEntry],
      })
      .eq("id", memberId);

    if (updateError) {
      console.error("Error updating notification flag:", updateError);
      throw updateError;
    }

    return new Response(JSON.stringify({ success: true, emailData }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-16th-birthday-alert:", error);
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
