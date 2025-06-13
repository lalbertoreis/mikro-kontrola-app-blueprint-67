
import React, { useState, useEffect } from "react";
import { Service } from "@/types/service";
import { Employee } from "@/types/employee";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import BookingDateTimeStep from "./dialog/BookingDateTimeStep";
import ClientInfoForm from "./dialog/ClientInfoForm";
import LoginDialog from "./LoginDialog";
import { toast } from "sonner";

interface BookingDialogProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onBookingConfirm: (employeeId: string, date: Date, time: string) => void;
  themeColor?: string;
  businessSlug?: string;
}

export const BookingDialog: React.FC<BookingDialogProps> = ({
  service,
  isOpen,
  onClose,
  employees,
  onBookingConfirm,
  themeColor = "#9b87f5",
  businessSlug
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [userData, setUserData] = useState<Record<string, any> | null>(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("bookingUser");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserData(parsedUser);
        setUserLoggedIn(true);
      } catch (e) {
        localStorage.removeItem("bookingUser");
      }
    }
  }, []);

  const handleBookingConfirm = (employeeId: string, date: Date, time: string) => {
    console.log("BookingDialog - handleBookingConfirm called with:", { employeeId, date, time });
    
    setSelectedEmployeeId(employeeId);
    setSelectedDate(date);
    setSelectedTime(time);
    
    // Check if user is logged in
    const storedUser = localStorage.getItem("bookingUser");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserData(parsedUser);
        
        console.log("User is logged in, proceeding with booking:", parsedUser);
        
        // If we have all required data, process the booking directly
        if (parsedUser && parsedUser.name && parsedUser.phone) {
          console.log("Processing booking directly...");
          onBookingConfirm(employeeId, date, time);
          handleClose();
          return;
        }
        
        // If we need additional data, show the form
        setCurrentStep(1);
      } catch (e) {
        console.error("Error parsing stored user:", e);
        localStorage.removeItem("bookingUser");
        setShowLoginDialog(true);
      }
    } else {
      console.log("User not logged in, showing login dialog");
      setShowLoginDialog(true);
    }
  };

  const handleClientInfoSubmit = () => {
    console.log("Client info submitted, processing booking...");
    if (selectedEmployeeId && selectedDate && selectedTime) {
      onBookingConfirm(selectedEmployeeId, selectedDate, selectedTime);
      handleClose();
    } else {
      console.error("Missing booking data:", { selectedEmployeeId, selectedDate, selectedTime });
      toast.error("Dados de agendamento incompletos");
    }
  };

  const handleLoginSuccess = (userData: { name: string; phone: string }) => {
    console.log("Login successful:", userData);
    setShowLoginDialog(false);
    setUserLoggedIn(true);
    setUserData(userData);
    localStorage.setItem("bookingUser", JSON.stringify(userData));
    
    // If we have selected date/time/employee, process the booking
    if (selectedEmployeeId && selectedDate && selectedTime) {
      console.log("Processing booking after login...");
      onBookingConfirm(selectedEmployeeId, selectedDate, selectedTime);
      handleClose();
    } else {
      // Caso contrário, continue no fluxo normal
      setCurrentStep(1);
    }
    
    toast.success(`Bem-vindo(a), ${userData.name}!`);
  };

  const handleClose = () => {
    console.log("Closing booking dialog");
    setCurrentStep(0);
    setSelectedEmployeeId(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setShowLoginDialog(false);
    onClose();
  };

  if (!service) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-md">
          {currentStep === 0 ? (
            <BookingDateTimeStep
              service={service}
              employees={employees}
              onNextStep={() => setCurrentStep(1)}
              onBookingConfirm={handleBookingConfirm}
              themeColor={themeColor}
              businessSlug={businessSlug}
            />
          ) : (
            <ClientInfoForm
              onPrevStep={() => setCurrentStep(0)}
              onSubmit={handleClientInfoSubmit}
              themeColor={themeColor}
              prefilledData={userData}
            />
          )}
        </DialogContent>
      </Dialog>

      <LoginDialog
        open={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        onLogin={handleLoginSuccess}
        businessSlug={businessSlug}
        themeColor={themeColor}
      />
    </>
  );
};
