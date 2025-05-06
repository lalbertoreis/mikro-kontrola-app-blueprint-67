
import React, { useState, useEffect } from "react";
import { format, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BookingStepProps, BookingDateTimeStepProps, Period } from "./types";
import BookingCalendar from "./BookingCalendar";
import TimeSlotSelector from "./TimeSlotSelector";
import PeriodSelector from "./PeriodSelector";
import DialogStepNavigator from "./DialogStepNavigator";
import { useProfileSettings } from "@/hooks/useProfileSettings";

const BookingDateTimeStep: React.FC<BookingDateTimeStepProps> = ({
  onNext,
  onPrevious,
  date,
  setDate,
  time,
  setTime,
  period,
  setPeriod,
  availableTimeSlots,
  employeeId,
  serviceId,
  isLoading,
  businessSlug,
  service,
  employees,
  selectedEmployee,
  selectedDate,
  selectedPeriod,
  selectedTime,
  availableDays = {},
  availablePeriods = ["morning", "afternoon", "evening"],
  isLoadingDays = false,
  isLoadingSlots = false,
  weekDays = [],
  canGoNext = false,
  canGoPrevious = false,
  currentWeekStart = new Date(),
  onEmployeeSelect,
  onDateSelect,
  onPeriodSelect,
  onTimeSelect,
  goToNextWeek,
  goToPreviousWeek,
  onNextStep
}) => {
  const [isNextDisabled, setIsNextDisabled] = useState(true);
  const maxDate = addMonths(new Date(), 3);
  const { settings } = useProfileSettings();
  const bookingColor = settings?.bookingColor || '#9b87f5';

  useEffect(() => {
    setIsNextDisabled(!selectedDate || !selectedTime);
  }, [selectedDate, selectedTime]);
  
  const getPeriodFromTime = (time: string): Period => {
    const hour = parseInt(time.split(":")[0], 10);
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  };
  
  const handleTimeSelect = (newTime: string) => {
    if (onTimeSelect) {
      onTimeSelect(newTime);
    } else if (setTime) {
      setTime(newTime);
      // Se temos a função setPeriod disponível, definimos o período com base no horário
      if (setPeriod) {
        setPeriod(getPeriodFromTime(newTime));
      }
    }
  };

  const handlePeriodChange = (newPeriod: Period) => {
    if (onPeriodSelect) {
      onPeriodSelect(newPeriod);
    } else if (setPeriod) {
      setPeriod(newPeriod);
      // Limpar o horário selecionado quando o período muda
      if (setTime) {
        setTime(undefined);
      }
    }
  };

  // Filter time slots based on selected period
  const currentPeriod = selectedPeriod || period;
  const filteredTimeSlots = availableTimeSlots.filter((slot) => {
    if (!currentPeriod) return true;
    return getPeriodFromTime(slot) === currentPeriod;
  });

  return (
    <div className="space-y-4" style={{ '--booking-color': bookingColor } as React.CSSProperties}>
      <h2 className="text-xl font-semibold">Escolha a data e horário</h2>
      
      <div>
        {(selectedDate || date) && (
          <div className="text-sm text-gray-500">
            {format(selectedDate || date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </div>
        )}
        
        <PeriodSelector 
          selectedPeriod={selectedPeriod || period} 
          onPeriodSelect={handlePeriodChange} 
          availablePeriods={availablePeriods}
        />
        
        <TimeSlotSelector
          availableTimeSlots={filteredTimeSlots}
          selectedTime={selectedTime || time}
          onTimeSelect={handleTimeSelect}
          period={selectedPeriod || period}
          isLoading={isLoadingSlots || isLoading}
        />
      </div>

      <DialogStepNavigator
        onNext={onNext || onNextStep}
        onPrevious={onPrevious}
        isNextDisabled={isNextDisabled}
      />
    </div>
  );
};

export default BookingDateTimeStep;
