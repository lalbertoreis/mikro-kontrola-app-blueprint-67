
/**
 * Generates all possible time slots based on shift hours and time interval
 */
export function generateTimeSlots(
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
  console.log(`Time interval: ${timeInterval} minutes`);
  
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
 * Filters time slots that conflict with existing appointments or holidays
 */
export function filterAvailableSlots(
  timeSlots: string[], 
  appointments: any[], 
  formattedDate: string, 
  serviceDuration: number,
  simultaneousLimit: number,
  holidays: any[]
): string[] {
  if (!timeSlots.length) {
    return [];
  }
  
  console.log(`Filtering ${timeSlots.length} time slots with simultaneous limit: ${simultaneousLimit}`);
  
  // First, check if there are any full day holidays
  const hasFullDayHoliday = holidays.some(holiday => 
    holiday.blockingType === 'full_day' && holiday.isActive
  );
  
  if (hasFullDayHoliday) {
    console.log('Found full day holiday, no slots available');
    return [];
  }
  
  // Check for morning, afternoon or custom holidays
  const morningHoliday = holidays.some(holiday => 
    holiday.blockingType === 'morning' && holiday.isActive
  );
  
  const afternoonHoliday = holidays.some(holiday => 
    holiday.blockingType === 'afternoon' && holiday.isActive
  );
  
  const customHolidays = holidays.filter(holiday => 
    holiday.blockingType === 'custom' && holiday.isActive
  );
  
  return timeSlots.filter(timeSlot => {
    const slotStart = new Date(`${formattedDate}T${timeSlot}:00`);
    const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60000);
    const slotHour = parseInt(timeSlot.split(':')[0]);
    
    // Check holiday blocks
    if (morningHoliday && slotHour < 12) {
      console.log(`Slot ${timeSlot} blocked by morning holiday`);
      return false;
    }
    
    if (afternoonHoliday && slotHour >= 12) {
      console.log(`Slot ${timeSlot} blocked by afternoon holiday`);
      return false;
    }
    
    // Check custom holiday blocks
    for (const holiday of customHolidays) {
      if (holiday.customStartTime && holiday.customEndTime) {
        const holidayStart = new Date(`${formattedDate}T${holiday.customStartTime}`);
        const holidayEnd = new Date(`${formattedDate}T${holiday.customEndTime}`);
        
        if (slotStart < holidayEnd && slotEnd > holidayStart) {
          console.log(`Slot ${timeSlot} blocked by custom holiday: ${holiday.name}`);
          return false;
        }
      }
    }
    
    // Count overlapping appointments at this time slot
    let overlappingAppointments = 0;
    
    for (const appointment of appointments) {
      const appointmentStart = new Date(appointment.start_time);
      const appointmentEnd = new Date(appointment.end_time);
      
      // Check for overlap
      if (slotStart < appointmentEnd && slotEnd > appointmentStart) {
        overlappingAppointments++;
      }
    }
    
    // Check if we've reached the simultaneous booking limit
    if (overlappingAppointments >= simultaneousLimit) {
      console.log(`Slot ${timeSlot} has reached simultaneous limit (${overlappingAppointments}/${simultaneousLimit})`);
      return false;
    }
    
    return true;
  });
}
