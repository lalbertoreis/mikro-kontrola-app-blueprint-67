
import { Service, ServicePackage } from "@/types/service";
import { toast } from "sonner";
import { useBookingAuth } from "./useBookingAuth";
import { processBooking, cancelAppointment } from "./utils";
import { BookingAppointment } from "@/components/booking/MyAppointmentsDialog";

/**
 * Hook for booking-related handlers
 */
export function useBookingHandlers(
  slug: string | undefined,
  businessUserId: string | null,
  setBookingDialogOpen: (isOpen: boolean) => void,
  setBookingConfirmed: (isConfirmed: boolean) => void,
  setConfirmationDate: (date: Date | null) => void,
  setConfirmationTime: (time: string | null) => void
) {
  const { isLoggedIn, userProfile, appointments, setAppointments, handleLogin } = useBookingAuth();
  
  const handleServiceClick = (service: Service) => {
    // Verificar explicitamente se hasEmployees é true
    if (service.hasEmployees !== true) {
      toast.info("Este serviço não tem profissionais disponíveis no momento.");
      return;
    }
    
    setBookingDialogOpen(true);
  };

  const handlePackageClick = (pkg: ServicePackage) => {
    // For demo purposes, just show a toast
    toast.info("Funcionalidade de agendamento de pacotes em breve!");
  };

  const handleBookingConfirm = async (bookingData: any) => {
    console.log("Booking data:", bookingData);
    
    // Store date and time for confirmation screen
    setConfirmationDate(bookingData.date);
    setConfirmationTime(bookingData.time);
    
    // The flow has changed - now we always receive client info directly in bookingData
    if (bookingData.clientInfo) {
      // Use the client info provided in the booking form
      const userData = {
        name: bookingData.clientInfo.name,
        phone: bookingData.clientInfo.phone
      };
      
      // Store user info and set logged in
      handleLogin(userData);
      
      try {
        // Process the booking in the database
        const result = await processBooking({
          ...bookingData,
          businessSlug: slug,
          businessUserId: businessUserId,
          bookingSettings: bookingData.bookingSettings
        });
        
        if (result) {
          // Add to local appointments list
          // Convert the formatted appointment to match BookingAppointment type
          const newAppointment: BookingAppointment = {
            id: result.newAppointment.id,
            serviceName: result.newAppointment.service.name,
            employeeName: result.newAppointment.employee.name,
            date: result.newAppointment.date,
            time: result.newAppointment.time,
            status: result.newAppointment.status as any,
            createdAt: result.newAppointment.createdAt
          };
          
          setAppointments((prev) => [...prev, newAppointment]);
          
          // Close booking dialog and show confirmation
          setBookingDialogOpen(false);
          setBookingConfirmed(true);
        }
      } catch (error) {
        console.error("Error processing booking:", error);
        toast.error("Erro ao realizar agendamento. Tente novamente.");
      }
    } else {
      // This case shouldn't happen anymore with the new flow but keeping as fallback
      toast.error("Informações de cliente não fornecidas");
    }
  };

  const handleCancelAppointment = async (id: string) => {
    try {
      await cancelAppointment(id, slug);
      setAppointments((prev) => prev.filter((app) => app.id !== id));
      toast.success("Agendamento cancelado com sucesso!");
    } catch (error) {
      console.error('Error canceling appointment:', error);
      toast.error("Erro ao cancelar agendamento");
    }
  };
  
  return {
    isLoggedIn,
    userProfile,
    appointments,
    handleServiceClick,
    handlePackageClick,
    handleBookingConfirm,
    handleCancelAppointment
  };
}
