
import { supabase } from "@/integrations/supabase/client";
import { Appointment, AppointmentFormData } from "@/types/calendar";

export async function fetchAppointments(): Promise<Appointment[]> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        employee:employee_id(id, name),
        service:service_id(id, name, duration, price),
        client:client_id(id, name, phone, email)
      `)
      .order('start_time');
    
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      title: item.service.name,
      start: new Date(item.start_time),
      end: new Date(item.end_time),
      employeeId: item.employee_id,
      serviceId: item.service_id,
      clientId: item.client_id,
      status: item.status,
      notes: item.notes || undefined,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
}

export async function fetchAppointmentById(id: string): Promise<Appointment | null> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        employee:employee_id(id, name),
        service:service_id(id, name, duration, price),
        client:client_id(id, name, phone, email)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    return {
      id: data.id,
      title: data.service.name,
      start: new Date(data.start_time),
      end: new Date(data.end_time),
      employeeId: data.employee_id,
      serviceId: data.service_id,
      clientId: data.client_id,
      status: data.status,
      notes: data.notes || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Error fetching appointment:', error);
    throw error;
  }
}

export async function createAppointment(appointmentData: AppointmentFormData): Promise<Appointment> {
  try {
    const { employee, service, client, date, startTime, endTime, notes } = appointmentData;
    
    // Calculate complete start and end times
    const startDate = new Date(date);
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    startDate.setHours(startHours, startMinutes, 0, 0);
    
    const endDate = new Date(date);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    endDate.setHours(endHours, endMinutes, 0, 0);
    
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        employee_id: employee,
        service_id: service,
        client_id: client,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        status: 'scheduled',
        notes: notes,
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select(`
        *,
        employee:employee_id(id, name),
        service:service_id(id, name, duration, price),
        client:client_id(id, name, phone, email)
      `)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      title: data.service.name,
      start: new Date(data.start_time),
      end: new Date(data.end_time),
      employeeId: data.employee_id,
      serviceId: data.service_id,
      clientId: data.client_id,
      status: data.status,
      notes: data.notes || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
}

export async function blockTimeSlot(blockData: {
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
}): Promise<Appointment> {
  try {
    const { employeeId, date, startTime, endTime, reason } = blockData;
    
    // Calculate complete start and end times
    const startDate = new Date(date);
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    startDate.setHours(startHours, startMinutes, 0, 0);
    
    const endDate = new Date(date);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    endDate.setHours(endHours, endMinutes, 0, 0);
    
    // Create a "blocked" appointment
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        employee_id: employeeId,
        service_id: null, // No service associated with a block
        client_id: null, // No client associated with a block
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        status: 'blocked',
        notes: reason,
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select(`*`)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      title: "BLOQUEADO",
      start: new Date(data.start_time),
      end: new Date(data.end_time),
      employeeId: data.employee_id,
      serviceId: null,
      clientId: null,
      status: 'blocked',
      notes: data.notes || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Error blocking time slot:', error);
    throw error;
  }
}

export async function fetchAvailableTimeSlots(
  employeeId: string,
  serviceId: string,
  date: string
): Promise<string[]> {
  try {
    // First, get the employee's shift for the selected day
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    const { data: employeeShift, error: shiftError } = await supabase
      .from('shifts')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('day_of_week', dayOfWeek)
      .single();
    
    if (shiftError) {
      console.error('Error fetching employee shift:', shiftError);
      return [];
    }
    
    if (!employeeShift) {
      console.log('No shift found for the selected day');
      return [];
    }
    
    // Get the selected service details (for duration)
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .single();
    
    if (serviceError || !service) {
      console.error('Error fetching service:', serviceError);
      return [];
    }
    
    // Get all existing appointments for the employee on the selected date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const { data: existingAppointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('start_time', startOfDay.toISOString())
      .lte('end_time', endOfDay.toISOString());
    
    if (appointmentsError) {
      console.error('Error fetching existing appointments:', appointmentsError);
      return [];
    }
    
    // Calculate available time slots
    const serviceDuration = service.duration; // in minutes
    const startTime = employeeShift.start_time;
    const endTime = employeeShift.end_time;
    
    // Convert shift times to minutes since midnight for easier calculation
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const shiftStartMinutes = startHour * 60 + startMinute;
    const shiftEndMinutes = endHour * 60 + endMinute;
    
    // Generate 15-minute increments as potential start times
    const availableSlots: string[] = [];
    
    // Block out times that are already booked
    const blockedTimeRanges = existingAppointments.map(appointment => {
      const apptStart = new Date(appointment.start_time);
      const apptEnd = new Date(appointment.end_time);
      
      return {
        start: apptStart.getHours() * 60 + apptStart.getMinutes(),
        end: apptEnd.getHours() * 60 + apptEnd.getMinutes()
      };
    });
    
    // Generate slots at 15-minute intervals
    for (let time = shiftStartMinutes; time <= shiftEndMinutes - serviceDuration; time += 15) {
      const slotEndTime = time + serviceDuration;
      
      // Check if this time slot overlaps with any existing appointment
      const isOverlapping = blockedTimeRanges.some(range => 
        (time >= range.start && time < range.end) || 
        (slotEndTime > range.start && slotEndTime <= range.end) ||
        (time <= range.start && slotEndTime >= range.end)
      );
      
      if (!isOverlapping) {
        const hours = Math.floor(time / 60).toString().padStart(2, '0');
        const minutes = (time % 60).toString().padStart(2, '0');
        availableSlots.push(`${hours}:${minutes}`);
      }
    }
    
    return availableSlots;
  } catch (error) {
    console.error('Error fetching available time slots:', error);
    return [];
  }
}
