
import { supabase } from "@/integrations/supabase/client";
import { Service } from "@/types/service";
import { Employee } from "@/types/employee";
import { BookingAppointment } from "@/components/booking/MyAppointmentsDialog";
import { format } from "date-fns";
import { getBusinessUserId, setSlugForSession } from "./businessUtils";
import { formatAppointmentDate } from "./dateFormatters";

// Process booking data and create appointment in the database
export const processBooking = async (bookingData: {
  service: Service;
  employee: Employee;
  date: Date;
  time: string;
  clientInfo: { name: string; phone: string };
  businessSlug?: string;
  businessUserId?: string;
}) => {
  const { service, employee, date, time, clientInfo, businessSlug, businessUserId } = bookingData;
  
  try {
    // Obter o user_id do negócio pelo slug ou usar o que foi passado
    let businessId = businessUserId;
    if (!businessId && businessSlug) {
      // Definir o slug para a sessão
      await setSlugForSession(businessSlug);
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
