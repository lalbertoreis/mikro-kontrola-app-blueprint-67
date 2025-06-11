
import { supabase } from "@/integrations/supabase/client";
import { AppointmentFormData } from "@/types/calendar";

export async function createAppointment(appointmentData: AppointmentFormData): Promise<any> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Parse the date and times
    const appointmentDate = new Date(`${appointmentData.date}T00:00:00`);
    const [startHours, startMinutes] = appointmentData.startTime.split(':').map(Number);
    const [endHours, endMinutes] = appointmentData.endTime.split(':').map(Number);
    
    const startDateTime = new Date(appointmentDate);
    startDateTime.setHours(startHours, startMinutes, 0, 0);
    
    const endDateTime = new Date(appointmentDate);
    endDateTime.setHours(endHours, endMinutes, 0, 0);

    const insertData = {
      employee_id: appointmentData.employee,
      service_id: appointmentData.service,
      client_id: appointmentData.client,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      status: 'scheduled' as const, // Status padrão é 'scheduled'
      notes: appointmentData.notes || null,
      user_id: user.id
    };

    let result;

    if (appointmentData.id) {
      // Update existing appointment
      const { data, error } = await supabase
        .from('appointments')
        .update(insertData)
        .eq('id', appointmentData.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Create new appointment
      const { data, error } = await supabase
        .from('appointments')
        .insert(insertData)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }

    return result;
  } catch (error: any) {
    console.error('Error creating/updating appointment:', error);
    throw new Error(error.message || 'Erro ao salvar agendamento');
  }
}
