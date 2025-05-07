
import React, { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Service } from "@/types/service";
import { Employee } from "@/types/employee";
import { BookingStep } from "./types";
import BookingCalendar from "./BookingCalendar";
import EmployeeSelector from "./EmployeeSelector";
import PeriodSelector from "./PeriodSelector";
import TimeSlotSelector from "./TimeSlotSelector";
import ServiceInfo from "./ServiceInfo";
import BookingSummary from "./BookingSummary";

interface BookingDateTimeStepProps {
  service: Service;
  employees: Employee[];
  onNextStep: () => void;
  onBookingConfirm: (employeeId: string, date: Date, time: string) => void;
  themeColor?: string;
  businessSlug?: string;
}

const BookingDateTimeStep: React.FC<BookingDateTimeStepProps> = ({
  service,
  employees,
  onNextStep,
  onBookingConfirm,
  themeColor = "#9b87f5", // Default color
  businessSlug
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<"morning" | "afternoon" | "evening" | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleNextStep = () => {
    if (selectedEmployee && selectedDate && selectedTime) {
      onBookingConfirm(selectedEmployee.id, selectedDate, selectedTime);
    }
  };

  // Employees that can provide this service
  const availableEmployees = employees.filter((emp) => {
    return emp.services?.some((s) => s === service.id);
  });

  return (
    <div>
      <h2 className="text-xl font-bold mb-4" style={{ color: themeColor }}>
        {service.name}
      </h2>

      <ServiceInfo service={service} />

      <div className="space-y-6">
        <EmployeeSelector
          employees={availableEmployees}
          selectedEmployee={selectedEmployee}
          onSelectEmployee={setSelectedEmployee}
          themeColor={themeColor} // Pass theme color
        />

        {selectedEmployee && (
          <BookingCalendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            serviceId={service.id}
            employeeId={selectedEmployee.id}
            themeColor={themeColor}
            businessSlug={businessSlug}
          />
        )}

        {selectedDate && (
          <PeriodSelector
            selectedPeriod={selectedPeriod}
            onSelectPeriod={setSelectedPeriod}
            themeColor={themeColor} // Pass theme color
          />
        )}

        {selectedDate && selectedPeriod && (
          <TimeSlotSelector
            selectedDate={selectedDate}
            period={selectedPeriod}
            selectedTime={selectedTime}
            onSelectTime={setSelectedTime}
            serviceId={service.id}
            employeeId={selectedEmployee?.id || ""}
            themeColor={themeColor} // Pass theme color
            businessSlug={businessSlug}
          />
        )}

        <BookingSummary
          service={service}
          selectedEmployee={selectedEmployee}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onNextStep={handleNextStep}
          themeColor={themeColor} // Pass theme color
        />
      </div>
    </div>
  );
};

export default BookingDateTimeStep;
