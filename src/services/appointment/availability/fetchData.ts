
import { supabase } from "@/integrations/supabase/client";
import { Shift } from './types';
import { CACHE, getFromCache } from './cache';
import { setSlugContext } from './slugContext';
import { Holiday } from '@/types/holiday';

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
 * Fetches service information including duration and booking constraints
 */
export async function fetchServiceInfo(serviceId: string, slug?: string): Promise<any> {
  const cacheKey = `${serviceId}_${slug || ''}`;
  
  return getFromCache(CACHE.services, cacheKey, async () => {
    await setSlugContext(slug);
    
    const { data: service, error: serviceError } = await supabase
      .from('business_services_view')
      .select('id, name, duration, booking_simultaneous_limit, booking_future_limit, booking_cancel_min_hours')
      .eq('id', serviceId)
      .maybeSingle();
    
    if (serviceError) {
      console.error('Error fetching service info:', serviceError);
      return { duration: 30, booking_simultaneous_limit: 3 }; // Default values
    }
    
    console.log('Service info:', service);
    return service || { duration: 30, booking_simultaneous_limit: 3 };
  });
}

/**
 * Fetches existing appointments for an employee on a specific date
 * Only returns confirmed/scheduled appointments that actually occupy time slots
 */
export async function fetchExistingAppointments(employeeId: string, formattedDate: string, slug?: string): Promise<any[]> {
  const cacheKey = `${employeeId}_${formattedDate}_${slug || ''}`;
  // Short expiry for appointments (30 seconds for real-time accuracy)
  const cached = CACHE.appointments.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp < 30 * 1000)) {
    return cached.data;
  }
  
  await setSlugContext(slug);
  
  // Fetch all non-canceled appointments for the employee on the specified date
  // Only include statuses that actually occupy the time slot
  const { data: appointments, error: appointmentError } = await supabase
    .from('appointments_view')
    .select('start_time, end_time, status')
    .eq('employee_id', employeeId)
    .gte('start_time', `${formattedDate}T00:00:00`)
    .lt('start_time', `${formattedDate}T23:59:59`)
    .in('status', ['scheduled', 'confirmed', 'in_progress']) // Only active appointments
    .order('start_time');
  
  if (appointmentError) {
    console.error('Error fetching appointments:', appointmentError);
    return [];
  }
  
  // Filter out any appointments that might be invalid
  const validAppointments = (appointments || []).filter(apt => 
    apt.start_time && apt.end_time && apt.status
  );
  
  CACHE.appointments.set(cacheKey, {
    data: validAppointments,
    timestamp: Date.now()
  });
  
  return validAppointments;
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
 * Maps database holiday data to the Holiday type expected by our application
 */
function mapDatabaseHolidayToAppHoliday(dbHoliday: any): Holiday {
  return {
    id: dbHoliday.id,
    date: dbHoliday.date,
    name: dbHoliday.name,
    type: dbHoliday.type,
    description: dbHoliday.description || undefined,
    isActive: dbHoliday.is_active,
    blockingType: dbHoliday.blocking_type,
    customStartTime: dbHoliday.custom_start_time || undefined,
    customEndTime: dbHoliday.custom_end_time || undefined,
    autoGenerated: dbHoliday.auto_generated,
    createdAt: dbHoliday.created_at,
    updatedAt: dbHoliday.updated_at
  };
}

/**
 * Fetches holidays for a specific date
 */
export async function fetchHolidays(formattedDate: string, slug?: string): Promise<Holiday[]> {
  const cacheKey = `${formattedDate}_${slug || ''}`;
  
  return getFromCache(CACHE.holidays, cacheKey, async () => {
    await setSlugContext(slug);
    
    // Check if current user is an employee
    const { data: { user } } = await supabase.auth.getUser();
    let businessOwnerId = user?.id;
    
    if (user) {
      const { data: employeePermissions } = await supabase
        .from('employee_permissions')
        .select('business_owner_id, can_view_calendar')
        .eq('user_id', user.id)
        .eq('can_view_calendar', true)
        .maybeSingle();
      
      if (employeePermissions?.business_owner_id) {
        businessOwnerId = employeePermissions.business_owner_id;
        console.log("User is employee, fetching holidays from business owner:", businessOwnerId);
      }
    }
    
    // If we have a slug, try to get holidays by slug first
    if (slug) {
      const { data: holidays, error: holidayError } = await supabase
        .rpc('get_holidays_by_date_and_slug', {
          date_param: formattedDate,
          slug_param: slug
        });
      
      if (!holidayError && holidays) {
        console.log('Holidays for date', formattedDate, 'by slug:', holidays);
        return (holidays || []).map(mapDatabaseHolidayToAppHoliday);
      }
    }
    
    // Fallback to direct query if we have a business owner ID
    if (businessOwnerId) {
      const { data: holidays, error: holidayError } = await supabase
        .from('holidays')
        .select('*')
        .eq('date', formattedDate)
        .eq('user_id', businessOwnerId)
        .eq('is_active', true);
      
      if (holidayError) {
        console.error('Error fetching holidays:', holidayError);
        return [];
      }
      
      console.log('Holidays for date', formattedDate, ':', holidays);
      return (holidays || []).map(mapDatabaseHolidayToAppHoliday);
    }
    
    return [];
  });
}
