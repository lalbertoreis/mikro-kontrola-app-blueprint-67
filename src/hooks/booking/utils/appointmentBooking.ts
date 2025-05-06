
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
  bookingSettings?: {
    simultaneousLimit: number;
    futureLimit: number;
    cancelMinHours: number;
  };
}) => {
  const { service, employee, date, time, clientInfo, businessSlug, businessUserId, bookingSettings } = bookingData;
  
  try {
    // Obter o user_id do negócio pelo slug ou usar o que foi passado
    let businessId = businessUserId;
    if (!businessId && businessSlug) {
      // Definir o slug para a sessão
      console.log("Setting session slug before booking:", businessSlug);
      await setSlugForSession(businessSlug);
      businessId = await getBusinessUserId(businessSlug);
    }
    
    if (!businessId) {
      console.error("No business ID found for booking!");
      throw new Error("Não foi possível identificar o negócio para este agendamento");
    }
    
    console.log("Using business ID for booking:", businessId);
    
    // Ensure session slug is set again right before database operations
    if (businessSlug) {
      await setSlugForSession(businessSlug);
    }
    
    // Verificar a quantidade de agendamentos simultâneos
    const simultaneousLimit = bookingSettings?.simultaneousLimit || 3;
    const dateStr = format(date, 'yyyy-MM-dd');
    const [hours, minutes] = time.split(':').map(Number);
    
    // Criar start e end time
    const startDate = new Date(`${dateStr}T${time}:00`);
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + service.duration);
    
    // Verificar quantos agendamentos já existem nesse horário
    const { data: existingAppointments, error: appointmentCountError } = await supabase
      .from('appointments_view')
      .select('appointment_id')
      .eq('business_slug', businessSlug)
      .eq('employee_id', employee.id)
      .gte('start_time', startDate.toISOString())
      .lt('start_time', endDate.toISOString())
      .neq('status', 'canceled');
      
    if (appointmentCountError) {
      console.error("Error checking existing appointments:", appointmentCountError);
      throw appointmentCountError;
    }
    
    if (existingAppointments && existingAppointments.length >= simultaneousLimit) {
      throw new Error(`Limite de agendamentos atingido para este horário (máximo: ${simultaneousLimit})`);
    }
    
    // Check if client exists or create new client
    let clientId;
    
    console.log("Checking for existing client with phone:", clientInfo.phone);
    const { data: existingClient, error: clientFetchError } = await supabase
      .from('clients')
      .select('id')
      .eq('phone', clientInfo.phone)
      .eq('user_id', businessId) // Filtrar por user_id do negócio
      .maybeSingle();
    
    if (clientFetchError) {
      console.error("Error checking for existing client:", clientFetchError);
      throw clientFetchError;
    }
    
    if (existingClient) {
      console.log("Found existing client:", existingClient.id);
      clientId = existingClient.id;
    } else {
      // Create new client com o user_id do negócio
      console.log("Creating new client for business:", businessId);
      const { data: newClient, error: createClientError } = await supabase
        .from('clients')
        .insert({
          name: clientInfo.name,
          phone: clientInfo.phone,
          user_id: businessId // Usar o ID do negócio
        })
        .select('id')
        .single();
      
      if (createClientError) {
        console.error("Error creating new client:", createClientError);
        throw createClientError;
      }
      console.log("Created new client:", newClient.id);
      clientId = newClient.id;
    }
    
    console.log("Creating appointment with data:", {
      employee_id: employee.id,
      service_id: service.id,
      client_id: clientId,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      user_id: businessId
    });
    
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
    
    if (appointmentError) {
      console.error("Error creating appointment:", appointmentError);
      throw appointmentError;
    }
    
    console.log("Appointment created successfully:", appointment.id);
    
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
