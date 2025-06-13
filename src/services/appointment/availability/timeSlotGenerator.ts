
import { addMinutes, format, isAfter, isBefore, parseISO } from 'date-fns';
import { Holiday } from '@/types/holiday';

export interface Shift {
  start_time: string;
  end_time: string;
}

/**
 * Generates all possible time slots within shift hours
 */
export function generateTimeSlots(
  startTime: string,
  endTime: string,
  interval: number,
  serviceDuration: number
): string[] {
  const slots: string[] = [];
  
  // Parse times (assuming format HH:mm)
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  // Create date objects for today to work with time calculations
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), startHour, startMinute);
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), endHour, endMinute);
  
  // Generate slots
  let current = start;
  
  while (current < end) {
    // Check if there's enough time for the service before shift ends
    const slotEnd = addMinutes(current, serviceDuration);
    
    if (slotEnd <= end) {
      slots.push(format(current, 'HH:mm'));
    }
    
    // Move to next interval
    current = addMinutes(current, interval);
  }
  
  return slots;
}

/**
 * Enhanced function that filters out time slots that conflict with existing appointments or holidays
 * Fixed to handle timezone correctly and prevent false conflicts
 */
export function filterAvailableSlots(
  allSlots: string[],
  appointments: any[],
  date: string,
  serviceDuration: number,
  simultaneousLimit: number = 1,
  holidays: Holiday[] = []
): string[] {
  // Check if date is a holiday that blocks all appointments
  const dateHolidays = holidays.filter(h => h.date === date && h.isActive);
  const fullDayHolidays = dateHolidays.filter(h => h.blockingType === 'full_day');
  
  if (fullDayHolidays.length > 0) {
    return [];
  }
  
  // Get partial day holidays that might block specific time ranges
  const partialHolidays = dateHolidays.filter(h => h.blockingType === 'custom');
  
  const availableSlots = allSlots.filter(slot => {
    // Create local date objects for this slot using the correct date
    const [slotHour, slotMinute] = slot.split(':').map(Number);
    const slotStartLocal = new Date(`${date}T${slot}:00`);
    const slotEndLocal = new Date(slotStartLocal.getTime() + (serviceDuration * 60 * 1000));
    
    // Check against partial day holidays (custom blocking type)
    for (const holiday of partialHolidays) {
      if (holiday.customStartTime && holiday.customEndTime) {
        const holidayStart = new Date(`${date}T${holiday.customStartTime}`);
        const holidayEnd = new Date(`${date}T${holiday.customEndTime}`);
        
        // Check if slot overlaps with holiday time
        if (
          (slotStartLocal >= holidayStart && slotStartLocal < holidayEnd) ||
          (slotEndLocal > holidayStart && slotEndLocal <= holidayEnd) ||
          (slotStartLocal <= holidayStart && slotEndLocal >= holidayEnd)
        ) {
          return false;
        }
      }
    }
    
    // Count how many appointments overlap with this time slot
    let conflictCount = 0;
    
    for (const appointment of appointments) {
      // Parse appointment times and convert to local time for comparison
      const appointmentStartUTC = new Date(appointment.start_time);
      const appointmentEndUTC = new Date(appointment.end_time);
      
      // Convert UTC times to local times for proper comparison
      const appointmentStartLocal = new Date(appointmentStartUTC.getTime() - (appointmentStartUTC.getTimezoneOffset() * 60 * 1000));
      const appointmentEndLocal = new Date(appointmentEndUTC.getTime() - (appointmentEndUTC.getTimezoneOffset() * 60 * 1000));
      
      // Extract just the time part for comparison (same date)
      const appointmentStartTime = appointmentStartLocal.getHours() * 60 + appointmentStartLocal.getMinutes();
      const appointmentEndTime = appointmentEndLocal.getHours() * 60 + appointmentEndLocal.getMinutes();
      const slotStartTime = slotHour * 60 + slotMinute;
      const slotEndTime = slotStartTime + serviceDuration;
      
      // Check for overlap using time in minutes
      const hasOverlap = (slotStartTime < appointmentEndTime) && (appointmentStartTime < slotEndTime);
      
      if (hasOverlap) {
        conflictCount++;
      }
    }
    
    // STRICT filtering: if simultaneousLimit is 1, ANY conflict blocks the slot
    return conflictCount < simultaneousLimit;
  });
  
  return availableSlots;
}
