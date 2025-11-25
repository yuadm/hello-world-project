import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const brevoApiKey = Deno.env.get("BREVO_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApplicantSummaryData {
  applicationId: string;
  applicantEmail: string;
  applicantName: string;
  requestedMemberIds: string[]; // IDs of members who just had DBS requests sent
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { applicationId, applicantEmail, applicantName, requestedMemberIds }: ApplicantSummaryData = await req.json();
    
    console.log("Sending applicant DBS summary to:", applicantEmail);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the members who were just sent requests
    const { data: requestedMembers, error: requestedError } = await supabase
      .from("household_member_dbs_tracking")
      .select("*")
      .in("id", requestedMemberIds);

    if (requestedError) {
      console.error("Error fetching requested members:", requestedError);
      throw requestedError;
    }

    // Get all children under 16
    const { data: allMembers, error: membersError } = await supabase
      .from("household_member_dbs_tracking")
      .select("*")
      .eq("application_id", applicationId)
      .eq("member_type", "child");

    if (membersError) {
      console.error("Error fetching children:", membersError);
      throw membersError;
    }

    // Calculate ages and filter children under 16
    const today = new Date();
    const childrenUnder16 = allMembers?.filter(child => {
      const birthDate = new Date(child.date_of_birth);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();
      
      const actualAge = (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) ? age - 1 : age;
      return actualAge < 16;
    }).map(child => {
      const birthDate = new Date(child.date_of_birth);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();
      const actualAge = (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) ? age - 1 : age;
      
      // Calculate 16th birthday
      const sixteenthBirthday = new Date(birthDate);
      sixteenthBirthday.setFullYear(birthDate.getFullYear() + 16);
      
      // Calculate days until 16th birthday
      const daysUntil16 = Math.ceil((sixteenthBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        ...child,
        age: actualAge,
        sixteenthBirthday: sixteenthBirthday.toLocaleDateString('en-GB', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        daysUntil16
      };
    }) || [];

    // Build requested members list HTML
    const requestedMembersList = requestedMembers?.map(member => 
      `<li><strong>${member.full_name}</strong>${member.relationship ? ` (${member.relationship})` : ''}</li>`
    ).join('') || '';

    // Build children list HTML
    const childrenListHtml = childrenUnder16.length > 0 ? `
      <h2>Children in Your Household</h2>
      <p>You also have the following children under 16 who will require DBS checks when they turn 16:</p>
      <ul>
        ${childrenUnder16.map(child => `
          <li><strong>${child.full_name}</strong> - Currently ${child.age} years old, turns 16 on ${child.sixteenthBirthday} (in ${child.daysUntil16} ${child.daysUntil16 === 1 ? 'day' : 'days'})</li>
        `).join('')}
      </ul>
      <p>ℹ️ <em>You will receive an automatic reminder when each child turns 16 to ensure they apply for their DBS check.</em></p>
    ` : '';

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
        subject: "DBS Requests Sent - Action Required",
        htmlContent: `
          <h1>DBS Requests Sent - Action Required</h1>
          <p>Dear ${applicantName},</p>

          <p>We have sent DBS (Disclosure and Barring Service) check requests to the following household members:</p>

          <ul>
            ${requestedMembersList}
          </ul>

          <p>These individuals have been contacted directly and asked to apply for an Enhanced DBS check. <strong>Please follow up with them to ensure they complete their applications as soon as possible.</strong></p>

          ${childrenListHtml}

          <h2>What You Need to Do:</h2>
          <ol>
            <li>Follow up with the household members listed above</li>
            <li>Ensure they complete their DBS applications within 2-4 weeks</li>
            <li>Remind them to keep their DBS certificate numbers safe</li>
            <li>Contact the registration team if you need assistance</li>
          </ol>

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
    console.log("Applicant summary email sent successfully:", emailData);

    return new Response(JSON.stringify({ success: true, emailData }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-applicant-dbs-summary:", error);
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
