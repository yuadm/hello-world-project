import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    console.log('[approve-and-convert] Starting approval process for application:', applicationId);

    // Fetch application data
    const { data: application, error: appError } = await supabase
      .from('childminder_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      throw new Error(`Failed to fetch application: ${appError?.message}`);
    }

    console.log('[approve-and-convert] Application fetched:', application.first_name, application.last_name);

    // Check if employee already exists for this application
    const { data: existingEmployee, error: checkError } = await supabase
      .from('employees')
      .select('id')
      .eq('application_id', applicationId)
      .maybeSingle();

    if (existingEmployee) {
      console.log('[approve-and-convert] Employee already exists:', existingEmployee.id);
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
        // Transfer DBS data from application
        dbs_certificate_number: application.dbs_number || null,
        dbs_status: application.has_dbs === 'Yes' && application.dbs_number ? 'received' : 'not_requested',
        // Transfer address history for LA checks
        address_history: application.address_history || null,
      })
      .select()
      .single();

    if (empError || !employee) {
      throw new Error(`Failed to create employee: ${empError?.message}`);
    }

    console.log('[approve-and-convert] Employee created:', employee.id);

    // =============================================================================
    // Transfer compliance data ownership from application to employee
    // (Update polymorphic references instead of copying data)
    // =============================================================================

    // 1. Transfer household members from application to employee
    const { data: householdMembers, error: updateMembersError } = await supabase
      .from('compliance_household_members')
      .update({
        employee_id: employee.id,
        application_id: null,
      })
      .eq('application_id', applicationId)
      .select('id, full_name');

    if (updateMembersError) {
      console.error('[approve-and-convert] Failed to transfer household members:', updateMembersError.message);
      throw new Error(`Failed to transfer household members: ${updateMembersError.message}`);
    }

    console.log('[approve-and-convert] Household members transferred:', householdMembers?.length || 0);

    // 2. Transfer assistants from application to employee
    const { data: assistants, error: updateAssistantsError } = await supabase
      .from('compliance_assistants')
      .update({
        employee_id: employee.id,
        application_id: null,
      })
      .eq('application_id', applicationId)
      .select('id, first_name, last_name');

    if (updateAssistantsError) {
      console.error('[approve-and-convert] Failed to transfer assistants:', updateAssistantsError.message);
      throw new Error(`Failed to transfer assistants: ${updateAssistantsError.message}`);
    }

    console.log('[approve-and-convert] Assistants transferred:', assistants?.length || 0);

    // 3. Transfer household member forms from application to employee
    const { data: householdForms, error: updateFormsError } = await supabase
      .from('compliance_household_forms')
      .update({
        employee_id: employee.id,
        application_id: null,
      })
      .eq('application_id', applicationId)
      .select('id');

    if (updateFormsError) {
      console.error('[approve-and-convert] Failed to transfer household forms:', updateFormsError.message);
      // Don't throw - forms are optional
    } else {
      console.log('[approve-and-convert] Household forms transferred:', householdForms?.length || 0);
    }

    // 4. Transfer assistant forms from application to employee
    const { data: assistantForms, error: updateAssistantFormsError } = await supabase
      .from('compliance_assistant_forms')
      .update({
        employee_id: employee.id,
        application_id: null,
      })
      .eq('application_id', applicationId)
      .select('id');

    if (updateAssistantFormsError) {
      console.error('[approve-and-convert] Failed to transfer assistant forms:', updateAssistantFormsError.message);
      // Don't throw - forms are optional
    } else {
      console.log('[approve-and-convert] Assistant forms transferred:', assistantForms?.length || 0);
    }

    // 5. Transfer reference requests from application to employee
    const { data: referenceRequests, error: updateRefsError } = await supabase
      .from('reference_requests')
      .update({
        employee_id: employee.id,
        application_id: null,
      })
      .eq('application_id', applicationId)
      .select('id, referee_name, request_status');

    if (updateRefsError) {
      console.error('[approve-and-convert] Failed to transfer reference requests:', updateRefsError.message);
      // Don't throw - references are optional
    } else {
      console.log('[approve-and-convert] Reference requests transferred:', referenceRequests?.length || 0);
    }

    // 6. Copy applicant_references to employee record
    const { error: updateRefsDataError } = await supabase
      .from('employees')
      .update({
        applicant_references: application.applicant_references,
      })
      .eq('id', employee.id);

    if (updateRefsDataError) {
      console.error('[approve-and-convert] Failed to copy applicant_references:', updateRefsDataError.message);
    } else {
      console.log('[approve-and-convert] Applicant references data copied to employee');
    }

    // 7. Transfer Ofsted form submissions from application to employee
    const { data: ofstedForms, error: updateOfstedFormsError } = await supabase
      .from('ofsted_form_submissions')
      .update({
        employee_id: employee.id,
        application_id: null,
      })
      .eq('application_id', applicationId)
      .select('id, reference_id, status');

    if (updateOfstedFormsError) {
      console.error('[approve-and-convert] Failed to transfer Ofsted forms:', updateOfstedFormsError.message);
      // Don't throw - Ofsted forms are optional
    } else {
      console.log('[approve-and-convert] Ofsted forms transferred:', ofstedForms?.length || 0);
    }

    // 8. Transfer LA form submissions from application to employee
    const { data: laForms, error: updateLaFormsError } = await supabase
      .from('la_form_submissions')
      .update({
        employee_id: employee.id,
        application_id: null,
      })
      .eq('application_id', applicationId)
      .select('id, reference_id, status');

    if (updateLaFormsError) {
      console.error('[approve-and-convert] Failed to transfer LA forms:', updateLaFormsError.message);
      // Don't throw - LA forms are optional
    } else {
      console.log('[approve-and-convert] LA forms transferred:', laForms?.length || 0);
    }

    // Update application status to approved
    const { error: updateError } = await supabase
      .from('childminder_applications')
      .update({ status: 'approved' })
      .eq('id', applicationId);

    if (updateError) {
      throw new Error(`Failed to update application status: ${updateError.message}`);
    }

    console.log('[approve-and-convert] Application approved and converted to employee successfully');

    return new Response(
      JSON.stringify({
        success: true,
        employeeId: employee.id,
        householdMembersCount: householdMembers?.length || 0,
        assistantsCount: assistants?.length || 0,
        referenceRequestsCount: referenceRequests?.length || 0,
        ofstedFormsCount: ofstedForms?.length || 0,
        laFormsCount: laForms?.length || 0,
        message: 'Application approved and all compliance data transferred to employee record'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[approve-and-convert] Error:', error);
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
