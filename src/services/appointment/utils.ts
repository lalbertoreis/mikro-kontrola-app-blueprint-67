
import { supabase } from "@/integrations/supabase/client";

// Check if there are overlapping appointments for this employee
export async function checkOverlappingAppointments(
  employeeId: string, 
  startTime: string, 
  endTime: string,
  appointmentId?: string // Optional: exclude current appointment when updating
): Promise<boolean> {
  let query = supabase
    .from('appointments')
    .select('id')
    .eq('employee_id', employeeId)
    .lt('start_time', endTime) // appointment starts before the new end time
    .gt('end_time', startTime); // appointment ends after the new start time

  // If we're updating an existing appointment, exclude it from the check
  if (appointmentId) {
    query = query.neq('id', appointmentId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error checking for overlapping appointments:', error);
    throw error;
  }

  return data && data.length > 0;
}

// Check if an employee is available for a specific day of week
export async function checkEmployeeAvailability(
  employeeId: string,
  dayOfWeek: number
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('shifts')
      .select('id')
      .eq('employee_id', employeeId)
      .eq('day_of_week', dayOfWeek);
      
    if (error) {
      console.error('Error checking employee availability:', error);
      return false;
    }
    
    // If we have at least one shift for this day, the employee is available
    return data && data.length > 0;
  } catch (error) {
    console.error('Error in checkEmployeeAvailability:', error);
    return false;
  }
}
