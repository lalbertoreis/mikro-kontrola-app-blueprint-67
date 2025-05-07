
import { supabase } from "@/integrations/supabase/client";

/**
 * Sets the slug context for the Supabase session
 */
export async function setSlugContext(slug?: string): Promise<void> {
  if (!slug) return;
  
  try {
    await supabase.rpc('set_slug_for_session', { slug });
    console.log("Set slug for session:", slug);
  } catch (error) {
    console.error('Error setting slug for session:', error);
  }
}
