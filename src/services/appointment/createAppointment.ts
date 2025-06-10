
import { supabase } from "@/integrations/supabase/client";
import { Appointment, AppointmentFormData, AppointmentStatus } from "@/types/calendar";
import { checkOverlappingAppointments } from './utils';

export async function createAppointment(appointmentData: AppointmentFormData): Promise<Appointment> {
  try {
    const { employee, service, client, date, startTime, endTime, notes, id } = appointmentData;
    
    console.log('Creating appointment with data:', appointmentData);
    
    // Criar timestamps corretos com timezone brasileiro (-03:00)
    const appointmentDate = new Date(date + 'T00:00:00-03:00');
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    // Criar datetime objects com timezone brasileiro
    const startDateTime = new Date(appointmentDate);
    startDateTime.setHours(startHours, startMinutes, 0, 0);
    
    const endDateTime = new Date(appointmentDate);
    endDateTime.setHours(endHours, endMinutes, 0, 0);

    // Converter para ISO string com timezone brasileiro
    const startTimeISO = startDateTime.toISOString().replace('Z', '-03:00');
    const endTimeISO = endDateTime.toISOString().replace('Z', '-03:00');

    console.log('Parsed dates with Brazilian timezone:', {
      appointmentDate: appointmentDate.toISOString(),
      startTimeISO,
      endTimeISO,
      localStartTime: startDateTime.toLocaleString('pt-BR'),
      localEndTime: endDateTime.toLocaleString('pt-BR')
    });

    // Validação de data para novos agendamentos
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
      
      // Para agendamentos passados (mais de 5 minutos atrás), rejeitar
      const fiveMinutesAgo = currentTime - (5 * 60 * 1000);
      if (appointmentTime < fiveMinutesAgo) {
        console.error('Tentativa de agendar em horário muito passado');
        throw new Error('Não é possível agendar em horários passados.');
      }
      
      // Para agendamentos muito próximos (menos de 5 minutos), mostrar aviso mas permitir
      const fiveMinutesFromNow = currentTime + (5 * 60 * 1000);
      if (appointmentTime < fiveMinutesFromNow && appointmentTime >= fiveMinutesAgo) {
        console.warn('Agendamento muito próximo do horário atual');
      }
    }

    // Verificar conflitos de agendamento usando campos corretos
    const { data: conflictingAppointments, error: conflictError } = await supabase
      .from('appointments')
      .select('id, employee_id, client_id, start_time, end_time, status')
      .eq('employee_id', employee)
      .neq('status', 'canceled')
      .or(`and(start_time.lt.${endTimeISO},end_time.gt.${startTimeISO})`);
    
    if (conflictError) {
      console.error('Erro ao verificar conflitos:', conflictError);
      throw new Error('Erro ao verificar disponibilidade do horário');
    }

    // Filtrar conflitos, excluindo o agendamento atual se estivermos editando
    const actualConflicts = conflictingAppointments?.filter(apt => apt.id !== id) || [];
    
    if (actualConflicts.length > 0) {
      console.log('Conflicting appointments found:', actualConflicts);
      throw new Error('Já existe um agendamento ou bloqueio para este profissional neste horário.');
    }

    // Verificar conflitos do cliente
    const { data: clientConflicts, error: clientConflictError } = await supabase
      .from('appointments')
      .select('id, client_id, start_time, end_time, status')
      .eq('client_id', client)
      .neq('status', 'canceled')
      .or(`and(start_time.lt.${endTimeISO},end_time.gt.${startTimeISO})`);
    
    if (clientConflictError) {
      console.error('Erro ao verificar conflitos do cliente:', clientConflictError);
    } else {
      const actualClientConflicts = clientConflicts?.filter(apt => apt.id !== id) || [];
      if (actualClientConflicts.length > 0) {
        console.log('Client conflicts found:', actualClientConflicts);
        throw new Error('Este cliente já possui um agendamento neste horário.');
      }
    }
    
    // Se ID é fornecido, atualizar agendamento existente
    if (id) {
      console.log('Updating existing appointment:', id);
      
      const { data, error } = await supabase
        .from('appointments')
        .update({
          employee_id: employee,
          service_id: service,
          client_id: client,
          start_time: startTimeISO,
          end_time: endTimeISO,
          notes: notes,
          updated_at: new Date().toISOString()
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
    
    // Criar novo agendamento
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
        start_time: startTimeISO,
        end_time: endTimeISO,
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
