
import { supabase } from "@/integrations/supabase/client";
import { Appointment, AppointmentStatus } from "@/types/calendar";
import { checkOverlappingAppointments } from './utils';

export async function blockTimeSlot(blockData: {
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
}): Promise<Appointment> {
  try {
    const { employeeId, date, startTime, endTime, reason } = blockData;
    
    // Fix: Create date objects with proper timezone handling
    // Format: date = "yyyy-MM-dd", startTime = "HH:mm", endTime = "HH:mm"
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    // Create Date objects with the correct date and times
    const startDate = new Date(`${date}T${startTime}:00`);
    const endDate = new Date(`${date}T${endTime}:00`);
    
    // Ensure we're using local time by setting hours/minutes directly
    startDate.setHours(startHours, startMinutes, 0, 0);
    endDate.setHours(endHours, endMinutes, 0, 0);

    // Check for overlapping appointments
    const hasOverlap = await checkOverlappingAppointments(employeeId, startDate.toISOString(), endDate.toISOString());
    if (hasOverlap) {
      throw new Error('Já existe um agendamento ou bloqueio para este profissional neste horário.');
    }

    // First, try to fetch a default client for blocked appointments
    let { data: clients, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('name', 'Cliente Padrão (Sistema)')
      .limit(1);
    
    // If no default client exists, create one
    if (clientError || !clients || clients.length === 0) {
      console.log("Creating default client for blocking");
      const { data: newClient, error: createClientError } = await supabase
        .from('clients')
        .insert({
          name: 'Cliente Padrão (Sistema)',
          email: 'sistema@exemplo.com',
          phone: '0000000000',
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select('id')
        .single();
        
      if (createClientError) {
        console.error("Error creating default client:", createClientError);
        throw new Error('Não foi possível criar um cliente padrão para o bloqueio.');
      }
      clients = [newClient];
    }
    
    if (!clients || clients.length === 0) {
      throw new Error('Não foi possível encontrar ou criar um cliente para o bloqueio.');
    }

    // Next, try to fetch a default service for blocked appointments
    let { data: services, error: serviceError } = await supabase
      .from('services')
      .select('id')
      .eq('name', 'Bloqueio de Horário (Sistema)')
      .limit(1);
    
    // If no default service exists, create one
    if (serviceError || !services || services.length === 0) {
      console.log("Creating default service for blocking");
      const { data: newService, error: createServiceError } = await supabase
        .from('services')
        .insert({
          name: 'Bloqueio de Horário (Sistema)',
          description: 'Serviço utilizado para bloqueio de horários na agenda',
          price: 0,
          duration: 30,
          is_active: true,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select('id')
        .single();
        
      if (createServiceError) {
        console.error("Error creating default service:", createServiceError);
        throw new Error('Não foi possível criar um serviço padrão para o bloqueio.');
      }
      services = [newService];
    }
    
    if (!services || services.length === 0) {
      throw new Error('Não foi possível encontrar ou criar um serviço para o bloqueio.');
    }
    
    // Create a "blocked" appointment with fixed date/time handling
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        employee_id: employeeId,
        service_id: services[0].id, // Use the default blocking service
        client_id: clients[0].id, // Use the default blocking client
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
      serviceId: data.service_id,
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
