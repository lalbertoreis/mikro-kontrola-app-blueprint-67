
import { supabase } from "@/integrations/supabase/client";
import { format, addMinutes } from 'date-fns';
import { BookingAppointment } from "@/components/booking/MyAppointmentsDialog";
import { setSlugForSession } from "./businessUtils";

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
      await setSlugForSession(businessSlug);
    }

    // Look for existing client with this phone number, scoped to this business
    const { data: localClient, error: localClientError } = await supabase
      .from('clients')
      .select('*')
      .eq('phone', clientInfo.phone)
      .eq('user_id', businessUserId || (await supabase.auth.getUser()).data.user?.id)
      .maybeSingle();
    
    // If no local client found, look for this client in ANY business
    if (!localClient) {
      const { data: anyClient, error: anyClientError } = await supabase
        .from('clients')
        .select('*')
        .eq('phone', clientInfo.phone)
        .maybeSingle();
      
      // If client exists in another business, clone it for this business
      if (anyClient) {
        console.log('Client found in another business, cloning for this business');
        
        let insertPayload: any = {
          name: anyClient.name,
          phone: anyClient.phone,
          email: anyClient.email,
          cep: anyClient.cep,
          address: anyClient.address,
          notes: anyClient.notes,
          user_id: businessUserId || (await supabase.auth.getUser()).data.user?.id
        };
        
        // Add hashed pin if provided in client info or from original client
        if (clientInfo.pin) {
          const { default: bcrypt } = await import('bcryptjs-react');
          const saltRounds = 10;
          insertPayload.pin = await bcrypt.hash(clientInfo.pin, saltRounds);
        } else if (anyClient.pin) {
          // Transfer the existing pin to the new client record
          insertPayload.pin = anyClient.pin;
        }
        
        const { data: newClientData, error: insertError } = await supabase
          .from('clients')
          .insert(insertPayload)
          .select()
          .single();
        
        if (insertError) {
          console.error('Error cloning client:', insertError);
          throw new Error('Erro ao criar novo cliente');
        }
        
        clientId = newClientData.id;
        existingClient = newClientData;
        newClient = true;
      } else {
        // Create completely new client
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
      }
    } else {
      // Use existing client (local to this business)
      clientId = localClient.id;
      existingClient = localClient;
      
      // Update client's pin if provided and doesn't exist already
      if (clientInfo.pin && !localClient.pin) {
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
    
    // Return information about the booking
    return {
      success: true,
      newClient,
      clientId,
      appointmentId: newAppointment.id,
      newAppointment: {
        id: newAppointment.id,
        serviceName: service.name,
        employeeName: employee.name,
        date: formattedDate,
        time: time,
        status: 'scheduled',
        businessSlug: businessSlug
      } as BookingAppointment
    };
    
  } catch (error) {
    console.error('Error in processBooking:', error);
    throw error;
  }
}
