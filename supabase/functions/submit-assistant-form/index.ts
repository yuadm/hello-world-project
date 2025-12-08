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

    const { token, formData } = await req.json();

    console.log(`[submit-assistant-form] Processing submission for token: ${token}`);

    // Check if form is already submitted (duplicate submission prevention)
    const { data: existingForm } = await supabase
      .from("compliance_assistant_forms")
      .select("status, submitted_at")
      .eq("form_token", token)
      .maybeSingle();

    if (existingForm?.status === "submitted") {
      console.log("[submit-assistant-form] Form already submitted, rejecting duplicate");
      throw new Error("This form has already been submitted");
    }

    // Get assistant data from unified table using form token
    const { data: assistant, error: assistantError } = await supabase
      .from("compliance_assistants")
      .select(`
        *,
        childminder_applications(id, first_name, last_name, email),
        employees(id, first_name, last_name, email)
      `)
      .eq("form_token", token)
      .single();

    if (assistantError) {
      console.error("[submit-assistant-form] Error fetching assistant:", assistantError);
      throw assistantError;
    }
    if (!assistant) throw new Error("Invalid form token");

    const isEmployee = !!assistant.employee_id;
    const parent = isEmployee ? assistant.employees : assistant.childminder_applications;

    // Build form update payload
    const formUpdatePayload = {
      status: "submitted",
      submitted_at: new Date().toISOString(),
      title: formData.title,
      first_name: formData.firstName,
      middle_names: formData.middleNames,
      last_name: formData.lastName,
      previous_names: formData.previousNames,
      date_of_birth: formData.dob,
      birth_town: formData.birthTown,
      sex: formData.sex,
      ni_number: formData.niNumber,
      current_address: {
        address_line_1: formData.homeAddressLine1,
        address_line_2: formData.homeAddressLine2,
        town: formData.homeTown,
        postcode: formData.homePostcode,
        move_in_date: formData.homeMoveIn
      },
      address_history: formData.addressHistory,
      lived_outside_uk: formData.livedOutsideUK,
      employment_history: formData.employmentHistory,
      employment_gaps: formData.employmentGaps,
      pfa_completed: formData.pfaCompleted,
      safeguarding_completed: formData.safeguardingCompleted,
      previous_registration: formData.prevReg,
      previous_registration_details: formData.prevRegInfo,
      has_dbs: formData.hasDBS,
      dbs_number: formData.dbsNumber,
      dbs_update_service: formData.dbsUpdate,
      criminal_history: formData.offenceHistory,
      criminal_history_details: formData.offenceDetails,
      disqualified: formData.disqualified,
      social_services: formData.socialServices,
      social_services_details: formData.socialServicesInfo,
      health_conditions: formData.healthCondition,
      health_conditions_details: formData.healthConditionDetails,
      smoker: formData.smoker,
      consent_checks: formData.consentChecks,
      declaration_truth: formData.declarationTruth,
      declaration_notify: formData.declarationNotify,
      signature_name: formData.signatureFullName,
      signature_date: formData.signatureDate
    };

    // Update unified form table
    const { error: formError } = await supabase
      .from("compliance_assistant_forms")
      .update(formUpdatePayload)
      .eq("form_token", token);

    if (formError) {
      console.error("[submit-assistant-form] Error updating compliance_assistant_forms:", formError);
      throw formError;
    }

    // Update unified tracking table
    const { error: trackingError } = await supabase
      .from("compliance_assistants")
      .update({
        form_status: "submitted",
        form_submitted_date: new Date().toISOString(),
      })
      .eq("id", assistant.id);

    if (trackingError) {
      console.error("[submit-assistant-form] Error updating compliance_assistants:", trackingError);
      throw trackingError;
    }

    // Send confirmation email to assistant
    await sendConfirmationEmail(assistant, parent);

    // Send notification to parent
    await sendParentNotification(assistant, parent, isEmployee);

    console.log(`[submit-assistant-form] Assistant form submitted successfully for ${assistant.first_name} ${assistant.last_name}`);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[submit-assistant-form] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function sendConfirmationEmail(assistant: any, parent: any) {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
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
        to: [{ email: assistant.email, name: `${assistant.first_name} ${assistant.last_name}` }],
        subject: "CMA-A1 Form Submitted Successfully",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1e40af; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">Ready Kids</h1>
            </div>
            
            <div style="padding: 30px; background-color: #f9fafb;">
              <div style="background-color: #10b981; color: white; padding: 15px; border-radius: 5px; text-align: center; margin-bottom: 20px;">
                <h2 style="margin: 0;">✓ Form Submitted Successfully</h2>
              </div>
              
              <p>Dear ${assistant.first_name},</p>
              
              <p>Thank you for completing your <strong>CMA-A1 Suitability Check</strong> form. We have received your submission.</p>
              
              <p>Your form has been sent to ${parent.first_name} ${parent.last_name} for review.</p>
              
              <p>If any additional information is required, you will be contacted directly.</p>
              
              <p style="margin-top: 30px;">
                <strong>Ready Kids Registration Team</strong>
              </p>
            </div>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      console.error("[submit-assistant-form] Failed to send confirmation email");
    }
  } catch (error) {
    console.error("[submit-assistant-form] Error sending confirmation email:", error);
  }
}

async function sendParentNotification(assistant: any, parent: any, isEmployee: boolean) {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
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
        to: [{ email: parent.email, name: `${parent.first_name} ${parent.last_name}` }],
        subject: "Assistant Form Completed",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1e40af; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">Ready Kids</h1>
            </div>
            
            <div style="padding: 30px; background-color: #f9fafb;">
              <h2 style="color: #1e40af; margin-top: 0;">Assistant Form Completed</h2>
              
              <p>Dear ${parent.first_name},</p>
              
              <p>${assistant.first_name} ${assistant.last_name} has successfully completed their CMA-A1 Suitability Check form.</p>
              
              <div style="background-color: white; padding: 15px; margin: 20px 0; border-left: 4px solid #10b981;">
                <p style="margin: 5px 0;"><strong>Name:</strong> ${assistant.first_name} ${assistant.last_name}</p>
                <p style="margin: 5px 0;"><strong>Role:</strong> ${assistant.role}</p>
                <p style="margin: 5px 0;"><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <p>You can now view and download the completed form from your ${isEmployee ? 'employee' : 'admin'} dashboard.</p>
              
              <p style="margin-top: 30px;">
                <strong>Ready Kids Registration Team</strong>
              </p>
            </div>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      console.error("[submit-assistant-form] Failed to send parent notification");
    }
  } catch (error) {
    console.error("[submit-assistant-form] Error sending parent notification:", error);
  }
}
