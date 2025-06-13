
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
 * Now with improved conflict detection and strict filtering
 */
export function filterAvailableSlots(
  allSlots: string[],
  appointments: any[],
  date: string,
  serviceDuration: number,
  simultaneousLimit: number = 1,
  holidays: Holiday[] = []
): string[] {
  console.log("=== FILTERING AVAILABLE SLOTS ===");
  console.log("Input slots:", allSlots);
  console.log("Existing appointments:", appointments);
  console.log("Service duration:", serviceDuration, "minutes");
  console.log("Simultaneous limit:", simultaneousLimit);
  
  // Check if date is a holiday that blocks all appointments
  const dateHolidays = holidays.filter(h => h.date === date && h.isActive);
  const fullDayHolidays = dateHolidays.filter(h => h.blockingType === 'full_day');
  
  if (fullDayHolidays.length > 0) {
    console.log('Full day holiday found, no slots available');
    return [];
  }
  
  // Get partial day holidays that might block specific time ranges
  const partialHolidays = dateHolidays.filter(h => h.blockingType === 'custom');
  
  const availableSlots = allSlots.filter(slot => {
    // Create start and end times for this slot
    const slotStart = `${date}T${slot}:00`;
    const slotEnd = `${date}T${format(addMinutes(parseISO(`${date}T${slot}:00`), serviceDuration), 'HH:mm')}:00`;
    
    console.log(`\n--- Checking slot ${slot} ---`);
    console.log(`Slot period: ${slotStart} to ${slotEnd}`);
    
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
          console.log(`❌ Slot ${slot} blocked by holiday: ${holiday.name}`);
          return false;
        }
      }
    }
    
    // Count how many appointments overlap with this time slot
    let conflictCount = 0;
    const conflictingAppointments: any[] = [];
    
    for (const appointment of appointments) {
      const appointmentStart = appointment.start_time;
      const appointmentEnd = appointment.end_time;
      
      console.log(`  Checking vs appointment: ${appointmentStart} to ${appointmentEnd}`);
      
      // Enhanced overlap detection with strict time comparison
      // Two time ranges overlap if: (start1 < end2) AND (start2 < end1)
      const slotStartTime = new Date(slotStart);
      const slotEndTime = new Date(slotEnd);
      const appointmentStartTime = new Date(appointmentStart);
      const appointmentEndTime = new Date(appointmentEnd);
      
      const hasOverlap = slotStartTime < appointmentEndTime && appointmentStartTime < slotEndTime;
      
      if (hasOverlap) {
        conflictCount++;
        conflictingAppointments.push(appointment);
        console.log(`  ⚠️ OVERLAP DETECTED! Count: ${conflictCount}`);
        console.log(`    Slot: ${slotStartTime.toISOString()} - ${slotEndTime.toISOString()}`);
        console.log(`    Appt: ${appointmentStartTime.toISOString()} - ${appointmentEndTime.toISOString()}`);
      }
    }
    
    // Apply simultaneous limit (strict filtering when limit is 1)
    const isAvailable = conflictCount < simultaneousLimit;
    
    if (!isAvailable) {
      console.log(`❌ Slot ${slot} BLOCKED - conflicts: ${conflictCount}/${simultaneousLimit}`);
      console.log(`   Conflicting appointments:`, conflictingAppointments.map(a => `${a.start_time} - ${a.end_time}`));
    } else {
      console.log(`✅ Slot ${slot} AVAILABLE - conflicts: ${conflictCount}/${simultaneousLimit}`);
    }
    
    return isAvailable;
  });
  
  console.log("=== FILTERING COMPLETE ===");
  console.log(`Available slots: ${availableSlots.length}/${allSlots.length}`);
  console.log("Final available slots:", availableSlots);
  
  return availableSlots;
}
