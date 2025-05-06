
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Service } from "@/types/service";
import { Employee } from "@/types/employee";
import { BookingAppointment } from "@/components/booking/MyAppointmentsDialog";

// Helper function to format dates consistently
export const formatAppointmentDate = (date: Date): string => {
  return format(date, 'dd/MM/yyyy');
};

// Função auxiliar para obter o user_id do negócio pelo slug
const getBusinessUserId = async (slug: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('slug', slug)
      .single();
    
    if (error || !data) {
      console.error("Error fetching business user id:", error);
      return null;
    }
    
    return data.id;
  } catch (error) {
    console.error("Error in getBusinessUserId:", error);
    return null;
  }
};

// Process booking data and create appointment in the database
export const processBooking = async (bookingData: {
  service: Service;
  employee: Employee;
  date: Date;
  time: string;
  clientInfo: { name: string; phone: string };
  businessSlug?: string; // Adicionado campo para identificar o negócio
  businessUserId?: string; // Adicionado field para ID do negócio
}) => {
  const { service, employee, date, time, clientInfo, businessSlug, businessUserId } = bookingData;
  
  try {
    // Obter o user_id do negócio pelo slug ou usar o que foi passado
    let businessId = businessUserId;
    if (!businessId && businessSlug) {
      // Definir o slug para a sessão
      await supabase.rpc('set_slug_for_session', { slug: businessSlug });
      businessId = await getBusinessUserId(businessSlug);
    }
    
    if (!businessId) {
      throw new Error("Não foi possível identificar o negócio para este agendamento");
    }
    
    console.log("Using business ID for booking:", businessId);
    
    // Check if client exists or create new client
    let clientId;
    const { data: existingClient, error: clientFetchError } = await supabase
      .from('clients')
      .select('id')
      .eq('phone', clientInfo.phone)
      .eq('user_id', businessId) // Filtrar por user_id do negócio
      .maybeSingle();
    
    if (clientFetchError) throw clientFetchError;
    
    if (existingClient) {
      clientId = existingClient.id;
    } else {
      // Create new client com o user_id do negócio
      const { data: newClient, error: createClientError } = await supabase
        .from('clients')
        .insert({
          name: clientInfo.name,
          phone: clientInfo.phone,
          user_id: businessId // Usar o ID do negócio
        })
        .select('id')
        .single();
      
      if (createClientError) throw createClientError;
      clientId = newClient.id;
    }
    
    // Format date string correctly to avoid timezone issues
    const dateStr = format(date, 'yyyy-MM-dd');
    const [hours, minutes] = time.split(':').map(Number);
    
    // Create start and end date objects with the correct date and time
    const startDate = new Date(`${dateStr}T${time}:00`);
    // Ensure we're using local time by setting hours/minutes directly
    startDate.setHours(hours, minutes, 0, 0);
    
    // Calculate end time based on service duration
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + service.duration);
    
    // Create appointment com o user_id do negócio
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        employee_id: employee.id,
        service_id: service.id,
        client_id: clientId,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        status: 'scheduled',
        user_id: businessId // Usar o ID do negócio
      })
      .select()
      .single();
    
    if (appointmentError) throw appointmentError;
    
    // Create a BookingAppointment object from the appointment
    const newAppointment: BookingAppointment = {
      id: appointment.id,
      serviceName: service.name,
      employeeName: employee.name,
      date: formatAppointmentDate(date),
      time,
      status: 'scheduled'
    };
    
    // Play sound notification (if exists)
    try {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {
        console.log('Sound notification not available');
      });
    } catch (e) {
      console.log('Sound notification error:', e);
    }
    
    return { appointment, newAppointment };
  } catch (error) {
    console.error('Error processing booking:', error);
    throw error;
  }
};

// Fetch user appointments by phone number
export const fetchUserAppointmentsByPhone = async (phone: string, businessSlug?: string): Promise<BookingAppointment[]> => {
  try {
    // Se temos um slug, vamos definir o contexto da sessão
    if (businessSlug) {
      await supabase.rpc('set_slug_for_session', { slug: businessSlug });
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
      await supabase.rpc('set_slug_for_session', { slug: businessSlug });
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
