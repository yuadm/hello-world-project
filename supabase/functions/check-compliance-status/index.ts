import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting compliance status check...");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const updates: any[] = [];
    const today = new Date();

    // Process household_member_dbs_tracking
    const { data: householdMembers, error: hmError } = await supabase
      .from("household_member_dbs_tracking")
      .select("*");

    if (hmError) {
      console.error("Error fetching household members:", hmError);
      throw hmError;
    }

    console.log(`Processing ${householdMembers?.length || 0} household members`);

    for (const member of householdMembers || []) {
      const { data: statusData } = await supabase.rpc("calculate_compliance_status", {
        member_row: member,
      });

      if (statusData && statusData.length > 0) {
        const { calculated_compliance_status, calculated_risk_level } = statusData[0];

        const update: any = {
          compliance_status: calculated_compliance_status,
          risk_level: calculated_risk_level,
        };

        // Calculate follow-up due date based on risk level
        if (calculated_risk_level === 'critical') {
          update.follow_up_due_date = today.toISOString().split('T')[0];
        } else if (calculated_risk_level === 'high') {
          const followUp = new Date(today);
          followUp.setDate(followUp.getDate() + 3);
          update.follow_up_due_date = followUp.toISOString().split('T')[0];
        } else if (calculated_risk_level === 'medium') {
          const followUp = new Date(today);
          followUp.setDate(followUp.getDate() + 7);
          update.follow_up_due_date = followUp.toISOString().split('T')[0];
        }

        const { error: updateError } = await supabase
          .from("household_member_dbs_tracking")
          .update(update)
          .eq("id", member.id);

        if (updateError) {
          console.error(`Error updating household member ${member.id}:`, updateError);
        } else {
          updates.push({ table: 'household_member_dbs_tracking', id: member.id, ...update });
        }
      }
    }

    // Process employee_household_members
    const { data: empHouseholdMembers, error: ehmError } = await supabase
      .from("employee_household_members")
      .select("*");

    if (ehmError) {
      console.error("Error fetching employee household members:", ehmError);
      throw ehmError;
    }

    console.log(`Processing ${empHouseholdMembers?.length || 0} employee household members`);

    for (const member of empHouseholdMembers || []) {
      // Calculate age
      const age = Math.floor((today.getTime() - new Date(member.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
      
      // Only process if adult or 16+
      if (member.member_type === 'adult' || age >= 16) {
        let compliance_status = 'pending';
        let risk_level = 'low';

        // Calculate status based on DBS status and dates
        if (member.dbs_certificate_expiry_date) {
          const daysUntilExpiry = Math.floor((new Date(member.dbs_certificate_expiry_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilExpiry < 0) {
            compliance_status = 'expired';
            risk_level = 'critical';
          } else if (daysUntilExpiry <= 30) {
            compliance_status = 'at_risk';
            risk_level = 'medium';
          } else if (member.dbs_status === 'received') {
            compliance_status = 'compliant';
            risk_level = 'low';
          }
        } else if (age >= 16 && member.dbs_status !== 'received') {
          compliance_status = 'overdue';
          risk_level = 'critical';
        } else if (member.dbs_status === 'requested' && member.dbs_request_date) {
          const daysSinceRequest = Math.floor((today.getTime() - new Date(member.dbs_request_date).getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysSinceRequest > 30) {
            compliance_status = 'overdue';
            risk_level = 'critical';
          } else if (daysSinceRequest > 14) {
            compliance_status = 'at_risk';
            risk_level = 'high';
          }
        }

        const update: any = {
          compliance_status,
          risk_level,
        };

        const { error: updateError } = await supabase
          .from("employee_household_members")
          .update(update)
          .eq("id", member.id);

        if (updateError) {
          console.error(`Error updating employee household member ${member.id}:`, updateError);
        } else {
          updates.push({ table: 'employee_household_members', id: member.id, ...update });
        }
      }
    }

    // Process employees
    const { data: employees, error: empError } = await supabase
      .from("employees")
      .select("*")
      .eq("employment_status", "active");

    if (empError) {
      console.error("Error fetching employees:", empError);
      throw empError;
    }

    console.log(`Processing ${employees?.length || 0} employees`);

    for (const employee of employees || []) {
      let compliance_status = 'pending';
      let risk_level = 'low';

      // All employees need DBS
      if (employee.dbs_certificate_expiry_date) {
        const daysUntilExpiry = Math.floor((new Date(employee.dbs_certificate_expiry_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry < 0) {
          compliance_status = 'expired';
          risk_level = 'critical';
        } else if (daysUntilExpiry <= 30) {
          compliance_status = 'at_risk';
          risk_level = 'medium';
        } else if (employee.dbs_status === 'received') {
          compliance_status = 'compliant';
          risk_level = 'low';
        }
      } else if (employee.dbs_status !== 'received') {
        compliance_status = 'overdue';
        risk_level = 'critical';
      } else if (employee.dbs_status === 'requested' && employee.dbs_request_date) {
        const daysSinceRequest = Math.floor((today.getTime() - new Date(employee.dbs_request_date).getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceRequest > 30) {
          compliance_status = 'overdue';
          risk_level = 'critical';
        } else if (daysSinceRequest > 14) {
          compliance_status = 'at_risk';
          risk_level = 'high';
        }
      } else if (employee.dbs_status === 'received') {
        compliance_status = 'compliant';
        risk_level = 'low';
      }

      const update: any = {
        compliance_status,
        risk_level,
      };

      const { error: updateError } = await supabase
        .from("employees")
        .update(update)
        .eq("id", employee.id);

      if (updateError) {
        console.error(`Error updating employee ${employee.id}:`, updateError);
      } else {
        updates.push({ table: 'employees', id: employee.id, ...update });
      }
    }

    console.log(`Successfully updated ${updates.length} records across all tables`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${(householdMembers?.length || 0) + (empHouseholdMembers?.length || 0) + (employees?.length || 0)} total records, updated ${updates.length}`,
        updates,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in check-compliance-status:", error);
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
