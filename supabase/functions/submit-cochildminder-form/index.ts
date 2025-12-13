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

    const { formToken, formData } = await req.json();

    console.log(`[submit-cochildminder-form] Processing submission for token: ${formToken}`);

    // Get form record
    const { data: formRecord, error: formError } = await supabase
      .from("cochildminder_applications")
      .select("*, cochildminder:compliance_cochildminders(*)")
      .eq("form_token", formToken)
      .single();

    if (formError || !formRecord) {
      console.error("[submit-cochildminder-form] Form not found:", formError);
      throw new Error("Form not found or invalid token");
    }

    // Update the form with submitted data - map camelCase to snake_case
    const { error: updateFormError } = await supabase
      .from("cochildminder_applications")
      .update({
        title: formData.title,
        first_name: formData.firstName,
        middle_names: formData.middleNames,
        last_name: formData.lastName,
        sex: formData.sex,
        date_of_birth: formData.dateOfBirth || null,
        birth_town: formData.birthTown,
        ni_number: formData.niNumber,
        lived_outside_uk: formData.livedOutsideUk,
        outside_uk_details: formData.outsideUkDetails,
        previous_names: formData.previousNames,
        current_address: formData.currentAddress,
        address_history: formData.addressHistory,
        premises_type: formData.premisesType,
        premises_address: formData.premisesAddress,
        local_authority: formData.localAuthority,
        service_age_groups: formData.serviceAgeGroups,
        service_hours: formData.serviceHours,
        first_aid_completed: formData.firstAidCompleted,
        first_aid_provider: formData.firstAidProvider,
        first_aid_date: formData.firstAidDate || null,
        safeguarding_completed: formData.safeguardingCompleted,
        safeguarding_provider: formData.safeguardingProvider,
        safeguarding_date: formData.safeguardingDate || null,
        pfa_completed: formData.pfaCompleted,
        level_2_qualification: formData.level2Qualification,
        level_2_provider: formData.level2Provider,
        level_2_date: formData.level2Date || null,
        eyfs_completed: formData.eyfsCompleted,
        eyfs_provider: formData.eyfsProvider,
        eyfs_date: formData.eyfsDate || null,
        other_qualifications: formData.otherQualifications,
        employment_history: formData.employmentHistory,
        employment_gaps: formData.employmentGaps,
        reference_1_name: formData.reference1Name,
        reference_1_relationship: formData.reference1Relationship,
        reference_1_email: formData.reference1Email,
        reference_1_phone: formData.reference1Phone,
        reference_1_childcare: formData.reference1Childcare,
        reference_2_name: formData.reference2Name,
        reference_2_relationship: formData.reference2Relationship,
        reference_2_email: formData.reference2Email,
        reference_2_phone: formData.reference2Phone,
        reference_2_childcare: formData.reference2Childcare,
        has_dbs: formData.hasDbs,
        dbs_number: formData.dbsNumber,
        dbs_update_service: formData.dbsUpdateService,
        previous_registration: formData.previousRegistration,
        previous_registration_details: formData.previousRegistrationDetails,
        criminal_history: formData.criminalHistory,
        criminal_history_details: formData.criminalHistoryDetails,
        disqualified: formData.disqualified,
        social_services: formData.socialServices,
        social_services_details: formData.socialServicesDetails,
        health_conditions: formData.healthConditions,
        health_conditions_details: formData.healthConditionsDetails,
        smoker: formData.smoker,
        consent_checks: formData.consentChecks,
        declaration_truth: formData.declarationTruth,
        declaration_notify: formData.declarationNotify,
        signature_name: formData.signatureName,
        signature_date: formData.signatureDate || null,
        status: "submitted",
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("form_token", formToken);

    if (updateFormError) {
      console.error("[submit-cochildminder-form] Error updating form:", updateFormError);
      throw updateFormError;
    }

    // Update co-childminder tracking record
    const { error: updateCochildminderError } = await supabase
      .from("compliance_cochildminders")
      .update({
        form_status: "submitted",
        form_submitted_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", formRecord.cochildminder_id);

    if (updateCochildminderError) {
      console.error("[submit-cochildminder-form] Error updating co-childminder:", updateCochildminderError);
    }

    console.log(`[submit-cochildminder-form] Form submitted successfully`);

    // Get parent application/employee details for notification
    let parentEmail = "";
    let parentName = "";

    if (formRecord.application_id) {
      const { data: application } = await supabase
        .from("childminder_applications")
        .select("email, first_name, last_name")
        .eq("id", formRecord.application_id)
        .single();
      
      if (application) {
        parentEmail = application.email || "";
        parentName = `${application.first_name} ${application.last_name}`;
      }
    } else if (formRecord.employee_id) {
      const { data: employee } = await supabase
        .from("employees")
        .select("email, first_name, last_name")
        .eq("id", formRecord.employee_id)
        .single();
      
      if (employee) {
        parentEmail = employee.email || "";
        parentName = `${employee.first_name} ${employee.last_name}`;
      }
    }

    const cochildminderName = `${formRecord.cochildminder?.first_name} ${formRecord.cochildminder?.last_name}`;
    const cochildminderEmail = formRecord.cochildminder?.email || formData.email || "";

    // Send confirmation to co-childminder
    if (cochildminderEmail) {
      await fetch("https://api.brevo.com/v3/smtp/email", {
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
          to: [{ email: cochildminderEmail, name: cochildminderName }],
          subject: "Co-childminder Application Submitted Successfully",
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #10b981; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">Ready Kids</h1>
                <p style="margin: 5px 0 0 0;">Application Submitted</p>
              </div>
              
              <div style="padding: 30px; background-color: #f9fafb;">
                <h2 style="color: #10b981; margin-top: 0;">Thank You!</h2>
                
                <p>Dear ${formRecord.cochildminder?.first_name},</p>
                
                <p>Your co-childminder registration application has been successfully submitted.</p>
                
                <div style="background-color: white; padding: 20px; margin: 25px 0; border-left: 4px solid #10b981;">
                  <p style="margin: 0;"><strong>What happens next?</strong></p>
                  <ul style="color: #374151; margin-top: 10px;">
                    <li>Your application will be reviewed by the registration team</li>
                    <li>DBS checks will be initiated</li>
                    <li>You may be contacted for additional information</li>
                  </ul>
                </div>
                
                <p>If you have any questions, please don't hesitate to contact us.</p>
                
                <p style="margin-top: 30px;">
                  <strong>Ready Kids Registration Team</strong>
                </p>
              </div>
            </div>
          `,
        }),
      });
      console.log(`[submit-cochildminder-form] Confirmation email sent to co-childminder: ${cochildminderEmail}`);
    }

    // Send notification to parent applicant/employee
    if (parentEmail) {
      await fetch("https://api.brevo.com/v3/smtp/email", {
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
          subject: "Co-childminder Application Received",
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #10b981; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">Ready Kids</h1>
              </div>
              
              <div style="padding: 30px; background-color: #f9fafb;">
                <h2 style="color: #10b981; margin-top: 0;">Application Received</h2>
                
                <p>Dear ${parentName},</p>
                
                <p>We are pleased to inform you that <strong>${cochildminderName}</strong> has successfully submitted their co-childminder registration application.</p>
                
                <div style="background-color: white; padding: 15px; margin: 20px 0; border-left: 4px solid #10b981;">
                  <p style="margin: 5px 0;"><strong>Submitted:</strong> ${new Date().toLocaleDateString('en-GB')}</p>
                  <p style="margin: 5px 0;"><strong>Status:</strong> Pending Review</p>
                </div>
                
                <p>The application will now be reviewed by our registration team.</p>
                
                <p style="margin-top: 30px;">
                  <strong>Ready Kids Registration Team</strong>
                </p>
              </div>
            </div>
          `,
        }),
      });
      console.log(`[submit-cochildminder-form] Notification sent to parent: ${parentEmail}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[submit-cochildminder-form] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});