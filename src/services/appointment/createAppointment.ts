
import { supabase } from "@/integrations/supabase/client";
import { Appointment, AppointmentFormData, AppointmentStatus } from "@/types/calendar";
import { checkOverlappingAppointments } from './utils';

export async function createAppointment(appointmentData: AppointmentFormData): Promise<Appointment> {
  try {
    const { employee, service, client, date, startTime, endTime, notes, id } = appointmentData;
    
    // Calculate complete start and end times
    const startDate = new Date(date);
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    startDate.setHours(startHours, startMinutes, 0, 0);
    
    const endDate = new Date(date);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    endDate.setHours(endHours, endMinutes, 0, 0);

    // Verificar se a data do agendamento é no passado - só para novos agendamentos
    if (!id) {
      const now = new Date();
      // Permite agendamentos para o mesmo dia se for após o horário atual
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const appointmentDay = new Date(startDate);
      appointmentDay.setHours(0, 0, 0, 0);
      
      // Se for um dia anterior a hoje, não permite
      if (appointmentDay < todayStart) {
        throw new Error('Não é possível agendar em datas passadas.');
      }
      
      // Se for hoje, só permite se for após o horário atual
      if (appointmentDay.getTime() === todayStart.getTime() && startDate < now) {
        throw new Error('Não é possível agendar em horários passados.');
      }
    }

    // Check for overlapping appointments (excluding the current appointment if editing)
    const hasOverlap = await checkOverlappingAppointments(
      employee, 
      startDate.toISOString(), 
      endDate.toISOString(),
      id // Pass appointment ID if editing
    );
    
    if (hasOverlap) {
      throw new Error('Já existe um agendamento ou bloqueio para este profissional neste horário.');
    }
    
    // If ID is provided, update existing appointment
    if (id) {
      const { data, error } = await supabase
        .from('appointments')
        .update({
          employee_id: employee,
          service_id: service,
          client_id: client,
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString(),
          notes: notes,
        })
        .eq('id', id)
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
    }
    
    // Create new appointment
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
