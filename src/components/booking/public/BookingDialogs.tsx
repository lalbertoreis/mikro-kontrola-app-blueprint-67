
import React from "react";
import BookingDialog from "@/components/booking/BookingDialog";
import LoginDialog from "@/components/booking/LoginDialog";
import MyAppointmentsDialog from "@/components/booking/MyAppointmentsDialog";
import { Service } from "@/types/service";
import { Employee } from "@/types/employee";
import { BusinessSettings } from "@/types/settings";
import { BookingAppointment } from "@/components/booking/MyAppointmentsDialog";

interface BookingDialogsProps {
  selectedService: Service | null;
  isBookingDialogOpen: boolean;
  isLoginDialogOpen: boolean;
  isMyAppointmentsDialogOpen: boolean;
  employees: Employee[];
  businessProfile: BusinessSettings | null;
  appointments: BookingAppointment[];
  onCloseBookingDialog: () => void;
  onCloseLoginDialog: () => void;
  onCloseAppointmentsDialog: () => void;
  onBookingConfirm: (data: any) => void;
  onLogin: (userData: { name: string; phone: string }) => void;
  onCancelAppointment: (id: string) => void;
  bookingSettings?: {
    simultaneousLimit: number;
    futureLimit: number;
    cancelMinHours: number;
  };
}

const BookingDialogs: React.FC<BookingDialogsProps> = ({
  selectedService,
  isBookingDialogOpen,
  isLoginDialogOpen,
  isMyAppointmentsDialogOpen,
  employees,
  businessProfile,
  appointments,
  onCloseBookingDialog,
  onCloseLoginDialog,
  onCloseAppointmentsDialog,
  onBookingConfirm,
  onLogin,
  onCancelAppointment,
  bookingSettings
}) => {
  return (
    <>
      {selectedService && (
        <BookingDialog
          open={isBookingDialogOpen}
          onClose={onCloseBookingDialog}
          service={selectedService}
          employees={employees}
          businessSettings={businessProfile}
          onBookingConfirm={onBookingConfirm}
          bookingSettings={bookingSettings}
        />
      )}

      <LoginDialog
        open={isLoginDialogOpen}
        onClose={onCloseLoginDialog}
        onLogin={onLogin}
      />

      <MyAppointmentsDialog
        open={isMyAppointmentsDialogOpen}
        onClose={onCloseAppointmentsDialog}
        appointments={appointments}
        onCancelAppointment={onCancelAppointment}
      />
    </>
  );
};

export default BookingDialogs;
