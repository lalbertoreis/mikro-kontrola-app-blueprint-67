
import { supabase } from "@/integrations/supabase/client";
import { BookingAppointment } from "@/components/booking/MyAppointmentsDialog";
import { format } from "date-fns";
import { getBusinessUserId, setSlugForSession } from "./businessUtils";

// Fetch user appointments by phone number
export const fetchUserAppointmentsByPhone = async (phone: string, businessSlug?: string): Promise<BookingAppointment[]> => {
  try {
    console.log("Fetching appointments for phone:", phone, "slug:", businessSlug);
    
    // Se temos um slug, vamos definir o contexto da sessão
    if (businessSlug) {
      await setSlugForSession(businessSlug);
    }
    
    // Obter o ID do negócio pelo slug (se fornecido)
    let businessId = null;
    if (businessSlug) {
      const { data: business } = await supabase
        .from('profiles')
        .select('id')
        .eq('slug', businessSlug)
        .maybeSingle();
      
      businessId = business?.id;
      console.log("Business ID found:", businessId);
    }
    
    // Primeiro, buscar TODOS os clientes com este telefone (em qualquer negócio)
    const cleanPhone = phone.replace(/\D/g, '');
    console.log("Clean phone for search:", cleanPhone);
    
    const { data: allClients, error: clientsError } = await supabase
      .from('clients')
      .select('id, user_id, name')
      .eq('phone', cleanPhone);
    
    if (clientsError) {
      console.error("Error fetching clients:", clientsError);
      return [];
    }
    
    if (!allClients || allClients.length === 0) {
      console.log("No clients found with this phone number");
      return [];
    }
    
    console.log("Found clients:", allClients);
    
    // Extrair todos os IDs de clientes
    const clientIds = allClients.map(client => client.id);
    
    // Buscar agendamentos usando os IDs dos clientes
    let appointmentsQuery = supabase
      .from('appointments_view')
      .select(`
        appointment_id,
        start_time,
        status,
        employee_id,
        service_id,
        business_slug,
        client_id
      `)
      .in('client_id', clientIds)
      .neq('status', 'canceled')
      .order('start_time', { ascending: true });
    
    // Se temos um slug específico, filtrar apenas agendamentos deste negócio
    if (businessSlug) {
      appointmentsQuery = appointmentsQuery.eq('business_slug', businessSlug);
    }
    
    const { data: appointmentsData, error: appointmentsError } = await appointmentsQuery;
    
    if (appointmentsError) {
      console.error("Error fetching appointments:", appointmentsError);
      return [];
    }
    
    console.log("Found appointments:", appointmentsData);
    
    if (!appointmentsData || appointmentsData.length === 0) {
      console.log("No appointments found");
      return [];
    }
    
    // Buscar detalhes dos serviços e funcionários
    const appointmentsWithDetails = await Promise.all(
      appointmentsData.map(async (app) => {
        console.log("Processing appointment:", app);
        
        // Buscar nome do serviço
        const { data: serviceData } = await supabase
          .from('services')
          .select('name')
          .eq('id', app.service_id)
          .single();
          
        // Buscar nome do funcionário
        const { data: employeeData } = await supabase
          .from('employees')
          .select('name')
          .eq('id', app.employee_id)
          .single();
        
        return {
          id: app.appointment_id,
          serviceName: serviceData?.name || 'Serviço',
          employeeName: employeeData?.name || 'Profissional',
          date: format(new Date(app.start_time), 'dd/MM/yyyy'),
          time: format(new Date(app.start_time), 'HH:mm'),
          status: app.status,
          businessSlug: app.business_slug
        };
      })
    );
    
    console.log("Final appointments with details:", appointmentsWithDetails);
    return appointmentsWithDetails;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
};

// Cancel an appointment by ID
export const cancelAppointment = async (id: string, businessSlug?: string): Promise<boolean> => {
  try {
    console.log("Canceling appointment:", id, "business:", businessSlug);
    
    // Se temos um slug, vamos definir o contexto da sessão
    if (businessSlug) {
      await setSlugForSession(businessSlug);
    }
    
    // Verificar configurações de cancelamento do negócio
    // Obter informação do agendamento da view
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments_view')
      .select('*')
      .eq('appointment_id', id)
      .maybeSingle();
      
    if (fetchError || !appointment) {
      console.error("Error fetching appointment:", fetchError);
      throw new Error("Agendamento não encontrado");
    }
    
    console.log("Appointment found for cancellation:", appointment);
    
    // Obter configurações do negócio
    let cancelMinHours = 1; // valor padrão
    
    if (appointment.business_slug) {
      const { data: businessProfile, error: businessError } = await supabase
        .from('profiles')
        .select('booking_cancel_min_hours')
        .eq('slug', appointment.business_slug)
        .maybeSingle();
        
      if (!businessError && businessProfile) {
        cancelMinHours = businessProfile.booking_cancel_min_hours || 1;
      }
    }
    
    const appointmentStartTime = new Date(appointment.start_time);
    const now = new Date();
    
    // Calculate time difference in hours
    const timeDiffMs = appointmentStartTime.getTime() - now.getTime();
    const timeDiffHours = timeDiffMs / (1000 * 60 * 60);
    
    if (timeDiffHours < cancelMinHours) {
      // Format the message based on the cancelMinHours value
      let timeMessage = `${cancelMinHours} hora(s)`;
      if (cancelMinHours >= 24) {
        const days = Math.floor(cancelMinHours / 24);
        timeMessage = days === 1 ? '1 dia' : `${days} dias`;
      }
      
      throw new Error(`O cancelamento só é permitido até ${timeMessage} antes do horário marcado.`);
    }
    
    // Set slug context for the specific appointment business
    if (appointment.business_slug) {
      await setSlugForSession(appointment.business_slug);
    }
    
    // Update appointment status to canceled
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ status: 'canceled' })
      .eq('id', id);
      
    if (updateError) {
      console.error("Error updating appointment:", updateError);
      throw new Error('Erro ao cancelar o agendamento');
    }
    
    console.log("Appointment canceled successfully");
    return true;
  } catch (error) {
    console.error('Error canceling appointment:', error);
    throw error;
  }
};
