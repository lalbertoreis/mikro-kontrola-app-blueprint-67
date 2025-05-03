
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.8.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the year from the request
    const url = new URL(req.url);
    const year = url.searchParams.get('year') || new Date().getFullYear().toString();
    
    // Fetch holidays from BrasilAPI
    const response = await fetch(`https://brasilapi.com.br/api/feriados/v1/${year}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch holidays: ${response.status}`);
    }
    
    const holidays = await response.json();
    
    // Parse the JWT to get the user ID
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    
    // Connect to Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    
    // Get user ID from the JWT
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }
    
    // Convert holidays to our format
    const formattedHolidays = holidays.map((h: any) => ({
      date: h.date,
      name: h.name,
      type: 'national',
      is_active: true,
      auto_generated: true,
      blocking_type: 'full_day',
      user_id: user.id,
    }));
    
    // Insert holidays into the database
    const { data, error } = await supabase
      .from('holidays')
      .upsert(formattedHolidays, { 
        onConflict: 'date',
        ignoreDuplicates: false
      });
    
    if (error) {
      throw error;
    }
    
    // Return the imported holidays
    return new Response(JSON.stringify({ 
      success: true, 
      message: `${formattedHolidays.length} holidays imported for ${year}`, 
      data: formattedHolidays 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error importing holidays:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
