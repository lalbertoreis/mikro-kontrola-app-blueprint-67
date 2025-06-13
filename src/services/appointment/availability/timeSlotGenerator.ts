
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
 * Filters out time slots that conflict with existing appointments or holidays
 */
export function filterAvailableSlots(
  allSlots: string[],
  appointments: any[],
  date: string,
  serviceDuration: number,
  simultaneousLimit: number = 3,
  holidays: Holiday[] = []
): string[] {
  // Check if date is a holiday that blocks all appointments
  const dateHolidays = holidays.filter(h => h.date === date && h.isActive);
  const fullDayHolidays = dateHolidays.filter(h => h.blockingType === 'full_day');
  
  if (fullDayHolidays.length > 0) {
    console.log('Full day holiday found, no slots available');
    return [];
  }
  
  // Get partial day holidays that might block specific time ranges
  const partialHolidays = dateHolidays.filter(h => h.blockingType === 'custom');
  
  return allSlots.filter(slot => {
    // Create start and end times for this slot
    const slotStart = `${date}T${slot}:00`;
    const slotEnd = `${date}T${format(addMinutes(parseISO(`${date}T${slot}:00`), serviceDuration), 'HH:mm')}:00`;
    
    // Check against partial day holidays (custom blocking type)
    for (const holiday of partialHolidays) {
      if (holiday.customStartTime && holiday.customEndTime) {
        const holidayStart = `${date}T${holiday.customStartTime}`;
        const holidayEnd = `${date}T${holiday.customEndTime}`;
        
        // Check if slot overlaps with holiday time
        if (
          (slotStart >= holidayStart && slotStart < holidayEnd) ||
          (slotEnd > holidayStart && slotEnd <= holidayEnd) ||
          (slotStart <= holidayStart && slotEnd >= holidayEnd)
        ) {
          console.log(`Slot ${slot} blocked by holiday: ${holiday.name}`);
          return false;
        }
      }
    }
    
    // Count how many appointments overlap with this time slot
    let conflictCount = 0;
    
    for (const appointment of appointments) {
      const appointmentStart = appointment.start_time;
      const appointmentEnd = appointment.end_time;
      
      // Check if the slot would overlap with this appointment
      // Two time ranges overlap if: (start1 < end2) AND (start2 < end1)
      if (slotStart < appointmentEnd && appointmentStart < slotEnd) {
        conflictCount++;
        
        // If we exceed the simultaneous limit, this slot is not available
        if (conflictCount >= simultaneousLimit) {
          console.log(`Slot ${slot} blocked - too many simultaneous appointments (${conflictCount}/${simultaneousLimit})`);
          return false;
        }
      }
    }
    
    console.log(`Slot ${slot} available - conflicts: ${conflictCount}/${simultaneousLimit}`);
    return true;
  });
}
