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

// Check if there are overlapping appointments for this employee
async function checkOverlappingAppointments(
  employeeId: string, 
  startTime: string, 
  endTime: string,
  appointmentId?: string // Optional: exclude current appointment when updating
): Promise<boolean> {
  let query = supabase
    .from('appointments')
    .select('id')
    .eq('employee_id', employeeId)
    .lt('start_time', endTime) // appointment starts before the new end time
    .gt('end_time', startTime); // appointment ends after the new start time

  // If we're updating an existing appointment, exclude it from the check
  if (appointmentId) {
    query = query.neq('id', appointmentId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error checking for overlapping appointments:', error);
    throw error;
  }

  return data && data.length > 0;
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

    // Check for overlapping appointments
    const hasOverlap = await checkOverlappingAppointments(employee, startDate.toISOString(), endDate.toISOString());
    if (hasOverlap) {
      throw new Error('Já existe um agendamento ou bloqueio para este profissional neste horário.');
    }
    
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
    
    // Create a "blocked" appointment
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

// New function to register payment for an appointment
export async function registerAppointmentPayment(
  appointmentId: string, 
  paymentMethod: string
): Promise<boolean> {
  try {
    // First get the appointment details
    const appointment = await fetchAppointmentById(appointmentId);
    
    if (!appointment || !appointment.serviceId || !appointment.clientId) {
      throw new Error('Detalhes do agendamento não encontrados ou incompletos');
    }
    
    // Fetch the service to get the price
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('name, price')
      .eq('id', appointment.serviceId)
      .single();
    
    if (serviceError || !service) {
      throw new Error('Não foi possível obter os detalhes do serviço');
    }
    
    // Create the transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        description: `Pagamento: ${service.name}`,
        amount: service.price,
        date: new Date().toISOString().split('T')[0], // Current date
        type: 'income',
        category: 'Serviços',
        payment_method: paymentMethod,
        quantity: 1,
        unit_price: service.price,
        client_id: appointment.clientId,
        service_id: appointment.serviceId,
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();
      
    if (transactionError) {
      console.error("Error registering payment:", transactionError);
      throw new Error('Não foi possível registrar o pagamento');
    }
    
    // Update appointment status to completed (optional)
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ status: 'completed' })
      .eq('id', appointmentId);
      
    if (updateError) {
      console.error("Error updating appointment status:", updateError);
      // Don't throw error here, payment was already registered
    }
    
    return true;
  } catch (error) {
    console.error('Error registering appointment payment:', error);
    throw error;
  }
}
