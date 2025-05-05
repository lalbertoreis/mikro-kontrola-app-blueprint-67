
import { supabase } from "@/integrations/supabase/client";

export async function fetchAvailableTimeSlots(
  employeeId: string,
  serviceId: string,
  date: string
): Promise<string[]> {
  try {
    // For manual time entry, just return []
    return [];
  } catch (error) {
    console.error('Error fetching available time slots:', error);
    return [];
  }
}
