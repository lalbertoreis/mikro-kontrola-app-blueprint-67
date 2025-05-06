
import React, { useState, useEffect } from "react";
import { format, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BookingStep } from "./types";
import BookingCalendar from "./BookingCalendar";
import TimeSlotSelector from "./TimeSlotSelector";
import PeriodSelector from "./PeriodSelector";
import DialogStepNavigator from "./DialogStepNavigator";
import { getDateWithPeriod } from "@/hooks/booking/utils/dateFormatters";
import { useProfileSettings } from "@/hooks/useProfileSettings";

interface BookingDateTimeStepProps extends BookingStep {
  date: Date | undefined;
  setDate: (date: Date) => void;
  time: string | undefined;
  setTime: (time: string) => void;
  period: "morning" | "afternoon" | "evening" | undefined;
  setPeriod: (period: "morning" | "afternoon" | "evening") => void;
  availableTimeSlots: string[];
  employeeId?: string;
  serviceId?: string;
  isLoading: boolean;
  businessSlug?: string;
}

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
  businessSlug
}) => {
  const [isNextDisabled, setIsNextDisabled] = useState(true);
  const maxDate = addMonths(new Date(), 3);
  const { settings } = useProfileSettings();
  const bookingColor = settings?.bookingColor || '#9b87f5';

  useEffect(() => {
    setIsNextDisabled(!date || !time);
  }, [date, time]);
  
  const getPeriodFromTime = (time: string): "morning" | "afternoon" | "evening" => {
    const hour = parseInt(time.split(":")[0], 10);
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  };
  
  const handleTimeSelect = (newTime: string) => {
    setTime(newTime);
    setPeriod(getPeriodFromTime(newTime));
  };

  const handlePeriodChange = (newPeriod: "morning" | "afternoon" | "evening") => {
    setPeriod(newPeriod);
    setTime(undefined); // Clear selected time when period changes
  };

  // Filter time slots based on selected period
  const filteredTimeSlots = availableTimeSlots.filter((slot) => {
    if (!period) return true;
    return getPeriodFromTime(slot) === period;
  });

  return (
    <div className="space-y-4" style={{ '--booking-color': bookingColor } as React.CSSProperties}>
      <h2 className="text-xl font-semibold">Escolha a data e horário</h2>
      
      <BookingCalendar
        selectedDate={date}
        onDateSelect={setDate}
        maxDate={maxDate}
        businessSlug={businessSlug}
        employeeId={employeeId}
        serviceId={serviceId}
      />

      {date && (
        <div className="space-y-4">
          <div className="text-sm text-gray-500">
            {format(date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </div>

          <PeriodSelector selectedPeriod={period} onChange={handlePeriodChange} />
          
          <TimeSlotSelector
            availableTimeSlots={filteredTimeSlots}
            selectedTime={time}
            onTimeSelect={handleTimeSelect}
            period={period}
            isLoading={isLoading}
          />
        </div>
      )}

      <DialogStepNavigator
        onNext={onNext}
        onPrevious={onPrevious}
        isNextDisabled={isNextDisabled}
      />
    </div>
  );
};

export default BookingDateTimeStep;
