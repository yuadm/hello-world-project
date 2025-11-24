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

    console.log('Checking for children who have turned 16...');

    // Fetch all children in household members
    const { data: children, error: fetchError } = await supabase
      .from('employee_household_members')
      .select('*')
      .eq('member_type', 'child');

    if (fetchError) {
      throw new Error(`Failed to fetch children: ${fetchError.message}`);
    }

    console.log(`Found ${children?.length || 0} children to check`);

    const updatedMembers = [];

    if (children && children.length > 0) {
      for (const child of children) {
        // Calculate current age
        const dob = new Date(child.date_of_birth);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          age--;
        }

        // If they're 16 or older, update to adult
        if (age >= 16) {
          console.log(`Updating ${child.full_name} to adult (age: ${age})`);

          const { error: updateError } = await supabase
            .from('employee_household_members')
            .update({
              member_type: 'adult',
              age_group_changed_at: new Date().toISOString(),
            })
            .eq('id', child.id);

          if (updateError) {
            console.error(`Failed to update ${child.full_name}:`, updateError.message);
          } else {
            updatedMembers.push({
              id: child.id,
              name: child.full_name,
              age: age,
            });
          }
        }
      }
    }

    console.log(`Updated ${updatedMembers.length} children to adults`);

    return new Response(
      JSON.stringify({
        success: true,
        checked: children?.length || 0,
        updated: updatedMembers.length,
        updatedMembers: updatedMembers,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in check-16th-birthdays:', error);
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
