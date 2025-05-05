
import { supabase } from "@/integrations/supabase/client";
import { Appointment, AppointmentFormData, AppointmentStatus } from "@/types/calendar";
import { checkOverlappingAppointments } from './utils';

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
