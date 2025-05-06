
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

// Process booking data and create appointment in the database
export const processBooking = async (bookingData: {
  service: Service;
  employee: Employee;
  date: Date;
  time: string;
  clientInfo: { name: string; phone: string };
}) => {
  const { service, employee, date, time, clientInfo } = bookingData;
  
  try {
    // Check if client exists or create new client
    let clientId;
    const { data: existingClient, error: clientFetchError } = await supabase
      .from('clients')
      .select('id')
      .eq('phone', clientInfo.phone)
      .maybeSingle();
    
    if (clientFetchError) throw clientFetchError;
    
    if (existingClient) {
      clientId = existingClient.id;
    } else {
      // Create new client - agora funciona para usuários anônimos
      const { data: newClient, error: createClientError } = await supabase
        .from('clients')
        .insert({
          name: clientInfo.name,
          phone: clientInfo.phone,
          // Os usuários anônimos não têm user_id, então definimos como nulo
          user_id: null
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
    
    // Create appointment - agora funciona para usuários anônimos
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        employee_id: employee.id,
        service_id: service.id,
        client_id: clientId,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        status: 'scheduled',
        // Os usuários anônimos não têm user_id, então definimos como nulo
        user_id: null
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
export const fetchUserAppointmentsByPhone = async (phone: string): Promise<BookingAppointment[]> => {
  try {
    // First get the client id by phone
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('phone', phone)
      .maybeSingle();
    
    if (clientError || !client) return [];
    
    // Then fetch appointments
    const { data: appointmentsData, error: appointmentsError } = await supabase
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
export const cancelAppointment = async (id: string): Promise<boolean> => {
  try {
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
