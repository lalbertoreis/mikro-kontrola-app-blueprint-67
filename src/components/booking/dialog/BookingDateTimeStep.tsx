
import React from "react";
import { Employee } from "@/types/employee";
import { Service } from "@/types/service";
import { Period } from "./types";
import ServiceInfo from "./ServiceInfo";
import EmployeeSelector from "./EmployeeSelector";
import BookingCalendar from "./BookingCalendar";
import PeriodSelector from "./PeriodSelector";
import TimeSlotSelector from "./TimeSlotSelector";
import BookingSummary from "./BookingSummary";

interface BookingDateTimeStepProps {
  service: Service;
  employees: Employee[];
  selectedEmployee: Employee | null;
  selectedDate: Date | null;
  selectedPeriod: Period | null;
  selectedTime: string | null;
  availableDays: { [key: number]: boolean };
  availablePeriods: Period[];
  isLoadingDays: boolean;
  isLoadingSlots: boolean;
  availableTimeSlots: string[];
  weekDays: Date[];
  canGoNext: boolean;
  canGoPrevious: boolean;
  currentWeekStart: Date;
  onEmployeeSelect: (employee: Employee) => void;
  onDateSelect: (date: Date) => void;
  onPeriodSelect: (period: Period) => void;
  onTimeSelect: (time: string) => void;
  onNextStep: () => void;
  goToNextWeek: () => void;
  goToPreviousWeek: () => void;
}

const BookingDateTimeStep: React.FC<BookingDateTimeStepProps> = ({
  service,
  employees,
  selectedEmployee,
  selectedDate,
  selectedPeriod,
  selectedTime,
  availableDays,
  availablePeriods,
  isLoadingDays,
  isLoadingSlots,
  availableTimeSlots,
  weekDays,
  canGoNext,
  canGoPrevious,
  currentWeekStart,
  onEmployeeSelect,
  onDateSelect,
  onPeriodSelect,
  onTimeSelect,
  onNextStep,
  goToNextWeek,
  goToPreviousWeek,
}) => {
  return (
    <div className="p-4">
      {/* Service Info */}
      <ServiceInfo service={service} />

      {/* Employee Selection */}
      <EmployeeSelector
        employees={employees}
        selectedEmployee={selectedEmployee}
        onEmployeeSelect={onEmployeeSelect}
      />

      {/* Calendar */}
      {selectedEmployee && (
        <BookingCalendar
          weekDays={weekDays}
          availableDays={availableDays}
          selectedDate={selectedDate}
          isLoadingDays={isLoadingDays}
          selectedEmployee={selectedEmployee}
          canGoNext={canGoNext}
          canGoPrevious={canGoPrevious}
          currentWeekStart={currentWeekStart}
          onDateSelect={onDateSelect}
          goToNextWeek={goToNextWeek}
          goToPreviousWeek={goToPreviousWeek}
        />
      )}

      {/* Period Selection */}
      {selectedDate && (
        <PeriodSelector
          selectedPeriod={selectedPeriod}
          onPeriodSelect={onPeriodSelect}
          availablePeriods={availablePeriods}
        />
      )}

      {/* Time Slots */}
      {selectedDate && selectedPeriod && (
        <TimeSlotSelector
          availableTimeSlots={availableTimeSlots}
          selectedTime={selectedTime}
          isLoadingSlots={isLoadingSlots}
          onTimeSelect={onTimeSelect}
        />
      )}

      {/* Booking Summary */}
      <BookingSummary
        service={service}
        selectedEmployee={selectedEmployee}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        onNextStep={onNextStep}
      />
    </div>
  );
};

export default BookingDateTimeStep;
