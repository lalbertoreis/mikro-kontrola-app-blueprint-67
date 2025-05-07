
import React, { useState } from "react";
import { Service } from "@/types/service";
import { Employee } from "@/types/employee";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import BookingDateTimeStep from "./dialog/BookingDateTimeStep";
import ClientInfoForm from "./dialog/ClientInfoForm";

interface BookingDialogProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onBookingConfirm: (employeeId: string, date: Date, time: string) => void;
  themeColor?: string; // Added theme color prop
  businessSlug?: string;
}

export const BookingDialog: React.FC<BookingDialogProps> = ({
  service,
  isOpen,
  onClose,
  employees,
  onBookingConfirm,
  themeColor = "#9b87f5", // Default color
  businessSlug
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleBookingConfirm = (employeeId: string, date: Date, time: string) => {
    setSelectedEmployeeId(employeeId);
    setSelectedDate(date);
    setSelectedTime(time);
    setCurrentStep(1);
  };

  const handleClientInfoSubmit = () => {
    if (selectedEmployeeId && selectedDate && selectedTime) {
      onBookingConfirm(selectedEmployeeId, selectedDate, selectedTime);
      handleClose();
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    setSelectedEmployeeId(null);
    setSelectedDate(null);
    setSelectedTime(null);
    onClose();
  };

  if (!service) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        {currentStep === 0 ? (
          <BookingDateTimeStep
            service={service}
            employees={employees}
            onNextStep={() => setCurrentStep(1)}
            onBookingConfirm={handleBookingConfirm}
            themeColor={themeColor} // Pass theme color
            businessSlug={businessSlug}
          />
        ) : (
          <ClientInfoForm
            onPrevStep={() => setCurrentStep(0)}
            onSubmit={handleClientInfoSubmit}
            themeColor={themeColor} // Pass theme color
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
