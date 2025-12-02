import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const brevoApiKey = Deno.env.get("BREVO_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const appUrl = Deno.env.get("APP_URL") || "https://your-app.lovable.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DBSRequestData {
  memberId: string;
  memberEmail: string;
  applicantName?: string;
  employeeName?: string;
  employeeId?: string;
  isEmployee?: boolean;
  isApplicant?: boolean;
  isAssistant?: boolean;
  isEmployeeAssistant?: boolean;
  applicantEmail?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { memberId, memberEmail, applicantName, employeeName, employeeId, isEmployee, isApplicant, isAssistant, isEmployeeAssistant, applicantEmail }: DBSRequestData = await req.json();
    
    console.log("Sending DBS request for member:", memberId, "isEmployee:", isEmployee, "isApplicant:", isApplicant, "isAssistant:", isAssistant, "isEmployeeAssistant:", isEmployeeAssistant);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // If this is an employee assistant DBS request
    if (isEmployeeAssistant) {
      console.log("Processing employee assistant DBS request for:", memberId);
      
      const { data: assistantData, error: assistantError } = await supabase
        .from("employee_assistants")
        .select("*, employees!inner(first_name, last_name, email)")
        .eq("id", memberId)
        .single();

      if (assistantError || !assistantData) {
        console.error("Employee assistant not found:", assistantError);
        throw new Error("Employee assistant not found");
      }

      // Update assistant tracking - mark DBS as requested
      const { error: updateError } = await supabase
        .from("employee_assistants")
        .update({
          dbs_status: "requested",
          dbs_request_date: new Date().toISOString(),
          email: memberEmail,
          reminder_count: (assistantData.reminder_count || 0) + 1,
          last_reminder_date: new Date().toISOString(),
          last_contact_date: new Date().toISOString(),
          reminder_history: [
            ...(assistantData.reminder_history || []),
            {
              date: new Date().toISOString(),
              type: "dbs_request",
              sent_to: memberEmail,
            },
          ],
        })
        .eq("id", memberId);

      if (updateError) {
        console.error("Error updating employee assistant tracking:", updateError);
        throw updateError;
      }

      const emailResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoApiKey!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { 
            name: "Childminder Registration", 
            email: "yuadm3@gmail.com"
          },
          to: [{ email: memberEmail, name: `${assistantData.first_name} ${assistantData.last_name}` }],
          subject: "DBS Check Required - Action Needed",
          htmlContent: `
            <h1>DBS Check Required</h1>
            <p>Dear ${assistantData.first_name} ${assistantData.last_name},</p>
            <p>You have been listed as an assistant for ${assistantData.employees.first_name} ${assistantData.employees.last_name}, who is a registered childminder.</p>
            <p>As part of this process, we need you to complete an Enhanced DBS (Disclosure and Barring Service) check.</p>
            
            <p><strong>What you need to do:</strong></p>
            <ul>
              <li>Please contact the registration team to arrange your DBS check</li>
              <li>You will need to provide identification documents</li>
              <li>The process typically takes 2-4 weeks</li>
            </ul>

            <p><strong>Important:</strong> The childminder registration cannot proceed until all required DBS checks are completed.</p>

            <p>If you have any questions or need to schedule your DBS check, please contact:</p>
            <p>Email: yuadm3@gmail.com</p>

            <p>Best regards,<br>Childminder Registration Team</p>
          `,
        }),
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error("Failed to send employee assistant DBS request email:", errorText);
        throw new Error("Failed to send email");
      }

      console.log("Employee assistant DBS request email sent successfully");

      return new Response(JSON.stringify({ 
        success: true,
        message: "Employee assistant DBS request sent successfully"
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // If this is an assistant DBS request (application or employee stage)
    if (isAssistant) {
      console.log("Processing assistant DBS request for:", memberId);
      
      const { data: assistantData, error: assistantError } = await supabase
        .from("compliance_assistants")
        .select(`
          *,
          childminder_applications!compliance_assistants_application_id_fkey(first_name, last_name, email),
          employees!compliance_assistants_employee_id_fkey(first_name, last_name, email)
        `)
        .eq("id", memberId)
        .single();

      if (assistantError || !assistantData) {
        console.error("Assistant not found:", assistantError);
        throw new Error("Assistant not found");
      }

      // Update assistant tracking - mark DBS as requested
      const { error: updateError } = await supabase
        .from("compliance_assistants")
        .update({
          dbs_status: "requested",
          dbs_request_date: new Date().toISOString(),
          email: memberEmail,
          reminder_count: (assistantData.reminder_count || 0) + 1,
          last_reminder_date: new Date().toISOString(),
          last_contact_date: new Date().toISOString(),
          reminder_history: [
            ...(assistantData.reminder_history || []),
            {
              date: new Date().toISOString(),
              type: "dbs_request",
              sent_to: memberEmail,
            },
          ],
        })
        .eq("id", memberId);

      if (updateError) {
        console.error("Error updating assistant tracking:", updateError);
        throw updateError;
      }

      // Determine parent details (application or employee)
      const parentDetails = assistantData.childminder_applications || assistantData.employees;
      const parentType = assistantData.application_id ? "application" : "employee";

      const emailResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoApiKey!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { 
            name: "Childminder Registration", 
            email: "yuadm3@gmail.com"
          },
          to: [{ email: memberEmail, name: `${assistantData.first_name} ${assistantData.last_name}` }],
          subject: "DBS Check Required - Action Needed",
          htmlContent: `
            <h1>DBS Check Required</h1>
            <p>Dear ${assistantData.first_name} ${assistantData.last_name},</p>
            <p>You have been listed as an assistant for ${parentDetails.first_name} ${parentDetails.last_name}, who is ${parentType === "application" ? "applying for" : "a registered"} childminder.</p>
            <p>As part of this process, we need you to complete an Enhanced DBS (Disclosure and Barring Service) check.</p>
            
            <p><strong>What you need to do:</strong></p>
            <ul>
              <li>Please contact the registration team to arrange your DBS check</li>
              <li>You will need to provide identification documents</li>
              <li>The process typically takes 2-4 weeks</li>
            </ul>

            <p><strong>Important:</strong> The childminder registration cannot proceed until all required DBS checks are completed.</p>

            <p>If you have any questions or need to schedule your DBS check, please contact:</p>
            <p>Email: yuadm3@gmail.com</p>

            <p>Best regards,<br>Childminder Registration Team</p>
          `,
        }),
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error("Failed to send assistant DBS request email:", errorText);
        throw new Error("Failed to send email");
      }

      console.log("Assistant DBS request email sent successfully");

      return new Response(JSON.stringify({ 
        success: true,
        message: "Assistant DBS request sent successfully"
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // If this is a direct employee DBS request
    if (isEmployee && !isApplicant && employeeId) {
      console.log("Processing direct employee DBS request for:", employeeId);
      
      // Get current reminder count
      const { data: empData, error: fetchError } = await supabase
        .from("employees")
        .select("reminder_count, reminder_history")
        .eq("id", employeeId)
        .single();

      if (fetchError) {
        console.error("Error fetching employee data:", fetchError);
        throw fetchError;
      }
      
      // Update employee tracking - mark DBS as requested
      const { error: updateError } = await supabase
        .from("employees")
        .update({
          dbs_status: "requested",
          dbs_request_date: new Date().toISOString(),
          last_contact_date: new Date().toISOString(),
          reminder_count: (empData?.reminder_count || 0) + 1,
          last_reminder_date: new Date().toISOString(),
          reminder_history: [
            ...(empData?.reminder_history || []),
            {
              date: new Date().toISOString(),
              type: "dbs_request",
              sent_to: memberEmail,
            },
          ],
        })
        .eq("id", employeeId);

      if (updateError) {
        console.error("Error updating employee DBS tracking:", updateError);
        throw updateError;
      }

      const emailResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoApiKey!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { 
            name: "Childminder Registration", 
            email: "yuadm3@gmail.com"
          },
          to: [{ email: memberEmail, name: employeeName }],
          subject: "DBS Check Required - Action Needed",
          htmlContent: `
            <h1>DBS Check Required</h1>
            <p>Dear ${employeeName},</p>
            <p>As a registered childminder, we need you to complete an Enhanced DBS (Disclosure and Barring Service) check.</p>
            
            <p><strong>What you need to do:</strong></p>
            <ul>
              <li>Please contact the registration team to arrange your DBS check</li>
              <li>You will need to provide identification documents</li>
              <li>The process typically takes 2-4 weeks</li>
            </ul>

            <p><strong>Important:</strong> Your registration status requires an up-to-date DBS certificate.</p>

            <p>If you have any questions or need to schedule your DBS check, please contact:</p>
            <p>Email: yuadm3@gmail.com</p>

            <p>Best regards,<br>Childminder Registration Team</p>
          `,
        }),
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error("Failed to send employee DBS request email:", errorText);
        throw new Error("Failed to send email");
      }

      console.log("Employee DBS request email sent successfully");

      return new Response(JSON.stringify({ 
        success: true,
        message: "Employee DBS request sent successfully"
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // If this is an applicant DBS request, skip member lookup and just send email
    if (isApplicant) {
      const emailResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoApiKey!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { 
            name: "Childminder Registration", 
            email: "yuadm3@gmail.com"
          },
          to: [{ email: memberEmail, name: applicantName }],
          subject: "DBS Check Required - Action Needed",
          htmlContent: `
            <h1>DBS Check Required</h1>
            <p>Dear ${applicantName},</p>
            <p>As part of your childminder registration application, we need you to complete an Enhanced DBS (Disclosure and Barring Service) check.</p>
            
            <p><strong>What you need to do:</strong></p>
            <ul>
              <li>Please contact the registration team to arrange your DBS check</li>
              <li>You will need to provide identification documents</li>
              <li>The process typically takes 2-4 weeks</li>
            </ul>

            <p><strong>Important:</strong> Your registration cannot proceed until your DBS check is completed.</p>

            <p>If you have any questions or need to schedule your DBS check, please contact:</p>
            <p>Email: yuadm3@gmail.com</p>

            <p>Best regards,<br>Childminder Registration Team</p>
          `,
        }),
      });

      if (!emailResponse.ok) {
        console.error("Failed to send applicant DBS request email");
        throw new Error("Failed to send email");
      }

      return new Response(JSON.stringify({ 
        success: true,
        message: "Applicant DBS request sent successfully"
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Use unified compliance_household_members table for household members
    const tableName = "compliance_household_members";
    const contextName = isEmployee ? employeeName : applicantName;

    // Get member details
    const { data: memberData, error: memberError } = await supabase
      .from(tableName)
      .select("*")
      .eq("id", memberId)
      .single();

    if (memberError || !memberData) {
      console.error("Member not found:", memberError);
      throw new Error("Member not found");
    }

    // Update member tracking - mark DBS as requested
    const { error: updateError } = await supabase
      .from(tableName)
      .update({
        dbs_status: "requested",
        dbs_request_date: new Date().toISOString(),
        email: memberEmail,
        reminder_count: (memberData.reminder_count || 0) + 1,
        last_reminder_date: new Date().toISOString(),
        last_contact_date: new Date().toISOString(),
        reminder_history: [
          ...(memberData.reminder_history || []),
          {
            date: new Date().toISOString(),
            type: "dbs_request",
            sent_to: memberEmail,
          },
        ],
      })
      .eq("id", memberId);

    if (updateError) {
      console.error("Error updating member tracking:", updateError);
      throw updateError;
    }

    // Send DBS reminder email to household member
    const memberEmailResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": brevoApiKey!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { 
          name: "Childminder Registration", 
          email: "yuadm3@gmail.com"
        },
        to: [{ email: memberEmail, name: memberData.full_name }],
        subject: "DBS Check Required - Action Needed",
        htmlContent: `
          <h1>DBS Check Required</h1>
          <p>Dear ${memberData.full_name},</p>
          <p>${contextName} ${isEmployee ? 'is a registered childminder' : 'has applied to become a registered childminder'}. As an adult member of their household, we need to conduct a DBS (Disclosure and Barring Service) check for you.</p>
          
          <p><strong>What you need to do:</strong></p>
          <ul>
            <li>Please contact the registration team to arrange your DBS check</li>
            <li>You will need to provide identification documents</li>
            <li>The process typically takes 2-4 weeks</li>
          </ul>

          <p><strong>Important:</strong> The childminder registration cannot proceed until all required DBS checks are completed.</p>

          <p>If you have any questions or need to schedule your DBS check, please contact:</p>
          <p>Email: yuadm3@gmail.com</p>

          <p>Best regards,<br>Childminder Registration Team</p>
        `,
      }),
    });

    if (!memberEmailResponse.ok) {
      console.error("Failed to send DBS request email");
      throw new Error("Failed to send email");
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: "DBS request sent successfully"
    }), {
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
