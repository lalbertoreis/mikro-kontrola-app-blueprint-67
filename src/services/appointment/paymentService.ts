
import { supabase } from "@/integrations/supabase/client";
import { fetchAppointmentById } from "./fetchAppointments";

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
    
    // Update appointment status to completed
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ status: 'completed' })
      .eq('id', appointmentId);
      
    if (updateError) {
      console.error("Error updating appointment status:", updateError);
      throw new Error('Pagamento registrado mas não foi possível atualizar o status do agendamento');
    }
    
    return true;
  } catch (error) {
    console.error('Error registering appointment payment:', error);
    throw error;
  }
}
