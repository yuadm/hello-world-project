import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const postcode = url.searchParams.get('postcode');

    if (!postcode) {
      return new Response(
        JSON.stringify({ error: 'Postcode parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const apiKey = Deno.env.get('GETADDRESS_API_KEY');
    if (!apiKey) {
      console.error('GETADDRESS_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const cleanPostcode = postcode.replace(/\s/g, "").toLowerCase();
    const apiUrl = `https://api.getAddress.io/find/${cleanPostcode}?api-key=${apiKey}&expand=true`;

    console.log(`Fetching addresses for postcode: ${postcode}`);

    const response = await fetch(apiUrl);
    
    console.log(`API Response Status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error Response: ${errorText}`);
      
      if (response.status === 404) {
        return new Response(
          JSON.stringify({ addresses: [] }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      if (response.status === 401) {
        console.error('Invalid API key');
        return new Response(
          JSON.stringify({ error: 'Invalid API key' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      if (response.status === 429) {
        console.error('Rate limit exceeded');
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      console.error(`API error: ${response.status}`);
      return new Response(
        JSON.stringify({ error: `API error: ${response.status}` }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    console.log(`API Response Data:`, JSON.stringify(data));
    console.log(`Found ${data.addresses?.length || 0} addresses`);

    return new Response(
      JSON.stringify(data),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in lookup-addresses function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to lookup addresses';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
