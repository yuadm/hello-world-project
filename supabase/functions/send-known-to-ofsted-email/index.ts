import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const brevoApiKey = Deno.env.get("BREVO_API_KEY");
const brevoSenderEmail = Deno.env.get("BREVO_SENDER_EMAIL") || "noreply@readykids.co.uk";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OfstedFormRequest {
  ofstedEmail: string;
  applicantName: string;
  dateOfBirth: string;
  currentAddress: {
    line1: string;
    line2?: string;
    town: string;
    postcode: string;
    moveInDate: string;
  };
  previousAddresses?: Array<{
    address: string;
    dateFrom: string;
    dateTo: string;
  }>;
  previousNames?: Array<{
    name: string;
    dateFrom: string;
    dateTo: string;
  }>;
  role: string;
  requesterName: string;
  requesterRole: string;
  requireChildInfo: boolean;
  agencyName: string;
  parentId?: string;
  parentType?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: OfstedFormRequest = await req.json();
    
    console.log("Received request to send Known to Ofsted form:", {
      ofstedEmail: data.ofstedEmail,
      applicantName: data.applicantName,
      role: data.role,
    });

    if (!brevoApiKey) {
      throw new Error("BREVO_API_KEY is not configured");
    }

    // Generate a unique token for this form
    const formToken = crypto.randomUUID();
    
    // Generate reference ID
    const year = new Date().getFullYear();
    const seq = String(Math.floor(Math.random() * 99999)).padStart(5, '0');
    const referenceId = `RK-${year}-${seq}`;

    // Build the form URL with query parameters
    const baseUrl = Deno.env.get("SITE_URL") || "https://readykids.lovable.app";
    const formUrl = new URL(`${baseUrl}/ofsted-form`);
    
    // Encode form data as URL parameters
    formUrl.searchParams.set("token", formToken);
    formUrl.searchParams.set("ref", referenceId);
    formUrl.searchParams.set("name", data.applicantName);
    formUrl.searchParams.set("dob", data.dateOfBirth || "");
    formUrl.searchParams.set("address", JSON.stringify(data.currentAddress));
    formUrl.searchParams.set("prevAddresses", JSON.stringify(data.previousAddresses || []));
    formUrl.searchParams.set("prevNames", JSON.stringify(data.previousNames || []));
    formUrl.searchParams.set("role", data.role);
    formUrl.searchParams.set("requesterName", data.requesterName);
    formUrl.searchParams.set("requesterRole", data.requesterRole);
    formUrl.searchParams.set("childInfo", data.requireChildInfo ? "yes" : "no");
    formUrl.searchParams.set("agency", data.agencyName);

    const formatDate = (dateStr: string) => {
      if (!dateStr) return 'N/A';
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
      } catch {
        return dateStr;
      }
    };

    const roleLabels: Record<string, string> = {
      childminder: 'Childminder / Sole Proprietor',
      household_member: 'Household member over the age of 16',
      assistant: 'Assistant',
      manager: 'Manager',
      nominated_individual: 'Nominated individual representing an organisation providing childcare',
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #1f2937; }
          .container { max-width: 600px; margin: 0 auto; padding: 24px; }
          .header { background: #1B9AAA; color: white; padding: 24px; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 20px; }
          .content { background: #ffffff; border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px; }
          .info-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0; }
          .info-row { display: flex; margin-bottom: 8px; }
          .info-label { color: #6b7280; width: 140px; flex-shrink: 0; }
          .info-value { color: #1f2937; font-weight: 500; }
          .btn { display: inline-block; background: #1B9AAA; color: white !important; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 16px 0; }
          .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Known to Ofsted Check Request</h1>
            <p style="margin: 8px 0 0; opacity: 0.9;">Reference: ${referenceId}</p>
          </div>
          <div class="content">
            <p>Dear Ofsted Team,</p>
            <p>Under the Childcare Act 2006 and the Childcare (Childminder Agencies) Regulations 2014, ${data.agencyName} is required to contact Ofsted when assessing an applicant's suitability for registration.</p>
            
            <h3 style="margin-top: 24px;">Applicant Details</h3>
            <div class="info-box">
              <div class="info-row">
                <span class="info-label">Full Name:</span>
                <span class="info-value">${data.applicantName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Date of Birth:</span>
                <span class="info-value">${formatDate(data.dateOfBirth)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Role:</span>
                <span class="info-value">${roleLabels[data.role] || data.role}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Address:</span>
                <span class="info-value">${data.currentAddress?.line1 || ''}, ${data.currentAddress?.town || ''}, ${data.currentAddress?.postcode || ''}</span>
              </div>
            </div>

            <p>Please click the button below to complete the Known to Ofsted check form:</p>
            
            <a href="${formUrl.toString()}" class="btn">Complete Form</a>
            
            <p style="font-size: 13px; color: #6b7280;">Or copy this link: <a href="${formUrl.toString()}">${formUrl.toString()}</a></p>

            <div class="info-box" style="background: #fef3c7; border-color: #f59e0b;">
              <strong>Request Details:</strong>
              <p style="margin: 8px 0 0;">Submitted by: ${data.requesterName} (${data.requesterRole})<br>
              Child age information required: ${data.requireChildInfo ? 'Yes' : 'No'}</p>
            </div>

            <div class="footer">
              <p><strong>${data.agencyName}</strong></p>
              <p>Operating under the Childcare Act 2006 | Registered with Ofsted</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email using Brevo API
    const emailResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify({
        sender: {
          name: data.agencyName,
          email: brevoSenderEmail,
        },
        to: [
          {
            email: data.ofstedEmail,
            name: "Ofsted Team",
          },
        ],
        subject: `Known to Ofsted Check Request - ${data.applicantName} (${referenceId})`,
        htmlContent: htmlContent,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Brevo API error:", errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const emailResult = await emailResponse.json();
    console.log("Email sent successfully:", emailResult);

    return new Response(JSON.stringify({ 
      success: true, 
      referenceId,
      formToken,
      emailResult 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-known-to-ofsted-email:", error);
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
