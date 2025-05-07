
import React from "react";
import { Service } from "@/types/service";
import { Employee } from "@/types/employee";
import { BusinessSettings } from "@/types/settings";
import { ClientAppointment } from "@/types/calendar";
import { BookingDialog } from "@/components/booking/BookingDialog";
import { LoginDialog } from "@/components/booking/LoginDialog";
import { MyAppointmentsDialog } from "@/components/booking/MyAppointmentsDialog";

interface BookingDialogsProps {
  selectedService: Service | null;
  isBookingDialogOpen: boolean;
  isLoginDialogOpen: boolean;
  isMyAppointmentsDialogOpen: boolean;
  employees: Employee[];
  businessProfile: BusinessSettings | null;
  appointments: ClientAppointment[];
  isLoadingAppointments?: boolean;
  onCloseBookingDialog: () => void;
  onCloseLoginDialog: () => void;
  onCloseAppointmentsDialog: () => void;
  onBookingConfirm: (employeeId: string, date: Date, time: string) => void;
  onLogin: (email: string, password: string) => void;
  onCancelAppointment: (appointmentId: string) => Promise<void>;
  bookingSettings: {
    minDaysInAdvance: number;
    maxDaysInFuture: number;
    simultaneousLimit: number;
    timeInterval: number;
    cancelHoursLimit: number;
  };
  businessSlug?: string;
}

const BookingDialogs: React.FC<BookingDialogsProps> = ({
  selectedService,
  isBookingDialogOpen,
  isLoginDialogOpen,
  isMyAppointmentsDialogOpen,
  employees,
  businessProfile,
  appointments,
  isLoadingAppointments = false,
  onCloseBookingDialog,
  onCloseLoginDialog,
  onCloseAppointmentsDialog,
  onBookingConfirm,
  onLogin,
  onCancelAppointment,
  bookingSettings,
  businessSlug,
}) => {
  // Recuperar a cor configurada
  const bookingColor = businessProfile?.bookingColor || "#9b87f5";

  return (
    <>
      {/* Diálogo de agendamento */}
      <BookingDialog
        service={selectedService}
        isOpen={isBookingDialogOpen}
        onClose={onCloseBookingDialog}
        employees={employees}
        onBookingConfirm={onBookingConfirm}
        themeColor={bookingColor}
        businessSlug={businessSlug}
      />

      {/* Diálogo de login */}
      <LoginDialog
        isOpen={isLoginDialogOpen}
        onClose={onCloseLoginDialog}
        onLogin={onLogin}
        themeColor={bookingColor}
      />

      {/* Diálogo de meus agendamentos */}
      <MyAppointmentsDialog
        isOpen={isMyAppointmentsDialogOpen}
        onClose={onCloseAppointmentsDialog}
        appointments={appointments}
        isLoading={isLoadingAppointments}
        onCancelAppointment={onCancelAppointment}
        cancelHoursLimit={bookingSettings.cancelHoursLimit}
        themeColor={bookingColor}
      />
    </>
  );
};

export default BookingDialogs;
