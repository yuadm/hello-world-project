import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SyncRequest {
  applicationId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { applicationId }: SyncRequest = await req.json();
    
    console.log("Syncing household members for application:", applicationId);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get application data
    const { data: application, error: appError } = await supabase
      .from('childminder_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      throw new Error(`Application not found: ${applicationId}`);
    }

    const peopleInHousehold = application.people_in_household || {};
    const peopleRegularContact = application.people_regular_contact || [];

    const synced = [];
    const errors = [];

    // Sync adults in household
    if (peopleInHousehold.adults && Array.isArray(peopleInHousehold.adults)) {
      for (const adult of peopleInHousehold.adults) {
        try {
          const { data: existing } = await supabase
            .from('household_member_dbs_tracking')
            .select('id, date_of_birth')
            .eq('application_id', applicationId)
            .eq('full_name', adult.fullName)
            .eq('member_type', 'adult')
            .maybeSingle();

          if (existing) {
            // Update if DOB changed
            if (existing.date_of_birth !== adult.dob) {
              const { error: updateError } = await supabase
                .from('household_member_dbs_tracking')
                .update({
                  date_of_birth: adult.dob,
                  relationship: adult.relationship,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', existing.id);

              if (updateError) throw updateError;
              synced.push({ name: adult.fullName, type: 'adult', action: 'updated' });
            }
          } else {
            const { error: insertError } = await supabase
              .from('household_member_dbs_tracking')
              .insert({
                application_id: applicationId,
                member_type: 'adult',
                full_name: adult.fullName,
                date_of_birth: adult.dob,
                relationship: adult.relationship,
                dbs_status: 'not_requested',
              });

            if (insertError) throw insertError;
            synced.push({ name: adult.fullName, type: 'adult', action: 'created' });
          }
        } catch (error: any) {
          errors.push({ name: adult.fullName, error: error.message });
        }
      }
    }

    // Sync children in household
    if (peopleInHousehold.children && Array.isArray(peopleInHousehold.children)) {
      for (const child of peopleInHousehold.children) {
        try {
          const { data: existing } = await supabase
            .from('household_member_dbs_tracking')
            .select('id, date_of_birth')
            .eq('application_id', applicationId)
            .eq('full_name', child.fullName)
            .eq('member_type', 'child')
            .maybeSingle();

          if (existing) {
            // Update if DOB changed
            if (existing.date_of_birth !== child.dob) {
              const { error: updateError } = await supabase
                .from('household_member_dbs_tracking')
                .update({
                  date_of_birth: child.dob,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', existing.id);

              if (updateError) throw updateError;
              synced.push({ name: child.fullName, type: 'child', action: 'updated' });
            }
          } else {
            const { error: insertError } = await supabase
              .from('household_member_dbs_tracking')
              .insert({
                application_id: applicationId,
                member_type: 'child',
                full_name: child.fullName,
                date_of_birth: child.dob,
                dbs_status: 'not_requested',
              });

            if (insertError) throw insertError;
            synced.push({ name: child.fullName, type: 'child', action: 'created' });
          }
        } catch (error: any) {
          errors.push({ name: child.fullName, error: error.message });
        }
      }
    }

    // Sync assistants
    if (Array.isArray(peopleRegularContact)) {
      for (const assistant of peopleRegularContact) {
        try {
          const { data: existing } = await supabase
            .from('household_member_dbs_tracking')
            .select('id, date_of_birth')
            .eq('application_id', applicationId)
            .eq('full_name', assistant.fullName)
            .eq('member_type', 'assistant')
            .maybeSingle();

          if (existing) {
            // Update if DOB changed
            if (existing.date_of_birth !== assistant.dob) {
              const { error: updateError } = await supabase
                .from('household_member_dbs_tracking')
                .update({
                  date_of_birth: assistant.dob,
                  relationship: assistant.relationship,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', existing.id);

              if (updateError) throw updateError;
              synced.push({ name: assistant.fullName, type: 'assistant', action: 'updated' });
            }
          } else {
            const { error: insertError } = await supabase
              .from('household_member_dbs_tracking')
              .insert({
                application_id: applicationId,
                member_type: 'assistant',
                full_name: assistant.fullName,
                date_of_birth: assistant.dob,
                relationship: assistant.relationship,
                dbs_status: 'not_requested',
              });

            if (insertError) throw insertError;
            synced.push({ name: assistant.fullName, type: 'assistant', action: 'created' });
          }
        } catch (error: any) {
          errors.push({ name: assistant.fullName, error: error.message });
        }
      }
    }

    console.log(`Sync complete: ${synced.length} records created, ${errors.length} errors`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        synced,
        errors,
        total: synced.length
      }), 
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in sync-household-members:", error);
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
