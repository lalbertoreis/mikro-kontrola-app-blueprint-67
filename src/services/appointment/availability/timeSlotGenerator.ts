
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
 * This function now properly filters out occupied slots so they are not shown to users
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
    // Create local time for this slot
    const [slotHour, slotMinute] = slot.split(':').map(Number);
    const slotStartTime = slotHour * 60 + slotMinute; // minutes from midnight
    const slotEndTime = slotStartTime + serviceDuration; // end time in minutes
    
    // Check against partial day holidays (custom blocking type)
    for (const holiday of partialHolidays) {
      if (holiday.customStartTime && holiday.customEndTime) {
        const [holidayStartHour, holidayStartMinute] = holiday.customStartTime.split(':').map(Number);
        const [holidayEndHour, holidayEndMinute] = holiday.customEndTime.split(':').map(Number);
        
        const holidayStartTime = holidayStartHour * 60 + holidayStartMinute;
        const holidayEndTime = holidayEndHour * 60 + holidayEndMinute;
        
        // Check if slot overlaps with holiday time
        if (
          (slotStartTime >= holidayStartTime && slotStartTime < holidayEndTime) ||
          (slotEndTime > holidayStartTime && slotEndTime <= holidayEndTime) ||
          (slotStartTime <= holidayStartTime && slotEndTime >= holidayEndTime)
        ) {
          return false;
        }
      }
    }
    
    // Count how many appointments overlap with this time slot
    let conflictCount = 0;
    
    for (const appointment of appointments) {
      // Parse appointment times
      const appointmentStart = new Date(appointment.start_time);
      const appointmentEnd = new Date(appointment.end_time);
      
      // Convert appointment times to minutes from midnight (local time)
      const appointmentStartTime = appointmentStart.getHours() * 60 + appointmentStart.getMinutes();
      const appointmentEndTime = appointmentEnd.getHours() * 60 + appointmentEnd.getMinutes();
      
      // Check for overlap using time in minutes - slots that overlap are NOT available
      const hasOverlap = (slotStartTime < appointmentEndTime) && (appointmentStartTime < slotEndTime);
      
      if (hasOverlap) {
        conflictCount++;
      }
    }
    
    // Return false if there are any conflicts (strict filtering for occupied slots)
    // This ensures occupied time slots are completely hidden from the user
    return conflictCount === 0;
  });
  
  return availableSlots;
}
