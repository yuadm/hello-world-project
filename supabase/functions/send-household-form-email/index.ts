import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const brevoApiKey = Deno.env.get("BREVO_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendFormRequest {
  memberId: string;
  memberEmail: string;
  applicantEmail: string;
  applicantName: string;
  isEmployee?: boolean;
  employeeId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { memberId, memberEmail, applicantEmail, applicantName, isEmployee, employeeId }: SendFormRequest = await req.json();
    
    console.log("Sending household form email for member:", memberId, "isEmployee:", isEmployee);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let memberData: any;
    let parentId: string;

    // Get member details based on whether it's an employee or applicant
    if (isEmployee && employeeId) {
      const { data, error } = await supabase
        .from("employee_household_members")
        .select("*")
        .eq("id", memberId)
        .single();

      if (error || !data) {
        throw new Error("Employee household member not found");
      }
      memberData = data;
      parentId = employeeId;
    } else {
      const { data, error } = await supabase
        .from("household_member_dbs_tracking")
        .select("*")
        .eq("id", memberId)
        .single();

      if (error || !data) {
        throw new Error("Applicant household member not found");
      }
      memberData = data;
      parentId = memberData.application_id;
    }

    // Generate secure form token
    const formToken = crypto.randomUUID();

    // Update member with form token
    if (isEmployee) {
      const { error: updateError } = await supabase
        .from("employee_household_members")
        .update({
          form_token: formToken,
          email: memberEmail,
          last_contact_date: new Date().toISOString()
        })
        .eq("id", memberId);

      if (updateError) {
        console.error("Error updating employee member:", updateError);
        throw updateError;
      }
    } else {
      const { error: updateError } = await supabase
        .from("household_member_dbs_tracking")
        .update({
          form_token: formToken,
          email: memberEmail,
          last_contact_date: new Date().toISOString()
        })
        .eq("id", memberId);

      if (updateError) {
        console.error("Error updating applicant member:", updateError);
        throw updateError;
      }

      // Create form record only for applicants (household_member_forms is for applicants)
      const { error: formError } = await supabase
        .from("household_member_forms")
        .insert({
          member_id: memberId,
          application_id: parentId,
          form_token: formToken,
          status: "draft"
        });

      if (formError) {
        console.error("Error creating form record:", formError);
      }
    }

    const formUrl = `https://childminderpro.vercel.app/household-form?token=${formToken}`;

    // Send email to household member
    const memberEmailResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": brevoApiKey!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { 
          name: "Childminder Registration", 
          email: Deno.env.get("BREVO_SENDER_EMAIL") || "yuadm3@gmail.com"
        },
        to: [{ email: memberEmail, name: memberData.full_name }],
        subject: "Complete Your CMA-H2 Suitability Check Form",
        htmlContent: `
          <h1>Complete Your Suitability Check Form</h1>
          <p>Dear ${memberData.full_name},</p>
          <p>${applicantName} ${isEmployee ? 'is a registered childminder' : 'has applied to become a registered childminder'}. As you are a member of their household, we need to complete suitability checks on all adults.</p>
          
          <p><strong>Please complete the CMA-H2 form using the link below:</strong></p>
          <p><a href="${formUrl}" style="display: inline-block; background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Complete Form</a></p>
          
          <p>This form will ask for:</p>
          <ul>
            <li>Personal details and identification</li>
            <li>Address history</li>
            <li>DBS certificate information (if applicable)</li>
            <li>Vetting and suitability information</li>
            <li>Health and lifestyle declarations</li>
          </ul>

          <p><strong>Important:</strong> This link is unique to you. Please complete the form as soon as possible to avoid delays in the registration process.</p>

          <p>If you have any questions, please contact the registration team.</p>

          <p>Best regards,<br>Childminder Registration Team</p>
        `,
      }),
    });

    if (!memberEmailResponse.ok) {
      const errorText = await memberEmailResponse.text();
      console.error("Brevo API error status:", memberEmailResponse.status);
      console.error("Brevo API error response:", errorText);
      throw new Error(`Failed to send email to household member: ${errorText}`);
    }

    // Send notification to applicant
    const applicantEmailResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": brevoApiKey!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { 
          name: "Childminder Registration", 
          email: Deno.env.get("BREVO_SENDER_EMAIL") || "yuadm3@gmail.com"
        },
        to: [{ email: applicantEmail, name: applicantName }],
        subject: "Household Member Form Sent",
        htmlContent: `
          <h1>Form Sent to Household Member</h1>
          <p>Dear ${applicantName},</p>
          <p>We have sent the CMA-H2 Suitability Check form to <strong>${memberData.full_name}</strong> at ${memberEmail}.</p>
          
          <p><strong>Next steps:</strong></p>
          <ul>
            <li>Please remind ${memberData.full_name} to check their email and complete the form</li>
            <li>They should complete the form as soon as possible</li>
            <li>We will notify you once they have submitted the form</li>
            <li>You can track progress in your admin portal</li>
          </ul>

          <p>If they don't receive the email, please check their spam folder or contact us to resend it.</p>

          <p>Best regards,<br>Childminder Registration Team</p>
        `,
      }),
    });

    if (!applicantEmailResponse.ok) {
      console.error("Failed to send applicant notification email");
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: "Form email sent successfully"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-household-form-email:", error);
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
