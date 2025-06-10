
import { supabase } from "@/integrations/supabase/client";

export async function cancelAppointment(appointmentId: string): Promise<boolean> {
  try {
    console.log('Cancelando agendamento:', appointmentId);
    
    // Buscar o agendamento usando apenas campos da tabela appointments
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('id, start_time, user_id')
      .eq('id', appointmentId)
      .single();
    
    if (fetchError) {
      console.error('Erro ao buscar agendamento:', fetchError);
      throw new Error('Erro ao buscar detalhes do agendamento');
    }
    
    if (!appointment) {
      throw new Error('Agendamento não encontrado');
    }

    // Buscar configurações de cancelamento do perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('booking_cancel_min_hours')
      .eq('id', appointment.user_id)
      .single();
    
    // Usar 1 hora como padrão se não conseguir buscar as configurações
    const cancelMinHours = profile?.booking_cancel_min_hours || 1;
    
    const appointmentStartTime = new Date(appointment.start_time);
    const now = new Date();
    
    // Calcular diferença em horas
    const timeDiffMs = appointmentStartTime.getTime() - now.getTime();
    const timeDiffHours = timeDiffMs / (1000 * 60 * 60);
    
    console.log('Validação de cancelamento:', {
      timeDiffHours,
      cancelMinHours,
      canCancel: timeDiffHours >= cancelMinHours
    });
    
    if (timeDiffHours < cancelMinHours) {
      let timeMessage = `${cancelMinHours} hora(s)`;
      if (cancelMinHours >= 24) {
        const days = Math.floor(cancelMinHours / 24);
        timeMessage = days === 1 ? '1 dia' : `${days} dias`;
      }
      
      throw new Error(`O cancelamento só é permitido até ${timeMessage} antes do horário marcado.`);
    }
    
    // Atualizar status do agendamento para canceled
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ 
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId);
      
    if (updateError) {
      console.error('Erro ao atualizar agendamento:', updateError);
      throw new Error('Erro ao cancelar o agendamento');
    }
    
    console.log('Agendamento cancelado com sucesso');
    return true;
  } catch (error) {
    console.error('Error canceling appointment:', error);
    throw error;
  }
}
