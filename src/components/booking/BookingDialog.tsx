
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
    setSelectedEmployeeId(employeeId);
    setSelectedDate(date);
    setSelectedTime(time);
    
    // Check if user is logged in
    const storedUser = localStorage.getItem("bookingUser");
    if (storedUser) {
      // User is logged in, proceed to confirmation
      setCurrentStep(1);
    } else {
      // User is not logged in, show login dialog
      setShowLoginDialog(true);
    }
  };

  const handleClientInfoSubmit = () => {
    if (selectedEmployeeId && selectedDate && selectedTime) {
      onBookingConfirm(selectedEmployeeId, selectedDate, selectedTime);
      handleClose();
    }
  };

  const handleLoginSuccess = (userData: { name: string; phone: string }) => {
    setShowLoginDialog(false);
    setUserLoggedIn(true);
    setUserData(userData);
    localStorage.setItem("bookingUser", JSON.stringify(userData));
    setCurrentStep(1);
    toast.success(`Bem-vindo(a), ${userData.name}!`);
  };

  const handleClose = () => {
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
