
import { supabase } from "@/integrations/supabase/client";
import { format, addMinutes } from 'date-fns';
import { BookingAppointment } from "@/components/booking/MyAppointmentsDialog";
import { setSlugForSession } from "./businessUtils";
import { createClientSecure, checkClientExists } from "./clientCreation";
import { checkAppointmentConflicts, validateBusinessHours } from "./appointmentConflictChecker";

/**
 * Process a booking with client information and conflict validation
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
    console.log("Starting booking process:", {
      service: service.name,
      employee: employee.name,
      date: format(date, 'yyyy-MM-dd'),
      time,
      clientPhone: clientInfo.phone,
      businessSlug
    });

    // Set slug context for Supabase session if provided
    if (businessSlug) {
      await setSlugForSession(businessSlug);
    }

    // Create appointment time as ISO string
    const formattedDate = format(date, 'yyyy-MM-dd');
    const startTime = `${formattedDate}T${time}:00`;
    const startDateTime = new Date(startTime);
    
    // Calculate end time based on service duration
    const duration = service.duration || 60;
    const endDateTime = addMinutes(startDateTime, duration);

    // Validate business hours
    const businessHoursValidation = await validateBusinessHours({
      employeeId: employee.id,
      startTime: startDateTime,
      businessSlug
    });

    if (!businessHoursValidation.isValid) {
      throw new Error(businessHoursValidation.error || 'Horário fora do funcionamento');
    }

    // Check for appointment conflicts
    const conflictCheck = await checkAppointmentConflicts({
      employeeId: employee.id,
      startTime: startDateTime,
      duration,
      businessSlug
    });

    if (conflictCheck.hasConflict) {
      console.error("Appointment conflict detected:", conflictCheck.conflictingAppointments);
      throw new Error('Este horário já está ocupado. Por favor, escolha outro horário.');
    }

    // Handle client creation/verification - prioritize user_id over phone validation
    let clientId: string;
    let existingClient: any;
    let newClient = false;
    
    const cleanPhone = clientInfo.phone.replace(/\D/g, '');

    // First, try to find client by user_id if available (from logged in user)
    if (businessUserId) {
      const { data: userClients, error: userClientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', businessUserId)
        .limit(1);

      if (!userClientsError && userClients && userClients.length > 0) {
        // Use existing client associated with this user
        clientId = userClients[0].id;
        existingClient = userClients[0];
        console.log('Using existing client by user_id:', clientId);
      } else {
        // Try to find by phone with more flexible validation
        try {
          const clientCheck = await checkClientExists(cleanPhone);
          
          if (clientCheck.exists && clientCheck.client) {
            // Use existing client
            clientId = clientCheck.client.id;
            existingClient = clientCheck.client;
            
            console.log('Using existing client by phone:', clientId);
            
            // Update client's pin if provided and doesn't exist already
            if (clientInfo.pin && !clientCheck.client.has_pin) {
              const { error: updateError } = await supabase
                .rpc('update_client_pin', {
                  phone_param: cleanPhone,
                  pin_param: clientInfo.pin
                });
                
              if (updateError) {
                console.error('Error updating client PIN:', updateError);
              }
            }
          } else {
            // Create new client without strict phone validation for existing bookings
            console.log('Creating new client for phone:', cleanPhone);
            
            const createResult = await createClientSecure({
              name: clientInfo.name,
              phone: cleanPhone,
              pin: clientInfo.pin,
              businessUserId
            });
            
            if (!createResult.success) {
              // If phone validation fails, try creating with a default phone format
              if (createResult.error?.includes('telefone')) {
                const fallbackPhone = cleanPhone.length === 10 ? `0${cleanPhone}` : cleanPhone;
                
                const fallbackResult = await createClientSecure({
                  name: clientInfo.name,
                  phone: fallbackPhone,
                  pin: clientInfo.pin,
                  businessUserId
                });
                
                if (!fallbackResult.success) {
                  throw new Error('Erro ao criar cliente. Verifique os dados informados.');
                }
                
                clientId = fallbackResult.clientId!;
              } else {
                throw new Error(createResult.error || 'Erro ao criar cliente');
              }
            } else {
              clientId = createResult.clientId!;
            }
            
            newClient = true;
            
            // Get the created client data
            const { data: createdClientData } = await supabase
              .rpc('find_clients_by_phone', { phone_param: cleanPhone });
            existingClient = createdClientData?.find(c => c.id === clientId);
          }
        } catch (phoneError) {
          console.error('Phone validation error, trying alternative approach:', phoneError);
          
          // Fallback: Create client with minimal validation
          try {
            const { data: newClientData, error: insertError } = await supabase
              .from('clients')
              .insert({
                name: clientInfo.name,
                phone: cleanPhone,
                user_id: businessUserId
              })
              .select()
              .single();
            
            if (insertError) {
              throw new Error('Erro ao criar cliente');
            }
            
            clientId = newClientData.id;
            existingClient = newClientData;
            newClient = true;
            
            console.log('Client created with fallback method:', clientId);
          } catch (fallbackError) {
            console.error('Fallback client creation failed:', fallbackError);
            throw new Error('Erro ao processar dados do cliente');
          }
        }
      }
    } else {
      throw new Error('Erro de autenticação');
    }
    
    // Create appointment directly in the appointments table
    // For packages, extract the UUID from the "package:uuid" format
    const serviceId = service.id.startsWith('package:') ? service.id.replace('package:', '') : service.id;
    
    const appointmentData = {
      service_id: serviceId,
      employee_id: employee.id,
      client_id: clientId,
      status: 'scheduled',
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      user_id: businessUserId
    };
    
    console.log('Creating appointment with data:', appointmentData);
    
    const { data: newAppointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert(appointmentData)
      .select()
      .single();
    
    if (appointmentError) {
      console.error('Error creating appointment:', appointmentError);
      throw new Error(`Erro ao criar agendamento: ${appointmentError.message}`);
    }
    
    console.log('Appointment created successfully:', newAppointment);
    
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
