
import { useState } from "react";
import { format } from 'date-fns';
import { toast } from "sonner";
import { Service } from "@/types/service";
import { BookingAppointment } from "@/components/booking/MyAppointmentsDialog";
import { processBooking } from "./utils/appointmentBooking";
import { cancelAppointment } from "./utils/appointmentManagement";
import { setSlugForSession } from "./utils/businessUtils";
import { SetStateAction } from "react";

/**
 * Hook to handle booking flow actions
 */
export function useBookingHandlers(
  businessSlug: string | undefined,
  businessUserId: string | null,
  setIsBookingDialogOpen: (open: boolean) => void,
  setBookingConfirmed: (confirmed: boolean) => void,
  setConfirmationDate: (date: Date) => void,
  setConfirmationTime: (time: string) => void,
  setAppointments: (appointments: SetStateAction<BookingAppointment[]>) => void
) {
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle click on a service
  const handleServiceClick = (service: Service) => {
    if (!service.hasEmployees) {
      toast.error("Este serviço não tem profissionais disponíveis");
      return;
    }
    setIsBookingDialogOpen(true);
  };

  // Handle click on a package
  const handlePackageClick = (pkg: any) => {
    toast.info("Agendamento de pacotes em breve!");
  };

  // Handle booking confirmation
  const handleBookingConfirm = async ({ service, employee, date, time, clientInfo }: {
    service: any;
    employee: any;
    date: Date;
    time: string;
    clientInfo: { name: string; phone: string; pin?: string };
  }) => {
    console.log("useBookingHandlers - handleBookingConfirm called:", {
      serviceName: service.name,
      employeeName: employee.name,
      date: date.toISOString(),
      time,
      clientName: clientInfo.name
    });

    setIsProcessing(true);
    try {
      // Set the slug for the current session - important for RLS policies
      if (businessSlug) {
        await setSlugForSession(businessSlug);
      }
      
      const result = await processBooking({ 
        service, 
        employee, 
        date, 
        time, 
        clientInfo,
        businessSlug,
        businessUserId
      });

      console.log("Booking processed successfully:", result);

      // Update the appointments list with the new appointment
      if (result.success) {
        setAppointments(prev => [...prev, result.newAppointment]);
        toast.success("Agendamento realizado com sucesso!");
      }

      // Close dialog and show confirmation
      setIsBookingDialogOpen(false);
      setConfirmationDate(date);
      setConfirmationTime(time);
      setBookingConfirmed(true);

    } catch (error: any) {
      console.error("Error in booking confirmation:", error);
      toast.error(error.message || "Erro ao confirmar agendamento");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle appointment cancellation
  const handleCancelAppointment = async (appointmentId: string, appointmentBusinessSlug?: string) => {
    try {
      // Use the appointment's business slug if provided, otherwise use the current business slug
      const slugToUse = appointmentBusinessSlug || businessSlug;
      
      await cancelAppointment(appointmentId, slugToUse);
      
      toast.success("Agendamento cancelado com sucesso");
      
      // Update appointments list
      setAppointments(prev => prev.filter(app => app.id !== appointmentId));
      
    } catch (error: any) {
      console.error("Error cancelling appointment:", error);
      toast.error(error.message || "Erro ao cancelar agendamento");
    }
  };

  return {
    handleServiceClick,
    handlePackageClick,
    handleBookingConfirm,
    handleCancelAppointment,
    isProcessing
  };
}
