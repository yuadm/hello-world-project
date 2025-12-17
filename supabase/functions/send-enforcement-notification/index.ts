import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EnforcementNotificationRequest {
  caseId: string;
  agency: string;
  agencyName: string;
  agencyDetail: string;
  agencyEmail: string;
  sentBy: string;
  provider: {
    id: string;
    name: string;
    registrationRef?: string;
    address?: {
      addressLine1?: string | null;
      addressLine2?: string | null;
      townCity?: string | null;
      county?: string | null;
      postcode?: string | null;
    };
  };
  actionType: string;
  effectiveDate?: string;
  concerns?: string[];
  caseReference?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    const senderEmail = "yuadm3@gmail.com";

    if (!brevoApiKey) {
      console.error("BREVO_API_KEY not configured");
      throw new Error("Email service not configured");
    }

    const requestData: EnforcementNotificationRequest = await req.json();
    console.log("Processing enforcement notification:", requestData);

    const {
      caseId,
      agency,
      agencyName,
      agencyDetail,
      agencyEmail,
      sentBy,
      provider,
      actionType,
      effectiveDate,
      concerns,
      caseReference
    } = requestData;

    // Format the address
    const addressParts = [
      provider.address?.addressLine1,
      provider.address?.addressLine2,
      provider.address?.townCity,
      provider.address?.county,
      provider.address?.postcode
    ].filter(Boolean);
    const formattedAddress = addressParts.join(", ");

    // Format concerns list
    const concernsHtml = concerns && concerns.length > 0
      ? `<ul style="margin: 10px 0; padding-left: 20px;">${concerns.map(c => `<li style="margin: 5px 0;">${c}</li>`).join("")}</ul>`
      : "<p>See attached documentation for full details.</p>";

    // Generate email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #f5f5f5; padding: 20px;">
        <div style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background-color: #1e40af; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Ready Kids Childminder Agency</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Official Enforcement Notification</p>
          </div>
          
          <!-- Urgent Banner -->
          <div style="background-color: #dc2626; color: white; padding: 15px; text-align: center;">
            <strong>⚠️ OFFICIAL NOTICE - ${actionType.toUpperCase()}</strong>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 30px;">
            
            <!-- Date and Reference -->
            <div style="margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb;">
              <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              ${caseReference ? `<p style="margin: 5px 0;"><strong>Reference:</strong> ${caseReference}</p>` : ""}
            </div>
            
            <!-- Recipient -->
            <div style="margin-bottom: 25px;">
              <p style="margin: 5px 0;"><strong>To:</strong> ${agencyName}</p>
              <p style="margin: 5px 0; color: #6b7280;">${agencyDetail}</p>
            </div>
            
            <!-- Subject Line -->
            <div style="margin-bottom: 25px;">
              <h2 style="color: #1e40af; margin: 0; font-size: 18px;">
                Re: Notification of ${actionType} - Registered Childminder
              </h2>
            </div>
            
            <!-- Introduction -->
            <p style="margin-bottom: 20px; line-height: 1.6;">
              Dear ${agencyDetail},
            </p>
            
            <p style="margin-bottom: 20px; line-height: 1.6;">
              In accordance with our statutory duties under the Childcare Act 2006 and the Childminder Agencies (Ofsted Requirements) Regulations 2014, 
              we are writing to inform you that we have taken enforcement action against a childminder registered with our agency.
            </p>
            
            <!-- Provider Details Box -->
            <div style="background-color: #f8fafc; border-left: 4px solid #1e40af; padding: 20px; margin: 25px 0;">
              <h3 style="margin: 0 0 15px 0; color: #1e40af;">Provider Details</h3>
              <p style="margin: 5px 0;"><strong>Name:</strong> ${provider.name}</p>
              ${provider.registrationRef ? `<p style="margin: 5px 0;"><strong>Registration Reference:</strong> ${provider.registrationRef}</p>` : ""}
              ${formattedAddress ? `<p style="margin: 5px 0;"><strong>Address:</strong> ${formattedAddress}</p>` : ""}
            </div>
            
            <!-- Enforcement Action Details -->
            <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 25px 0;">
              <h3 style="margin: 0 0 15px 0; color: #dc2626;">Enforcement Action</h3>
              <p style="margin: 5px 0;"><strong>Type:</strong> ${actionType}</p>
              ${effectiveDate ? `<p style="margin: 5px 0;"><strong>Effective Date:</strong> ${effectiveDate}</p>` : ""}
              <p style="margin: 15px 0 5px 0;"><strong>Summary of Concerns:</strong></p>
              ${concernsHtml}
            </div>
            
            <!-- Agency-Specific Information -->
            ${getAgencySpecificContent(agency, provider.name, actionType)}
            
            <!-- Contact Information -->
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="margin-bottom: 10px; line-height: 1.6;">
                Please do not hesitate to contact us if you require any additional information regarding this matter.
              </p>
              
              <p style="margin: 5px 0;">Yours sincerely,</p>
              <p style="margin: 20px 0 5px 0;"><strong>${sentBy}</strong></p>
              <p style="margin: 5px 0; color: #6b7280;">Enforcement & Compliance Team</p>
              <p style="margin: 5px 0; color: #6b7280;">Ready Kids Childminder Agency</p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 12px; color: #6b7280;">
              This email contains confidential information. If you have received this in error, please delete it immediately and notify the sender.
            </p>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #6b7280;">
              Ready Kids Childminder Agency | Registered in England and Wales
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email via Brevo
    console.log(`Sending enforcement notification to ${agencyEmail}`);
    
    const emailResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify({
        sender: {
          name: "Ready Kids Enforcement Team",
          email: senderEmail,
        },
        to: [{ email: agencyEmail, name: agencyName }],
        subject: `URGENT: Notification of ${actionType} - ${provider.name} - Ref: ${caseReference || caseId}`,
        htmlContent: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Brevo API error:", errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const emailResult = await emailResponse.json();
    console.log("Email sent successfully:", emailResult);

    // Save notification record to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: dbError } = await supabase
      .from("enforcement_notifications")
      .insert({
        case_id: caseId,
        agency,
        agency_name: agencyName,
        agency_detail: agencyDetail,
        agency_email: agencyEmail,
        status: "sent",
        sent_at: new Date().toISOString(),
        sent_by: sentBy,
      });

    if (dbError) {
      console.error("Database error (notification still sent):", dbError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notification sent to ${agencyName}`,
        messageId: emailResult.messageId 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-enforcement-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

// Helper function to add agency-specific content
function getAgencySpecificContent(agency: string, providerName: string, actionType: string): string {
  switch (agency) {
    case "LA":
      return `
        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1e40af;">Information for LADO</h3>
          <p style="margin: 0; line-height: 1.6;">
            This notification is provided in line with safeguarding protocols. If you hold any relevant information about ${providerName} 
            or require further details regarding this ${actionType.toLowerCase()}, please contact us immediately.
          </p>
        </div>
      `;
    case "HMRC":
      return `
        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1e40af;">Tax-Free Childcare Implications</h3>
          <p style="margin: 0; line-height: 1.6;">
            Please note that as a result of this ${actionType.toLowerCase()}, ${providerName} should not be receiving payments through 
            Tax-Free Childcare accounts until further notice. We recommend updating your records accordingly.
          </p>
        </div>
      `;
    case "DWP":
      return `
        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1e40af;">Universal Credit Childcare Element</h3>
          <p style="margin: 0; line-height: 1.6;">
            This notification may affect claims for the childcare element of Universal Credit involving ${providerName}. 
            Please update verification records as appropriate.
          </p>
        </div>
      `;
    case "Ofsted":
      return `
        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1e40af;">Information Sharing Protocol</h3>
          <p style="margin: 0; line-height: 1.6;">
            This notification is provided under our information sharing agreement. If ${providerName} applies to register 
            directly with Ofsted or another childminder agency, this enforcement action should be taken into consideration.
          </p>
        </div>
      `;
    default:
      return "";
  }
}

serve(handler);
