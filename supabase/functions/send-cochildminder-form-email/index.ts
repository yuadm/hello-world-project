import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { cochildminderId, customEmail, applicantEmail, applicantName, isEmployee, employeeEmail, employeeName, prefillData } = await req.json();

    console.log(`[send-cochildminder-form-email] Processing for co-childminder: ${cochildminderId}, isEmployee: ${isEmployee}`);

    // Get co-childminder details
    const { data: cochildminder, error: cochildminderError } = await supabase
      .from("compliance_cochildminders")
      .select("*")
      .eq("id", cochildminderId)
      .single();

    if (cochildminderError) {
      console.error(`[send-cochildminder-form-email] Error fetching co-childminder:`, cochildminderError);
      throw cochildminderError;
    }

    const parentEmail = isEmployee ? employeeEmail : applicantEmail;
    const parentName = isEmployee ? employeeName : applicantName;

    // Generate secure token
    const formToken = crypto.randomUUID();

    // Update co-childminder with form token
    const { error: updateError } = await supabase
      .from("compliance_cochildminders")
      .update({
        form_token: formToken,
        form_status: "sent",
        form_sent_date: new Date().toISOString(),
        email: customEmail || cochildminder.email,
        reminder_count: (cochildminder.reminder_count || 0) + 1,
        last_reminder_date: new Date().toISOString(),
      })
      .eq("id", cochildminderId);

    if (updateError) {
      console.error(`[send-cochildminder-form-email] Error updating co-childminder:`, updateError);
      throw updateError;
    }

    // Create draft form record with pre-filled data
    const { error: formError } = await supabase
      .from("cochildminder_applications")
      .insert({
        cochildminder_id: cochildminderId,
        employee_id: isEmployee ? cochildminder.employee_id : null,
        application_id: !isEmployee ? cochildminder.application_id : null,
        form_token: formToken,
        status: "draft",
        // Pre-fill from main application
        premises_address: prefillData?.premisesAddress || null,
        local_authority: prefillData?.localAuthority || null,
        premises_type: prefillData?.premisesType || null,
        service_age_groups: prefillData?.serviceAgeGroups || null,
        service_hours: prefillData?.serviceHours || null,
        // Pre-fill co-childminder's basic details
        first_name: cochildminder.first_name,
        last_name: cochildminder.last_name,
        date_of_birth: cochildminder.date_of_birth,
      });

    if (formError) {
      console.error("[send-cochildminder-form-email] Failed to create form record:", formError);
      // Don't throw - continue with email sending
    } else {
      console.log("[send-cochildminder-form-email] Created cochildminder_applications record successfully");
    }

    // Send email to co-childminder via Brevo
    const cochildminderEmailAddress = customEmail || cochildminder.email;
    const formUrl = `https://childminderpro.vercel.app/cochildminder-form?token=${formToken}`;

    const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": Deno.env.get("BREVO_API_KEY") || "",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "Ready Kids Registration",
          email: Deno.env.get("BREVO_SENDER_EMAIL") || "noreply@readykids.co.uk",
        },
        to: [{ email: cochildminderEmailAddress, name: `${cochildminder.first_name} ${cochildminder.last_name}` }],
        subject: "Complete Your Co-childminder Registration Application",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #d97706; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">Ready Kids</h1>
              <p style="margin: 5px 0 0 0;">Childminder Registration Service</p>
            </div>
            
            <div style="padding: 30px; background-color: #f9fafb;">
              <h2 style="color: #d97706; margin-top: 0;">Co-childminder Application Required</h2>
              
              <p>Dear ${cochildminder.first_name},</p>
              
              <p>You have been invited to complete a <strong>Co-childminder Registration Application</strong> because you will be sharing childminding premises with ${parentName}.</p>
              
              <p>As a co-childminder, you will have your own Ofsted registration and work independently, but share the same premises. This application is similar to a full childminder registration application.</p>
              
              <div style="background-color: white; padding: 20px; margin: 25px 0; border-left: 4px solid #d97706;">
                <p style="margin: 0 0 15px 0; font-weight: bold;">Click the button below to access your secure application:</p>
                <a href="${formUrl}" style="display: inline-block; background-color: #d97706; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Complete Co-childminder Application</a>
              </div>
              
              <p><strong>What's already filled in for you:</strong></p>
              <ul style="color: #374151;">
                <li>Premises address and local authority</li>
                <li>Service age groups and hours</li>
                <li>Your basic personal details</li>
              </ul>
              
              <p><strong>What you need to complete:</strong></p>
              <ul style="color: #374151;">
                <li>Full personal details and address history</li>
                <li>Your qualifications and training</li>
                <li>Employment history and references</li>
                <li>Suitability declarations</li>
              </ul>
              
              <p><strong>Important:</strong></p>
              <ul style="color: #374151;">
                <li>This link is unique to you and should not be shared</li>
                <li>You can save your progress and return later</li>
                <li>Please complete the form within 14 days</li>
                <li>All information will be kept confidential</li>
              </ul>
              
              <p>If you have any questions or need assistance, please contact ${parentName} at ${parentEmail}.</p>
              
              <p>Thank you for your cooperation.</p>
              
              <p style="margin-top: 30px;">
                <strong>Ready Kids Registration Team</strong>
              </p>
            </div>
            
            <div style="background-color: #e5e7eb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
              <p style="margin: 0;">This is an automated message from Ready Kids Childminder Registration Service</p>
            </div>
          </div>
        `,
      }),
    });

    if (!brevoResponse.ok) {
      const error = await brevoResponse.text();
      console.error("[send-cochildminder-form-email] Brevo error:", error);
      throw new Error(`Failed to send email: ${error}`);
    }

    console.log(`[send-cochildminder-form-email] Email sent successfully to ${cochildminderEmailAddress}`);

    // Send notification to parent (applicant or employee)
    const parentNotificationResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": Deno.env.get("BREVO_API_KEY") || "",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "Ready Kids Registration",
          email: Deno.env.get("BREVO_SENDER_EMAIL") || "noreply@readykids.co.uk",
        },
        to: [{ email: parentEmail, name: parentName }],
        subject: "Co-childminder Application Form Sent Successfully",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #d97706; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">Ready Kids</h1>
            </div>
            
            <div style="padding: 30px; background-color: #f9fafb;">
              <h2 style="color: #d97706; margin-top: 0;">Form Request Sent</h2>
              
              <p>Dear ${parentName},</p>
              
              <p>The Co-childminder Registration Application has been successfully sent to:</p>
              
              <div style="background-color: white; padding: 15px; margin: 20px 0; border-left: 4px solid #10b981;">
                <p style="margin: 5px 0;"><strong>Name:</strong> ${cochildminder.first_name} ${cochildminder.last_name}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${cochildminderEmailAddress}</p>
              </div>
              
              <p>They will receive an email with a secure link to complete their full co-childminder application. You will be notified once they submit it.</p>
              
              <p style="margin-top: 30px;">
                <strong>Ready Kids Registration Team</strong>
              </p>
            </div>
          </div>
        `,
      }),
    });

    if (!parentNotificationResponse.ok) {
      console.error("[send-cochildminder-form-email] Failed to send parent notification");
    }

    return new Response(
      JSON.stringify({ success: true, formToken }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[send-cochildminder-form-email] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});