
import { supabase } from "@/integrations/supabase/client";
import { format, addMinutes } from 'date-fns';

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictingAppointments?: any[];
  error?: string;
}

/**
 * Check for appointment conflicts before booking
 */
export async function checkAppointmentConflicts({
  employeeId,
  startTime,
  duration,
  businessSlug,
  excludeAppointmentId
}: {
  employeeId: string;
  startTime: Date;
  duration: number;
  businessSlug?: string;
  excludeAppointmentId?: string;
}): Promise<ConflictCheckResult> {
  try {
    console.log("Checking appointment conflicts:", {
      employeeId,
      startTime: startTime.toISOString(),
      duration,
      businessSlug
    });
    
    // Calculate end time
    const endTime = addMinutes(startTime, duration);
    
    // Query for conflicting appointments using the appointments view
    let query = supabase
      .from('appointments_view')
      .select(`
        appointment_id,
        start_time,
        end_time,
        employee_id,
        status,
        business_slug
      `)
      .eq('employee_id', employeeId)
      .neq('status', 'canceled')
      .neq('status', 'no-show');
    
    // Filter by business slug if provided
    if (businessSlug) {
      query = query.eq('business_slug', businessSlug);
    }
    
    // Exclude specific appointment if provided (for updates)
    if (excludeAppointmentId) {
      query = query.neq('appointment_id', excludeAppointmentId);
    }
    
    const { data: appointments, error } = await query;
    
    if (error) {
      console.error('Error checking conflicts:', error);
      return {
        hasConflict: false,
        error: error.message
      };
    }
    
    if (!appointments || appointments.length === 0) {
      console.log("No existing appointments found");
      return { hasConflict: false };
    }
    
    // Check for time overlaps
    const conflictingAppointments = appointments.filter(appointment => {
      const appointmentStart = new Date(appointment.start_time);
      const appointmentEnd = new Date(appointment.end_time);
      
      // Check if times overlap
      // Two appointments overlap if:
      // (start1 < end2) AND (start2 < end1)
      const hasOverlap = (
        startTime < appointmentEnd && 
        appointmentStart < endTime
      );
      
      if (hasOverlap) {
        console.log("Conflict found:", {
          existing: {
            start: appointmentStart.toISOString(),
            end: appointmentEnd.toISOString()
          },
          new: {
            start: startTime.toISOString(),
            end: endTime.toISOString()
          }
        });
      }
      
      return hasOverlap;
    });
    
    return {
      hasConflict: conflictingAppointments.length > 0,
      conflictingAppointments
    };
    
  } catch (error: any) {
    console.error('Error in checkAppointmentConflicts:', error);
    return {
      hasConflict: false,
      error: error.message
    };
  }
}

/**
 * Validate appointment time is within business hours
 */
export async function validateBusinessHours({
  employeeId,
  startTime,
  businessSlug
}: {
  employeeId: string;
  startTime: Date;
  businessSlug?: string;
}): Promise<{
  isValid: boolean;
  error?: string;
}> {
  try {
    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = startTime.getDay();
    
    // For now, we'll do a simple validation
    // In the future, this could check employee shifts and business hours
    const hour = startTime.getHours();
    
    // Basic validation: between 6 AM and 10 PM
    if (hour < 6 || hour >= 22) {
      return {
        isValid: false,
        error: 'Horário fora do funcionamento (6h às 22h)'
      };
    }
    
    return { isValid: true };
    
  } catch (error: any) {
    console.error('Error validating business hours:', error);
    return {
      isValid: false,
      error: error.message
    };
  }
}
