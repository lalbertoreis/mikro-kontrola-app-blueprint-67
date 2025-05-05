import { supabase } from "@/integrations/supabase/client";
import { Appointment, AppointmentFormData, AppointmentStatus } from "@/types/calendar";

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
      title: item.service?.name || 'BLOQUEADO',
      start: new Date(item.start_time),
      end: new Date(item.end_time),
      employeeId: item.employee_id,
      serviceId: item.service_id,
      clientId: item.client_id,
      status: item.status as AppointmentStatus,
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
      title: data.service?.name || 'BLOQUEADO',
      start: new Date(data.start_time),
      end: new Date(data.end_time),
      employeeId: data.employee_id,
      serviceId: data.service_id,
      clientId: data.client_id,
      status: data.status as AppointmentStatus,
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
        status: 'scheduled' as AppointmentStatus,
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
      title: data.service?.name || '',
      start: new Date(data.start_time),
      end: new Date(data.end_time),
      employeeId: data.employee_id,
      serviceId: data.service_id,
      clientId: data.client_id,
      status: data.status as AppointmentStatus,
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

    // First, try to fetch a default client for blocked appointments
    let { data: clients, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .limit(1);
    
    // If no clients exist, create a default one
    if (clientError || !clients || clients.length === 0) {
      const { data: newClient, error: createError } = await supabase
        .from('clients')
        .insert({
          name: 'Cliente Padrão (Sistema)',
          email: 'sistema@exemplo.com',
          phone: '0000000000',
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select('id')
        .single();
        
      if (createError) throw new Error('Não foi possível criar um cliente padrão para o bloqueio.');
      clients = [newClient];
    }
    
    if (!clients || clients.length === 0) {
      throw new Error('Não foi possível encontrar ou criar um cliente para o bloqueio.');
    }
    
    // Create a "blocked" appointment
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        employee_id: employeeId,
        service_id: null, // Changed from null to an empty string to avoid not-null constraint
        client_id: clients[0].id, // Use the first client as a placeholder
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        status: 'blocked' as AppointmentStatus,
        notes: reason,
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select('*')
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      title: "BLOQUEADO",
      start: new Date(data.start_time),
      end: new Date(data.end_time),
      employeeId: data.employee_id,
      serviceId: null,
      clientId: data.client_id,
      status: data.status as AppointmentStatus,
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
    // For manual time entry, just return []
    return [];
  } catch (error) {
    console.error('Error fetching available time slots:', error);
    return [];
  }
}
