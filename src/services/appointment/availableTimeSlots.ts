
import { supabase } from "@/integrations/supabase/client";

// Cache para dados de turno
const shiftCache: Record<string, {data: any, timestamp: number}> = {};
const serviceCache: Record<string, {duration: number, timestamp: number}> = {};
const appointmentsCache: Record<string, {data: any[], timestamp: number}> = {};
const timeIntervalCache: Record<string, {interval: number, timestamp: number}> = {};

// Tempo de validade do cache em milissegundos (5 minutos)
const CACHE_EXPIRY = 5 * 60 * 1000;

/**
 * Fetches shift information for an employee on a specific day of the week
 */
async function fetchEmployeeShift(employeeId: string, dayOfWeek: number, slug?: string) {
  // Chave de cache
  const cacheKey = `${employeeId}_${dayOfWeek}_${slug || ''}`;
  
  // Verificar cache
  if (shiftCache[cacheKey] && (Date.now() - shiftCache[cacheKey].timestamp < CACHE_EXPIRY)) {
    console.log(`Usando cache de turno para ${cacheKey}`);
    return shiftCache[cacheKey].data;
  }
  
  // Define slug para a sessão se fornecido
  if (slug) {
    try {
      await supabase.rpc('set_slug_for_session', { slug });
      console.log("Set slug for session in fetchEmployeeShift:", slug);
    } catch (error) {
      console.error('Error setting slug for session in fetchEmployeeShift:', error);
    }
  }
  
  // Consulta diretamente na view employees_shifts_view
  const { data: shifts, error: shiftError } = await supabase
    .from('employees_shifts_view')
    .select('start_time, end_time')
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
  
  console.log(`Shift found for employee ${employeeId} on day ${dayOfWeek}:`, shifts[0]);
  
  // Armazenar no cache
  shiftCache[cacheKey] = {
    data: shifts[0],
    timestamp: Date.now()
  };
  
  // Get the employee's working hours for this day
  return shifts[0]; // Assuming one shift per day
}

/**
 * Fetches service duration in minutes
 */
async function fetchServiceDuration(serviceId: string, slug?: string): Promise<number> {
  // Chave de cache
  const cacheKey = `${serviceId}_${slug || ''}`;
  
  // Verificar cache
  if (serviceCache[cacheKey] && (Date.now() - serviceCache[cacheKey].timestamp < CACHE_EXPIRY)) {
    console.log(`Usando cache de duração do serviço para ${serviceId}`);
    return serviceCache[cacheKey].duration;
  }
  
  // Define slug para a sessão se fornecido
  if (slug) {
    try {
      await supabase.rpc('set_slug_for_session', { slug });
    } catch (error) {
      console.error('Error setting slug for session in fetchServiceDuration:', error);
    }
  }
  
  const { data: service, error: serviceError } = await supabase
    .from('business_services_view')
    .select('duration')
    .eq('id', serviceId)
    .maybeSingle();
  
  if (serviceError) {
    console.error('Error fetching service duration:', serviceError);
    return 30; // Default duration in minutes
  }
  
  const duration = service?.duration || 30;
  
  // Armazenar no cache
  serviceCache[cacheKey] = {
    duration,
    timestamp: Date.now()
  };
  
  return duration;
}

/**
 * Fetches existing appointments for an employee on a specific date
 */
async function fetchExistingAppointments(employeeId: string, formattedDate: string, slug?: string) {
  // Chave de cache
  const cacheKey = `${employeeId}_${formattedDate}_${slug || ''}`;
  
  // Verificar cache - curto prazo para agendamentos (1 minuto)
  if (appointmentsCache[cacheKey] && (Date.now() - appointmentsCache[cacheKey].timestamp < 60 * 1000)) {
    console.log(`Usando cache de agendamentos para ${cacheKey}`);
    return appointmentsCache[cacheKey].data;
  }
  
  // Define slug para a sessão se fornecido
  if (slug) {
    try {
      await supabase.rpc('set_slug_for_session', { slug });
    } catch (error) {
      console.error('Error setting slug for session in fetchExistingAppointments:', error);
    }
  }
  
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
  
  // Armazenar no cache
  appointmentsCache[cacheKey] = {
    data: appointments || [],
    timestamp: Date.now()
  };
  
  return appointments || [];
}

/**
 * Fetches business time interval setting
 */
async function fetchTimeInterval(slug?: string): Promise<number> {
  // Chave de cache
  const cacheKey = slug || 'default';
  
  // Verificar cache
  if (timeIntervalCache[cacheKey] && (Date.now() - timeIntervalCache[cacheKey].timestamp < CACHE_EXPIRY)) {
    console.log(`Usando cache de intervalo de tempo para ${cacheKey}`);
    return timeIntervalCache[cacheKey].interval;
  }
  
  // Se um slug foi fornecido, vamos definir o contexto da sessão
  if (slug) {
    try {
      await supabase.rpc('set_slug_for_session', { slug });
      console.log("Set slug for session in fetchTimeInterval:", slug);
    } catch (error) {
      console.error('Error setting slug for session:', error);
    }
  }
  
  // Get business ID by slug if provided
  let businessId = null;
  if (slug) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, booking_time_interval')
      .eq('slug', slug)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching business profile by slug:', error);
    } else if (profile) {
      console.log("Found business profile by slug:", profile);
      
      // Armazenar no cache
      timeIntervalCache[cacheKey] = {
        interval: profile.booking_time_interval || 30,
        timestamp: Date.now()
      };
      
      return profile.booking_time_interval || 30;
    }
  }
  
  // Fallback to current user if no slug or couldn't find profile by slug
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('booking_time_interval')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .maybeSingle();
  
  if (profileError) {
    console.error('Error fetching business settings:', profileError);
  }
  
  const interval = profile?.booking_time_interval || 30;
  
  // Armazenar no cache
  timeIntervalCache[cacheKey] = {
    interval,
    timestamp: Date.now()
  };
  
  // Default to 30 minutes if not set
  return interval;
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

// Cache para time slots
const timeSlotCache: Record<string, {slots: string[], timestamp: number}> = {};

/**
 * Main function to fetch available time slots for an employee, service, and date
 */
export async function fetchAvailableTimeSlots(
  employeeId: string,
  serviceId: string,
  date: string,
  slug?: string // Adicionamos o parâmetro slug para definir o contexto da sessão
): Promise<string[]> {
  try {
    // Chave de cache unindo todos os parâmetros
    const cacheKey = `${employeeId}_${serviceId}_${date}_${slug || ''}`;
    
    // Verificar cache - curto prazo para time slots (1 minuto)
    if (timeSlotCache[cacheKey] && (Date.now() - timeSlotCache[cacheKey].timestamp < 60 * 1000)) {
      console.log(`Usando cache de time slots para ${cacheKey}`);
      return timeSlotCache[cacheKey].slots;
    }
    
    // Set the session context with the slug if provided
    if (slug) {
      try {
        await supabase.rpc('set_slug_for_session', { slug });
        console.log("Set slug for session in fetchAvailableTimeSlots:", slug);
      } catch (error) {
        console.error('Error setting slug for session in fetchAvailableTimeSlots:', error);
      }
    }
    
    // Format date and get day of week - use the date as is, without adjustments
    const formattedDate = date;
    const dateObj = new Date(`${date}T12:00:00`); // Use noon to avoid timezone issues
    const dayOfWeek = dateObj.getDay(); // 0 for Sunday, 1 for Monday, etc.
    
    // Step 1: Check if the employee has a shift for this day of the week
    const shift = await fetchEmployeeShift(employeeId, dayOfWeek, slug);
    if (!shift) return [];
    
    const shiftStartTime = shift.start_time;
    const shiftEndTime = shift.end_time;
    
    // Step 2: Get service duration
    const serviceDuration = await fetchServiceDuration(serviceId, slug);
    
    // Step 3: Get all existing appointments for this employee on this date
    const appointments = await fetchExistingAppointments(employeeId, formattedDate, slug);
    
    // Step 4: Get business settings for time interval
    const timeInterval = await fetchTimeInterval(slug);
    
    // Step 5: Generate all possible time slots within shift hours
    const allTimeSlots = generateTimeSlots(shiftStartTime, shiftEndTime, timeInterval, serviceDuration);
    
    // Step 6: Filter out time slots that conflict with existing appointments
    const availableSlots = filterAvailableSlots(allTimeSlots, appointments, formattedDate, serviceDuration);
    
    console.log('Available slots:', availableSlots);
    
    // Armazenar no cache
    timeSlotCache[cacheKey] = {
      slots: availableSlots,
      timestamp: Date.now()
    };
    
    return availableSlots;
  } catch (error) {
    console.error('Error fetching available time slots:', error);
    return [];
  }
}
