import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReferenceRequestPayload {
  applicationId?: string;
  employeeId?: string;
  referenceNumber: number; // 1 or 2
  refereeName: string;
  refereeRelationship: string;
  refereeEmail: string;
  isChildcareReference: boolean;
  applicantName: string;
  siteUrl: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const payload: ReferenceRequestPayload = await req.json();
    console.log('Sending reference request:', payload);

    const {
      applicationId,
      employeeId,
      referenceNumber,
      refereeName,
      refereeRelationship,
      refereeEmail,
      isChildcareReference,
      applicantName,
      siteUrl
    } = payload;

    // Generate unique token
    const formToken = crypto.randomUUID();
    
    // Insert reference request record
    const { data: referenceRequest, error: insertError } = await supabaseClient
      .from('reference_requests')
      .insert({
        application_id: applicationId || null,
        employee_id: employeeId || null,
        reference_number: referenceNumber,
        referee_name: refereeName,
        referee_relationship: refereeRelationship,
        referee_contact: refereeEmail,
        referee_email: refereeEmail,
        is_childcare_reference: isChildcareReference,
        form_token: formToken,
        request_status: 'sent',
        request_sent_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting reference request:', insertError);
      throw insertError;
    }

    console.log('Reference request created:', referenceRequest.id);

    // Generate form URL
    const formUrl = `${siteUrl}/reference-form?token=${formToken}`;
    
    // Send email using Brevo
    const brevoApiKey = Deno.env.get('BREVO_API_KEY');
    const senderEmail = Deno.env.get('BREVO_SENDER_EMAIL');

    if (!brevoApiKey || !senderEmail) {
      throw new Error('Brevo credentials not configured');
    }

    const emailPayload = {
      sender: { email: senderEmail, name: "Ready Kids Childminder Registration" },
      to: [{ email: refereeEmail, name: refereeName }],
      subject: `Reference Request for ${applicantName} - Childminder Registration`,
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #003078; color: white; padding: 20px; text-align: center; }
            .content { background: #f4f4f4; padding: 30px; }
            .button { display: inline-block; padding: 15px 30px; background: #00703c; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Reference Request</h1>
            </div>
            <div class="content">
              <p>Dear ${refereeName},</p>
              
              <p><strong>${applicantName}</strong> has named you as a reference as part of their childminder registration application with Ready Kids.</p>
              
              <p>We would be grateful if you could complete a reference form for them. This will help us assess their suitability to work with children.</p>
              
              ${isChildcareReference ? '<p><strong>Please note:</strong> This is specifically a childcare-related reference.</p>' : ''}
              
              <p>The reference form should take approximately 10-15 minutes to complete.</p>
              
              <p style="text-align: center;">
                <a href="${formUrl}" class="button">Complete Reference Form</a>
              </p>
              
              <p><strong>Important:</strong></p>
              <ul>
                <li>Your reference will be treated confidentially</li>
                <li>Please provide honest and accurate information</li>
                <li>The applicant will not see the content of your reference</li>
              </ul>
              
              <p>If you have any questions or concerns, please contact us.</p>
              
              <p>Thank you for your assistance.</p>
              
              <p>Regards,<br>
              Ready Kids Registration Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply directly to this message.</p>
              <p>If you cannot click the button above, copy and paste this link into your browser:<br>
              ${formUrl}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    if (!brevoResponse.ok) {
      const errorData = await brevoResponse.text();
      console.error('Brevo API error:', errorData);
      throw new Error(`Failed to send email: ${brevoResponse.status}`);
    }

    console.log('Reference request email sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        requestId: referenceRequest.id,
        message: 'Reference request sent successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-reference-request-email:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});