
import { supabase } from "@/integrations/supabase/client";

export async function cancelAppointment(appointmentId: string): Promise<boolean> {
  try {
    // First get the appointment details
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('*, profiles:user_id(booking_cancel_min_hours)')
      .eq('id', appointmentId)
      .single();
    
    if (fetchError) {
      throw new Error('Erro ao buscar detalhes do agendamento');
    }
    
    // Check if there's a time limit for cancellation
    // Safely access the booking_cancel_min_hours property with proper null checks
    const profileData = appointment?.profiles;
    
    // Default to 1 hour if profileData is null or doesn't have booking_cancel_min_hours
    let cancelMinHours = 1; // default value
    if (profileData && 
        typeof profileData === 'object' && 
        profileData !== null && 
        'booking_cancel_min_hours' in profileData && 
        profileData.booking_cancel_min_hours !== null) {
      cancelMinHours = profileData.booking_cancel_min_hours;
    }
    
    const appointmentStartTime = new Date(appointment.start_time);
    const now = new Date();
    
    // Calculate time difference in hours
    const timeDiffMs = appointmentStartTime.getTime() - now.getTime();
    const timeDiffHours = timeDiffMs / (1000 * 60 * 60);
    
    if (timeDiffHours < cancelMinHours) {
      throw new Error(`O cancelamento só é permitido até ${cancelMinHours} hora(s) antes do horário marcado.`);
    }
    
    // Update appointment status to canceled
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ status: 'canceled' })
      .eq('id', appointmentId);
      
    if (updateError) {
      throw new Error('Erro ao cancelar o agendamento');
    }
    
    return true;
  } catch (error) {
    console.error('Error canceling appointment:', error);
    throw error;
  }
}
