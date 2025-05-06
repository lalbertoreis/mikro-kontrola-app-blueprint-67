
import { supabase } from "@/integrations/supabase/client";
import { BookingAppointment } from "@/components/booking/MyAppointmentsDialog";
import { format } from "date-fns";
import { getBusinessUserId, setSlugForSession } from "./businessUtils";

// Fetch user appointments by phone number
export const fetchUserAppointmentsByPhone = async (phone: string, businessSlug?: string): Promise<BookingAppointment[]> => {
  try {
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
    }
    
    if (!businessId && businessSlug) {
      console.error('Business ID not found for slug:', businessSlug);
      return [];
    }
    
    // First get the client id by phone
    let query = supabase
      .from('clients')
      .select('id')
      .eq('phone', phone);
      
    // Adicionar filtro por negócio se tivermos o ID
    if (businessId) {
      query = query.eq('user_id', businessId);
    }
    
    const { data: client, error: clientError } = await query.maybeSingle();
    
    if (clientError || !client) return [];
    
    // Then fetch appointments
    let appointmentsQuery = supabase
      .from('appointments')
      .select(`
        id, 
        start_time,
        status,
        employees(name),
        services(name)
      `)
      .eq('client_id', client.id)
      .neq('status', 'canceled')
      .order('start_time', { ascending: true });
      
    // Filtrar por negócio se tivermos o ID
    if (businessId) {
      appointmentsQuery = appointmentsQuery.eq('user_id', businessId);
    }
    
    const { data: appointmentsData, error: appointmentsError } = await appointmentsQuery;
    
    if (appointmentsError) throw appointmentsError;
    
    // Transform data for UI with proper date handling
    return appointmentsData.map(app => ({
      id: app.id,
      serviceName: app.services?.name || 'Serviço',
      employeeName: app.employees?.name || 'Profissional',
      date: format(new Date(app.start_time), 'dd/MM/yyyy'),
      time: format(new Date(app.start_time), 'HH:mm'),
      status: app.status
    }));
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
};

// Cancel an appointment by ID
export const cancelAppointment = async (id: string, businessSlug?: string): Promise<boolean> => {
  try {
    // Se temos um slug, vamos definir o contexto da sessão
    if (businessSlug) {
      await setSlugForSession(businessSlug);
    }
    
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'canceled' })
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error canceling appointment:', error);
    throw error;
  }
};
