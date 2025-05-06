
import { supabase } from "@/integrations/supabase/client";

// Types for better readability and testability
interface Shift {
  start_time: string;
  end_time: string;
}

interface CachedItem<T> {
  data: T;
  timestamp: number;
}

// Cache configuration
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
const CACHE = {
  shifts: new Map<string, CachedItem<Shift>>(),
  services: new Map<string, CachedItem<number>>(),
  appointments: new Map<string, CachedItem<any[]>>(),
  timeIntervals: new Map<string, CachedItem<number>>(),
  timeSlots: new Map<string, CachedItem<string[]>>()
};

/**
 * Sets the slug context for the Supabase session
 */
export async function setSlugContext(slug?: string): Promise<void> {
  if (!slug) return;
  
  try {
    await supabase.rpc('set_slug_for_session', { slug });
    console.log("Set slug for session:", slug);
  } catch (error) {
    console.error('Error setting slug for session:', error);
  }
}

/**
 * Generic cache function to get or set data
 */
function getFromCache<T>(
  cacheMap: Map<string, CachedItem<T>>, 
  key: string, 
  fetchFn: () => Promise<T>
): Promise<T> {
  const cached = cacheMap.get(key);
  
  if (cached && (Date.now() - cached.timestamp < CACHE_EXPIRY)) {
    console.log(`Cache hit for ${key}`);
    return Promise.resolve(cached.data);
  }
  
  return fetchFn().then(data => {
    cacheMap.set(key, {
      data,
      timestamp: Date.now()
    });
    return data;
  });
}

/**
 * Fetches shift information for an employee on a specific day of the week
 */
export async function fetchEmployeeShift(employeeId: string, dayOfWeek: number, slug?: string): Promise<Shift | null> {
  const cacheKey = `${employeeId}_${dayOfWeek}_${slug || ''}`;
  
  return getFromCache(CACHE.shifts, cacheKey, async () => {
    await setSlugContext(slug);
    
    const { data: shifts, error: shiftError } = await supabase
      .from('employees_shifts_view')
      .select('start_time, end_time')
      .eq('employee_id', employeeId)
      .eq('day_of_week', dayOfWeek);
    
    if (shiftError) {
      console.error('Error fetching employee shifts:', shiftError);
      return null;
    }
    
    if (!shifts || shifts.length === 0) {
      console.log(`No shifts found for employee ${employeeId} on day ${dayOfWeek}`);
      return null;
    }
    
    console.log(`Shift found for employee ${employeeId} on day ${dayOfWeek}:`, shifts[0]);
    return shifts[0];
  });
}

/**
 * Fetches service duration in minutes
 */
export async function fetchServiceDuration(serviceId: string, slug?: string): Promise<number> {
  const cacheKey = `${serviceId}_${slug || ''}`;
  
  return getFromCache(CACHE.services, cacheKey, async () => {
    await setSlugContext(slug);
    
    const { data: service, error: serviceError } = await supabase
      .from('business_services_view')
      .select('duration')
      .eq('id', serviceId)
      .maybeSingle();
    
    if (serviceError) {
      console.error('Error fetching service duration:', serviceError);
      return 30; // Default duration in minutes
    }
    
    return service?.duration || 30;
  });
}

/**
 * Fetches existing appointments for an employee on a specific date
 */
export async function fetchExistingAppointments(employeeId: string, formattedDate: string, slug?: string): Promise<any[]> {
  const cacheKey = `${employeeId}_${formattedDate}_${slug || ''}`;
  // Short expiry for appointments (1 minute)
  const cached = CACHE.appointments.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp < 60 * 1000)) {
    console.log(`Using cached appointments for ${cacheKey}`);
    return cached.data;
  }
  
  await setSlugContext(slug);
  
  const { data: appointments, error: appointmentError } = await supabase
    .from('appointments_view')
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
  
  CACHE.appointments.set(cacheKey, {
    data: appointments || [],
    timestamp: Date.now()
  });
  
  return appointments || [];
}

/**
 * Fetches business time interval setting
 */
export async function fetchTimeInterval(slug?: string): Promise<number> {
  const cacheKey = slug || 'default';
  
  return getFromCache(CACHE.timeIntervals, cacheKey, async () => {
    await setSlugContext(slug);
    
    if (slug) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, booking_time_interval')
        .eq('slug', slug)
        .maybeSingle();
      
      if (!error && profile) {
        console.log("Found business profile by slug:", profile);
        return profile.booking_time_interval || 30;
      }
      
      if (error) {
        console.error('Error fetching business profile by slug:', error);
      }
    }
    
    // Fallback to current user
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('booking_time_interval')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .maybeSingle();
    
    if (profileError) {
      console.error('Error fetching business settings:', profileError);
    }
    
    return profile?.booking_time_interval || 30;
  });
}

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
export function filterAvailableSlots(
  timeSlots: string[], 
  appointments: any[], 
  formattedDate: string, 
  serviceDuration: number
): string[] {
  if (!timeSlots.length || !appointments) {
    return timeSlots;
  }
  
  return timeSlots.filter(timeSlot => {
    const slotStart = new Date(`${formattedDate}T${timeSlot}:00`);
    const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60000);
    
    const hasConflict = appointments.some(appointment => {
      const appointmentStart = new Date(appointment.start_time);
      const appointmentEnd = new Date(appointment.end_time);
      
      // Check for overlap
      return (slotStart < appointmentEnd && slotEnd > appointmentStart);
    });
    
    return !hasConflict;
  });
}

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
      console.log(`Using cached time slots for ${cacheKey}`);
      return cached.data;
    }
    
    await setSlugContext(slug);
    
    // Format date and get day of week
    const formattedDate = date;
    const dateObj = new Date(`${date}T12:00:00`); // Use noon to avoid timezone issues
    const dayOfWeek = dateObj.getDay(); // 0 for Sunday, 1 for Monday, etc.
    
    // Step 1: Check if the employee has a shift for this day of the week
    const shift = await fetchEmployeeShift(employeeId, dayOfWeek, slug);
    if (!shift) return [];
    
    // Step 2: Get service duration
    const serviceDuration = await fetchServiceDuration(serviceId, slug);
    
    // Step 3: Get all existing appointments for this employee on this date
    const appointments = await fetchExistingAppointments(employeeId, formattedDate, slug);
    
    // Step 4: Get business settings for time interval
    const timeInterval = await fetchTimeInterval(slug);
    
    // Step 5: Generate all possible time slots within shift hours
    const allTimeSlots = generateTimeSlots(shift.start_time, shift.end_time, timeInterval, serviceDuration);
    
    // Step 6: Filter out time slots that conflict with existing appointments
    const availableSlots = filterAvailableSlots(allTimeSlots, appointments, formattedDate, serviceDuration);
    
    console.log('Available slots:', availableSlots);
    
    CACHE.timeSlots.set(cacheKey, {
      slots: availableSlots,
      timestamp: Date.now()
    });
    
    return availableSlots;
  } catch (error) {
    console.error('Error fetching available time slots:', error);
    return [];
  }
}
