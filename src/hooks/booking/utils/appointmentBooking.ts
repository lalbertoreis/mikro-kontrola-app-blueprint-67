import { supabase } from "@/integrations/supabase/client";
import { format, addMinutes } from 'date-fns';

/**
 * Fetches user appointments by phone number
 */
export async function fetchUserAppointmentsByPhone(phone: string): Promise<any[]> {
  try {
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        id,
        start_time,
        status,
        services (name, price),
        clients (name, phone),
        employees (name)
      `)
      .like('clients.phone', phone);

    if (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }

    // Format the appointments to match the structure expected by the component
    const formattedAppointments = appointments?.map(appointment => ({
      id: appointment.id,
      service: {
        name: appointment.services?.name || 'Serviço não encontrado',
        price: appointment.services?.price || 0
      },
      client: {
        name: appointment.clients?.name || 'Cliente não encontrado',
        phone: appointment.clients?.phone || ''
      },
      employee: {
        name: appointment.employees?.name || 'Profissional não encontrado'
      },
      date: format(new Date(appointment.start_time), 'yyyy-MM-dd'),
      time: format(new Date(appointment.start_time), 'HH:mm'),
      status: appointment.status,
      createdAt: new Date().toISOString()
    })) || [];

    return formattedAppointments;
  } catch (error) {
    console.error('Error fetching user appointments:', error);
    return [];
  }
}

/**
 * Cancel an appointment by ID
 */
export async function cancelAppointment(appointmentId: string, slug?: string): Promise<boolean> {
  try {
    // Set slug context for Supabase session if provided
    if (slug) {
      const { setSlugContext } = await import("@/services/appointment/availableTimeSlots");
      await setSlugContext(slug);
    }

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
    
    // Using optional chaining and nullish coalescing for safer access
    if (profileData && typeof profileData === 'object') {
      // Type assertion to avoid TypeScript error
      const profile = profileData as { booking_cancel_min_hours?: number | null };
      cancelMinHours = profile.booking_cancel_min_hours ?? 1;
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

/**
 * Process a booking with client information
 */
export async function processBooking({
  service,
  employee,
  date,
  time,
  clientInfo,
  businessSlug,
  businessUserId,
  bookingSettings
}: {
  service: any;
  employee: any;
  date: Date;
  time: string;
  clientInfo: { name: string; phone: string; pin?: string };
  businessSlug?: string;
  businessUserId: string | null;
  bookingSettings?: any;
}) {
  try {
    // Check if client exists
    let clientId: string;
    let existingClient: any;
    let newClient = false;
    
    // Set slug context for Supabase session if provided
    if (businessSlug) {
      const { setSlugContext } = await import("@/services/appointment/availableTimeSlots");
      await setSlugContext(businessSlug);
    }
    
    // Look for existing client with this phone number
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('phone', clientInfo.phone)
      .maybeSingle();
    
    // If client not found, create new client
    if (clientError || !client) {
      // Create new client
      let insertPayload: any = {
        name: clientInfo.name,
        phone: clientInfo.phone,
        user_id: businessUserId || (await supabase.auth.getUser()).data.user?.id
      };
      
      // Add hashed pin if provided
      if (clientInfo.pin) {
        const { default: bcrypt } = await import('bcryptjs-react');
        const saltRounds = 10;
        insertPayload.pin = await bcrypt.hash(clientInfo.pin, saltRounds);
      }
      
      const { data: newClientData, error: insertError } = await supabase
        .from('clients')
        .insert(insertPayload)
        .select()
        .single();
      
      if (insertError) {
        console.error('Error creating new client:', insertError);
        throw new Error('Erro ao criar novo cliente');
      }
      
      clientId = newClientData.id;
      existingClient = newClientData;
      newClient = true;
    } else {
      // Use existing client
      clientId = client.id;
      existingClient = client;
      
      // Update client's pin if provided and doesn't exist already
      if (clientInfo.pin && !client.pin) {
        const { default: bcrypt } = await import('bcryptjs-react');
        const saltRounds = 10;
        const hashedPin = await bcrypt.hash(clientInfo.pin, saltRounds);
        
        const { error: updateError } = await supabase
          .from('clients')
          .update({ pin: hashedPin })
          .eq('id', clientId);
          
        if (updateError) {
          console.error('Error updating client PIN:', updateError);
        }
      }
    }
    
    // Create appointment time as ISO string
    const formattedDate = format(date, 'yyyy-MM-dd');
    const startTime = `${formattedDate}T${time}:00`;
    const startDateTime = new Date(startTime);
    
    // Calculate end time based on service duration
    const duration = service.duration || 60; // Default to 60 minutes if duration not provided
    const endDateTime = addMinutes(startDateTime, duration);
    
    // Create appointment
    const appointmentData = {
      service_id: service.id,
      employee_id: employee.id,
      client_id: clientId,
      status: 'scheduled',
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      user_id: businessUserId || (await supabase.auth.getUser()).data.user?.id
    };
    
    const { data: newAppointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert(appointmentData)
      .select()
      .single();
    
    if (appointmentError) {
      console.error('Error creating appointment:', appointmentError);
      throw new Error('Erro ao criar agendamento');
    }
    
    console.log('Appointment created:', newAppointment);
    
    // Format appointment for the client-side display
    // This matches the structure expected by the MyAppointments component
    const formattedAppointment = {
      id: newAppointment.id,
      service: {
        name: service.name,
        price: service.price
      },
      client: {
        name: existingClient.name,
        phone: existingClient.phone
      },
      employee: {
        name: employee.name
      },
      date: formattedDate,
      time: time,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };
    
    // Return information about the booking
    return {
      success: true,
      newClient,
      clientId,
      appointmentId: newAppointment.id,
      newAppointment: formattedAppointment
    };
    
  } catch (error) {
    console.error('Error in processBooking:', error);
    throw error;
  }
}
