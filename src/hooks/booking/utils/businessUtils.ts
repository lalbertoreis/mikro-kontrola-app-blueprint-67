
import { supabase } from "@/integrations/supabase/client";

// Function to get the user_id of the business by slug
export const getBusinessUserId = async (slug: string): Promise<string | null> => {
  try {
    console.log("Getting business user ID for slug:", slug);
    
    // Set slug for session first to ensure RLS context
    await setSlugForSession(slug);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('slug', slug)
      .single();
    
    if (error || !data) {
      console.error("Error fetching business user id:", error);
      return null;
    }
    
    console.log("Found business user ID:", data.id);
    return data.id;
  } catch (error) {
    console.error("Error in getBusinessUserId:", error);
    return null;
  }
};

// Helper to set the slug for the current session (important for RLS policies)
export const setSlugForSession = async (slug: string): Promise<void> => {
  try {
    console.log("Setting slug for session:", slug);
    await supabase.rpc('set_slug_for_session', { slug });
    console.log("Successfully set slug for session:", slug);
  } catch (error) {
    console.error('Error setting slug for session:', error);
  }
};
