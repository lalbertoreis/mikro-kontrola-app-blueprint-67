
import { CACHE } from './cache';
import { setSlugContext } from './slugContext';
import { 
  fetchEmployeeShift,
  fetchServiceInfo,
  fetchExistingAppointments,
  fetchTimeInterval,
  fetchHolidays
} from './fetchData';
import {
  generateTimeSlots,
  filterAvailableSlots
} from './timeSlotGenerator';

/**
 * Main function to fetch available time slots for an employee, service, and date
 */
export async function fetchAvailableTimeSlots(
  employeeId: string,
  serviceId: string,
  date: string,
  slug?: string
): Promise<string[]> {
  try {
    // Unique cache key combining all parameters
    const cacheKey = `${employeeId}_${serviceId}_${date}_${slug || ''}`;
    
    // Short expiry for time slots (1 minute)
    const cached = CACHE.timeSlots.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp < 60 * 1000)) {
      return cached.data;
    }
    
    await setSlugContext(slug);
    
    // Format date and get day of week
    const formattedDate = date;
    const dateObj = new Date(`${date}T12:00:00`); // Use noon to avoid timezone issues
    const dayOfWeek = dateObj.getDay(); // 0 for Sunday, 1 for Monday, etc.
    
    // Step 1: Check if the employee has a shift for this day of the week
    const shift = await fetchEmployeeShift(employeeId, dayOfWeek, slug);
    if (!shift) {
      return [];
    }
    
    // Step 2: Get service information including duration and constraints
    const serviceInfo = await fetchServiceInfo(serviceId, slug);
    const serviceDuration = serviceInfo?.duration || 30;
    const simultaneousLimit = serviceInfo?.booking_simultaneous_limit || 1; // Default to 1 for stricter filtering
    
    // Step 3: Get all existing appointments for this employee on this date
    const appointments = await fetchExistingAppointments(employeeId, formattedDate, slug);
    
    // Step 4: Get business settings for time interval
    const timeInterval = await fetchTimeInterval(slug);
    
    // Step 5: Get holidays for this date
    const holidays = await fetchHolidays(formattedDate, slug);
    
    // Step 6: Generate all possible time slots within shift hours
    const allTimeSlots = generateTimeSlots(shift.start_time, shift.end_time, timeInterval, serviceDuration);
    
    // Step 7: Filter out time slots that conflict with existing appointments or holidays
    const availableSlots = filterAvailableSlots(
      allTimeSlots, 
      appointments, 
      formattedDate, 
      serviceDuration,
      simultaneousLimit,
      holidays
    );
    
    // Update cache
    CACHE.timeSlots.set(cacheKey, {
      data: availableSlots,
      timestamp: Date.now()
    });
    
    return availableSlots;
  } catch (error) {
    console.error('Error fetching available time slots:', error);
    return [];
  }
}

// Re-export type definitions
export * from './types';
