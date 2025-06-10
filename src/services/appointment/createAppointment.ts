
import { supabase } from "@/integrations/supabase/client";
import { Appointment, AppointmentFormData, AppointmentStatus } from "@/types/calendar";
import { checkOverlappingAppointments } from './utils';

export async function createAppointment(appointmentData: AppointmentFormData): Promise<Appointment> {
  try {
    const { employee, service, client, date, startTime, endTime, notes, id } = appointmentData;
    
    console.log('Creating appointment with data:', appointmentData);
    
    // Parse the date and time values
    const appointmentDate = new Date(date + 'T00:00:00');
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    // Create start and end datetime objects
    const startDateTime = new Date(appointmentDate);
    startDateTime.setHours(startHours, startMinutes, 0, 0);
    
    const endDateTime = new Date(appointmentDate);
    endDateTime.setHours(endHours, endMinutes, 0, 0);

    console.log('Parsed dates:', {
      appointmentDate: appointmentDate.toISOString(),
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString()
    });

    // Enhanced date validation for new appointments
    if (!id) {
      const now = new Date();
      const currentTime = now.getTime();
      const appointmentTime = startDateTime.getTime();
      
      console.log('Date validation:', {
        now: now.toISOString(),
        startDateTime: startDateTime.toISOString(),
        currentTime,
        appointmentTime,
        diff: appointmentTime - currentTime
      });
      
      // For past appointments (more than 5 minutes ago), reject
      const fiveMinutesAgo = currentTime - (5 * 60 * 1000);
      if (appointmentTime < fiveMinutesAgo) {
        console.error('Tentativa de agendar em horário muito passado');
        throw new Error('Não é possível agendar em horários passados.');
      }
      
      // For very close appointments (less than 5 minutes), show warning but allow
      const fiveMinutesFromNow = currentTime + (5 * 60 * 1000);
      if (appointmentTime < fiveMinutesFromNow && appointmentTime >= fiveMinutesAgo) {
        console.warn('Agendamento muito próximo do horário atual');
      }
    }

    // Check for overlapping appointments (excluding the current appointment if editing)
    const hasOverlap = await checkOverlappingAppointments(
      employee, 
      startDateTime.toISOString(), 
      endDateTime.toISOString(),
      id // Pass appointment ID if editing
    );
    
    if (hasOverlap) {
      throw new Error('Já existe um agendamento ou bloqueio para este profissional neste horário.');
    }
    
    // If ID is provided, update existing appointment
    if (id) {
      console.log('Updating existing appointment:', id);
      
      const { data, error } = await supabase
        .from('appointments')
        .update({
          employee_id: employee,
          service_id: service,
          client_id: client,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
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
      
      if (error) {
        console.error('Error updating appointment:', error);
        throw new Error(`Erro ao atualizar agendamento: ${error.message}`);
      }
      
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
    console.log('Creating new appointment');
    
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }
    
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        employee_id: employee,
        service_id: service,
        client_id: client,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        status: 'scheduled' as AppointmentStatus,
        notes: notes,
        user_id: userId
      })
      .select(`
        *,
        employee:employee_id(id, name),
        service:service_id(id, name, duration, price),
        client:client_id(id, name, phone, email)
      `)
      .single();
    
    if (error) {
      console.error('Error creating appointment:', error);
      throw new Error(`Erro ao criar agendamento: ${error.message}`);
    }
    
    console.log('Appointment created successfully:', data);
    
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
    console.error('Error in createAppointment:', error);
    throw error;
  }
}
