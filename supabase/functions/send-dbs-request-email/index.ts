import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
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

    // Send email
    const emailResponse = await resend.emails.send({
      from: "Childminder Registration <onboarding@resend.dev>",
      to: [memberEmail],
      subject: "DBS Check Required - Childminder Registration",
      html: `
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
    });

    console.log("Email sent successfully:", emailResponse);

    // Update DBS tracking record
    const { error: updateError } = await supabase
      .from("household_member_dbs_tracking")
      .update({
        dbs_status: "requested",
        dbs_request_date: new Date().toISOString(),
      })
      .eq("id", memberId);

    if (updateError) {
      console.error("Error updating DBS tracking:", updateError);
      throw updateError;
    }

    return new Response(JSON.stringify({ success: true, emailResponse }), {
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
