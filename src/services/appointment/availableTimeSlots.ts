
import { supabase } from "@/integrations/supabase/client";
import { format, parse } from "date-fns";

export async function fetchAvailableTimeSlots(
  employeeId: string,
  serviceId: string,
  date: string
): Promise<string[]> {
  try {
    // Format date for query
    const formattedDate = date;
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay(); // 0 for Sunday, 1 for Monday, etc.
    
    // Step 1: Check if the employee has a shift for this day of the week
    const { data: shifts, error: shiftError } = await supabase
      .from('shifts')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('day_of_week', dayOfWeek);
    
    if (shiftError) {
      console.error('Error fetching employee shifts:', shiftError);
      return [];
    }
    
    // If no shifts for this day, return empty array (employee doesn't work this day)
    if (!shifts || shifts.length === 0) {
      console.log(`No shifts found for employee ${employeeId} on day ${dayOfWeek}`);
      return [];
    }
    
    // Get the employee's working hours for this day
    const shift = shifts[0]; // Assuming one shift per day
    const shiftStartTime = shift.start_time;
    const shiftEndTime = shift.end_time;
    
    // Step 2: Get service duration
    let serviceDuration = 30; // Default duration in minutes
    
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('duration')
      .eq('id', serviceId)
      .single();
    
    if (!serviceError && service) {
      serviceDuration = service.duration;
    } else {
      console.error('Error fetching service duration:', serviceError);
    }
    
    // Step 3: Get all existing appointments for this employee on this date
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
    
    // Step 4: Get business settings for time interval
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('booking_time_interval')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();
    
    if (profileError) {
      console.error('Error fetching business settings:', profileError);
    }
    
    // Default to 30 minutes if not set
    const timeInterval = profile?.booking_time_interval || 30;
    
    // Step 5: Generate all possible time slots within shift hours
    const availableSlots: string[] = [];
    
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
      
      // Step 6: Check if this time slot conflicts with any existing appointment
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
    }
    
    console.log('Available slots:', availableSlots);
    
    return availableSlots;
  } catch (error) {
    console.error('Error fetching available time slots:', error);
    return [];
  }
}
