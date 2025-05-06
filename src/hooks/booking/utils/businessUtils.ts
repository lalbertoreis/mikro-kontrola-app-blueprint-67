
import { supabase } from "@/integrations/supabase/client";

// Function to get the user_id of the business by slug
export const getBusinessUserId = async (slug: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('slug', slug)
      .single();
    
    if (error || !data) {
      console.error("Error fetching business user id:", error);
      return null;
    }
    
    return data.id;
  } catch (error) {
    console.error("Error in getBusinessUserId:", error);
    return null;
  }
};

// Helper to set the slug for the current session (important for RLS policies)
export const setSlugForSession = async (slug: string): Promise<void> => {
  try {
    await supabase.rpc('set_slug_for_session', { slug });
    console.log("Set slug for session:", slug);
  } catch (error) {
    console.error('Error setting slug for session:', error);
  }
};
