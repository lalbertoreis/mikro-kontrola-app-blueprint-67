
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

    const cleanPhone = clientInfo.phone.replace(/\D/g, '');

    // Use the secure RPC function to check if client exists in this business
    const { data: localClientData, error: localClientError } = await supabase
      .rpc('check_client_by_phone', { phone_param: cleanPhone });
    
    if (localClientError) {
      console.error('Error checking local client:', localClientError);
    }

    const localClient = localClientData && localClientData.length > 0 ? localClientData[0] : null;
    
    // If no local client found, look for this client in ANY business
    if (!localClient) {
      const { data: anyClientData, error: anyClientError } = await supabase
        .rpc('find_clients_by_phone', { phone_param: cleanPhone });
      
      if (anyClientError) {
        console.error('Error finding clients:', anyClientError);
      }

      const anyClient = anyClientData && anyClientData.length > 0 ? anyClientData[0] : null;
      
      // If client exists in another business, create it for this business using RPC
      if (anyClient) {
        console.log('Client found in another business, creating for this business');
        
        const { data: newClientData, error: createError } = await supabase
          .rpc('create_client_for_auth', {
            name_param: anyClient.name,
            phone_param: cleanPhone,
            pin_param: clientInfo.pin || null,
            business_user_id_param: businessUserId
          });
        
        if (createError || !newClientData || newClientData.length === 0) {
          console.error('Error creating client:', createError);
          throw new Error('Erro ao criar cliente');
        }
        
        clientId = newClientData[0].id;
        newClient = true;
        
        // Get the created client data
        const { data: createdClientData } = await supabase
          .rpc('find_clients_by_phone', { phone_param: cleanPhone });
        existingClient = createdClientData?.find(c => c.id === clientId);
      } else {
        // Create completely new client using RPC function
        const { data: newClientData, error: createError } = await supabase
          .rpc('create_client_for_auth', {
            name_param: clientInfo.name,
            phone_param: cleanPhone,
            pin_param: clientInfo.pin || null,
            business_user_id_param: businessUserId
          });
        
        if (createError || !newClientData || newClientData.length === 0) {
          console.error('Error creating new client:', createError);
          throw new Error('Erro ao criar novo cliente');
        }
        
        clientId = newClientData[0].id;
        newClient = true;
        
        // Get the created client data
        const { data: createdClientData } = await supabase
          .rpc('find_clients_by_phone', { phone_param: cleanPhone });
        existingClient = createdClientData?.find(c => c.id === clientId);
      }
    } else {
      // Use existing client (local to this business)
      clientId = localClient.id;
      existingClient = localClient;
      
      // Update client's pin if provided and doesn't exist already
      if (clientInfo.pin && !localClient.has_pin) {
        const { error: updateError } = await supabase
          .rpc('update_client_pin', {
            phone_param: cleanPhone,
            pin_param: clientInfo.pin
          });
          
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
    
    // Create appointment directly in the appointments table
    const appointmentData = {
      service_id: service.id,
      employee_id: employee.id,
      client_id: clientId,
      status: 'scheduled',
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      user_id: businessUserId
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
