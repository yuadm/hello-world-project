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

    const apiKey = Deno.env.get('IDEALPOSTCODES_API_KEY');
    if (!apiKey) {
      console.error('IDEALPOSTCODES_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'IDEALPOSTCODES_API_KEY not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Format postcode properly - Ideal Postcodes accepts with or without spaces
    const cleanPostcode = postcode.trim().toUpperCase();
    const apiUrl = `https://api.ideal-postcodes.co.uk/v1/postcodes/${encodeURIComponent(cleanPostcode)}?api_key=${apiKey}`;

    console.log(`Fetching addresses for postcode: ${cleanPostcode}`);
    console.log(`API URL: ${apiUrl.replace(apiKey, 'REDACTED')}`);

    const response = await fetch(apiUrl);
    
    console.log(`API Response Status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error Response: ${errorText}`);
      
      if (response.status === 404) {
        // Try to parse suggestions if available
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.suggestions && errorData.suggestions.length > 0) {
            console.log(`Postcode not found. Suggestions: ${errorData.suggestions.join(', ')}`);
          }
        } catch (e) {
          console.error('Failed to parse error response');
        }
        
        return new Response(
          JSON.stringify({ addresses: [] }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      if (response.status === 401 || response.status === 402) {
        console.error('Invalid API key or insufficient credit');
        return new Response(
          JSON.stringify({ error: 'Invalid API key or insufficient credit' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      if (response.status === 429 || response.status === 503) {
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
    
    // Normalise Ideal Postcodes response into an array of address objects
    let resultArray: any[] = [];
    if (Array.isArray(data.result)) {
      resultArray = data.result;
    } else if (data.result && typeof data.result === 'object') {
      resultArray = [data.result];
    } else if (Array.isArray(data.addresses)) {
      resultArray = data.addresses;
    }
    
    if (!resultArray.length) {
      console.error('No addresses returned for postcode', cleanPostcode, 'raw data:', data);
      return new Response(
        JSON.stringify({ 
          addresses: [],
          error: 'No addresses found for this postcode'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log(`Found ${resultArray.length} addresses`);

    // Transform Ideal Postcodes response format to match frontend expectations
    const transformedData = {
      addresses: resultArray.map((address: any) => {
        return {
          line_1: address.line_1 || "",
          line_2: address.line_2 || "",
          line_3: address.line_3 || "",
          line_4: "",
          locality: address.locality || address.dependant_locality || address.double_dependant_locality || "",
          town_or_city: address.post_town || "",
          county: address.county || "",
          formatted_address: [
            address.line_1,
            address.line_2,
            address.line_3,
            address.locality,
            address.post_town,
            address.county
          ].filter(Boolean)
        };
      })
    };

    return new Response(
      JSON.stringify(transformedData),
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