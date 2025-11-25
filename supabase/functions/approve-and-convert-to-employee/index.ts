import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ApplicationData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_mobile: string;
  phone_home: string;
  date_of_birth: string;
  national_insurance_number: string;
  current_address: {
    line1: string;
    line2?: string;
    town: string;
    county?: string;
    postcode: string;
  };
  service_local_authority: string;
  local_authority_other: string;
  premises_address: {
    type?: string;
    postcode?: string;
  };
  service_age_range: any;
  service_capacity: any;
  service_type: string;
  first_aid_qualification: string;
  first_aid_expiry_date: string;
  safeguarding_training: string;
  safeguarding_completion_date: string;
  eyfs_training: string;
  eyfs_completion_date: string;
  level_2_qualification: string;
  level_2_completion_date: string;
}

interface HouseholdMember {
  id: string;
  full_name: string;
  date_of_birth: string;
  relationship: string;
  email: string;
  dbs_status: string;
  dbs_certificate_number: string;
  dbs_certificate_date: string;
  dbs_certificate_expiry_date: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { applicationId } = await req.json();

    if (!applicationId) {
      throw new Error('Application ID is required');
    }

    console.log('Starting approval process for application:', applicationId);

    // Fetch application data
    const { data: application, error: appError } = await supabase
      .from('childminder_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      throw new Error(`Failed to fetch application: ${appError?.message}`);
    }

    console.log('Application fetched:', application.first_name, application.last_name);

    // Check if employee already exists for this application
    const { data: existingEmployee, error: checkError } = await supabase
      .from('employees')
      .select('id')
      .eq('application_id', applicationId)
      .maybeSingle();

    if (existingEmployee) {
      console.log('Employee already exists:', existingEmployee.id);
      return new Response(
        JSON.stringify({
          success: true,
          alreadyExists: true,
          employeeId: existingEmployee.id,
          message: 'This application was already approved and converted to an employee record.'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Helper function to calculate total capacity from service_capacity jsonb
    const calculateTotalCapacity = (serviceCapacity: any): number => {
      if (!serviceCapacity) return 0;
      const capacities = Object.values(serviceCapacity);
      return capacities.reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
    };

    // Log application data being transferred
    console.log('Application data being transferred:', {
      phone_mobile: application.phone_mobile,
      phone_home: application.phone_home,
      ni_number: application.national_insurance_number,
      current_address: application.current_address,
      service_local_authority: application.service_local_authority,
      service_capacity: application.service_capacity,
      calculated_capacity: calculateTotalCapacity(application.service_capacity)
    });

    // Create employee record
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .insert({
        application_id: applicationId,
        first_name: application.first_name,
        last_name: application.last_name,
        email: application.email,
        phone: application.phone_mobile || application.phone_home || null,
        date_of_birth: application.date_of_birth,
        ni_number: application.national_insurance_number || null,
        address_line_1: application.current_address?.line1 || null,
        address_line_2: application.current_address?.line2 || null,
        town_city: application.current_address?.town || null,
        county: application.current_address?.county || null,
        postcode: application.current_address?.postcode || null,
        local_authority: application.service_local_authority || null,
        local_authority_other: application.local_authority_other,
        premises_type: application.premises_address?.type || null,
        premises_postcode: application.premises_address?.postcode || null,
        age_groups_cared_for: application.service_age_range || null,
        max_capacity: calculateTotalCapacity(application.service_capacity),
        service_type: application.service_type,
        first_aid_qualification: application.first_aid_qualification,
        first_aid_expiry_date: application.first_aid_expiry_date,
        safeguarding_training: application.safeguarding_training,
        safeguarding_completion_date: application.safeguarding_completion_date,
        eyfs_training: application.eyfs_training,
        eyfs_completion_date: application.eyfs_completion_date,
        level_2_qualification: application.level_2_qualification,
        level_2_completion_date: application.level_2_completion_date,
        employment_status: 'active',
        employment_start_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (empError || !employee) {
      throw new Error(`Failed to create employee: ${empError?.message}`);
    }

    console.log('Employee created:', employee.id);

    // Fetch household members from application
    const { data: householdMembers, error: membersError } = await supabase
      .from('household_member_dbs_tracking')
      .select('*')
      .eq('application_id', applicationId);

    if (membersError) {
      console.error('Failed to fetch household members:', membersError.message);
      // Don't throw - continue even if no household members
    }

    console.log('Household members fetched:', householdMembers?.length || 0);

    // Copy household members to employee_household_members
    if (householdMembers && householdMembers.length > 0) {
      const employeeHouseholdMembers = householdMembers.map((member: HouseholdMember) => {
        // Calculate age to determine member_type
        const dob = new Date(member.date_of_birth);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          age--;
        }

        return {
          employee_id: employee.id,
          member_type: age >= 16 ? 'adult' : 'child',
          full_name: member.full_name,
          date_of_birth: member.date_of_birth,
          relationship: member.relationship,
          email: member.email,
          dbs_status: (member.dbs_status === 'certificate_received' ? 'received' : member.dbs_status) as any || 'not_requested',
          dbs_certificate_number: member.dbs_certificate_number,
          dbs_certificate_date: member.dbs_certificate_date,
          dbs_certificate_expiry_date: member.dbs_certificate_expiry_date,
        };
      });

      const { error: insertMembersError } = await supabase
        .from('employee_household_members')
        .insert(employeeHouseholdMembers);

      if (insertMembersError) {
        throw new Error(`Failed to copy household members: ${insertMembersError.message}`);
      }

      console.log('Household members copied:', employeeHouseholdMembers.length);
    }

    // Update application status to approved
    const { error: updateError } = await supabase
      .from('childminder_applications')
      .update({ status: 'approved' })
      .eq('id', applicationId);

    if (updateError) {
      throw new Error(`Failed to update application status: ${updateError.message}`);
    }

    console.log('Application approved and converted to employee successfully');

    return new Response(
      JSON.stringify({
        success: true,
        employeeId: employee.id,
        householdMembersCount: householdMembers?.length || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in approve-and-convert-to-employee:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
