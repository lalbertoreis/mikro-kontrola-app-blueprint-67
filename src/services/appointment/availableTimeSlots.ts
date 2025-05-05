
import { supabase } from "@/integrations/supabase/client";
import { format, parse } from "date-fns";

/**
 * Fetches shift information for an employee on a specific day of the week
 */
async function fetchEmployeeShift(employeeId: string, dayOfWeek: number) {
  const { data: shifts, error: shiftError } = await supabase
    .from('shifts')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('day_of_week', dayOfWeek);
  
  if (shiftError) {
    console.error('Error fetching employee shifts:', shiftError);
    return null;
  }
  
  // If no shifts for this day, return null
  if (!shifts || shifts.length === 0) {
    console.log(`No shifts found for employee ${employeeId} on day ${dayOfWeek}`);
    return null;
  }
  
  // Get the employee's working hours for this day
  return shifts[0]; // Assuming one shift per day
}

/**
 * Fetches service duration in minutes
 */
async function fetchServiceDuration(serviceId: string): Promise<number> {
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('duration')
    .eq('id', serviceId)
    .single();
  
  if (serviceError) {
    console.error('Error fetching service duration:', serviceError);
    return 30; // Default duration in minutes
  }
  
  return service?.duration || 30;
}

/**
 * Fetches existing appointments for an employee on a specific date
 */
async function fetchExistingAppointments(employeeId: string, formattedDate: string) {
  const { data: appointments, error: appointmentError } = await supabase
    .from('appointments')
    .select('start_time, end_time')
    .eq('employee_id', employeeId)
    .gte('start_time', `${formattedDate}T00:00:00`)
    .lt('start_time', `${formattedDate}T23:59:59`)
    .neq('status', 'canceled');
  
  if (appointmentError) {
    console.error('Error fetching appointments:', appointmentError);
    return [];
  }
  
  console.log('Existing appointments:', appointments);
  return appointments || [];
}

/**
 * Fetches business time interval setting
 */
async function fetchTimeInterval(): Promise<number> {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('booking_time_interval')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();
  
  if (profileError) {
    console.error('Error fetching business settings:', profileError);
  }
  
  // Default to 30 minutes if not set
  return profile?.booking_time_interval || 30;
}

/**
 * Generates all possible time slots based on shift hours and time interval
 */
function generateTimeSlots(
  shiftStartTime: string, 
  shiftEndTime: string, 
  timeInterval: number, 
  serviceDuration: number
): string[] {
  const timeSlots: string[] = [];
  
  // Convert shift times to minutes for easier calculation
  const [shiftStartHour, shiftStartMinute] = shiftStartTime.split(':').map(Number);
  const [shiftEndHour, shiftEndMinute] = shiftEndTime.split(':').map(Number);
  
  const shiftStartInMinutes = shiftStartHour * 60 + shiftStartMinute;
  const shiftEndInMinutes = shiftEndHour * 60 + shiftEndMinute;
  
  console.log(`Shift hours: ${shiftStartTime} to ${shiftEndTime}`);
  console.log(`Service duration: ${serviceDuration} minutes`);
  
  // Generate slots based on the time interval from settings
  for (let minutes = shiftStartInMinutes; minutes <= shiftEndInMinutes - serviceDuration; minutes += timeInterval) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    
    const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    timeSlots.push(timeSlot);
  }
  
  return timeSlots;
}

/**
 * Filters time slots that conflict with existing appointments
 */
function filterAvailableSlots(
  timeSlots: string[], 
  appointments: any[], 
  formattedDate: string, 
  serviceDuration: number
): string[] {
  const availableSlots: string[] = [];
  
  timeSlots.forEach(timeSlot => {
    const slotStart = new Date(`${formattedDate}T${timeSlot}:00`);
    const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60000);
    
    const hasConflict = appointments?.some(appointment => {
      const appointmentStart = new Date(appointment.start_time);
      const appointmentEnd = new Date(appointment.end_time);
      
      // Check for overlap
      return (slotStart < appointmentEnd && slotEnd > appointmentStart);
    });
    
    if (!hasConflict) {
      availableSlots.push(timeSlot);
    }
  });
  
  return availableSlots;
}

/**
 * Main function to fetch available time slots for an employee, service, and date
 */
export async function fetchAvailableTimeSlots(
  employeeId: string,
  serviceId: string,
  date: string
): Promise<string[]> {
  try {
    // Format date and get day of week
    const formattedDate = date;
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay(); // 0 for Sunday, 1 for Monday, etc.
    
    // Step 1: Check if the employee has a shift for this day of the week
    const shift = await fetchEmployeeShift(employeeId, dayOfWeek);
    if (!shift) return [];
    
    const shiftStartTime = shift.start_time;
    const shiftEndTime = shift.end_time;
    
    // Step 2: Get service duration
    const serviceDuration = await fetchServiceDuration(serviceId);
    
    // Step 3: Get all existing appointments for this employee on this date
    const appointments = await fetchExistingAppointments(employeeId, formattedDate);
    
    // Step 4: Get business settings for time interval
    const timeInterval = await fetchTimeInterval();
    
    // Step 5: Generate all possible time slots within shift hours
    const allTimeSlots = generateTimeSlots(shiftStartTime, shiftEndTime, timeInterval, serviceDuration);
    
    // Step 6: Filter out time slots that conflict with existing appointments
    const availableSlots = filterAvailableSlots(allTimeSlots, appointments, formattedDate, serviceDuration);
    
    console.log('Available slots:', availableSlots);
    
    return availableSlots;
  } catch (error) {
    console.error('Error fetching available time slots:', error);
    return [];
  }
}
