
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCalendarDays } from "../calendar/useCalendarDays";
import CalendarNavigation from "../calendar/CalendarNavigation";
import WeekdaysHeader from "../calendar/WeekdaysHeader";
import CalendarDayCell from "../calendar/CalendarDayCell";

interface BookingCalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  serviceId: string;
  employeeId: string;
  themeColor?: string;
  businessSlug?: string;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  selectedDate,
  onDateSelect,
  serviceId,
  employeeId,
  themeColor = "#9b87f5", // Default color
  businessSlug
}) => {
  const {
    currentWeekStart,
    isLoadingDays,
    calendarDays,
    goToNextWeek,
    goToPreviousWeek,
    canGoNext,
    canGoPrevious
  } = useCalendarDays({
    serviceId, 
    employeeId, 
    selectedDate, 
    businessSlug
  });

  return (
    <div className="mb-6">
      <p className="text-sm text-gray-500 mb-2">Escolha a data:</p>
      
      <CalendarNavigation 
        currentWeekStart={currentWeekStart}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        onPrevious={goToPreviousWeek}
        onNext={goToNextWeek}
      />
      
      <div className="grid grid-cols-7 gap-1">
        {/* Cabeçalhos dos dias da semana */}
        <WeekdaysHeader />
        
        {/* Dias do calendário */}
        {isLoadingDays ? (
          // Mostrar skeletons durante carregamento
          Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={`skeleton-${i}`} className="h-10 rounded-md" />
          ))
        ) : (
          calendarDays.map(({ 
            day, 
            isAvailable, 
            isSelected, 
            isHoliday, 
            holiday, 
            isPastDay, 
            isFutureLimit, 
            isDifferentMonth 
          }) => (
            <CalendarDayCell 
              key={day.toISOString()}
              day={day}
              isAvailable={isAvailable}
              isSelected={isSelected}
              isHoliday={isHoliday}
              holiday={holiday}
              isPastDay={isPastDay}
              isFutureLimit={isFutureLimit}
              isDifferentMonth={isDifferentMonth}
              themeColor={themeColor}
              onSelectDay={onDateSelect}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default React.memo(BookingCalendar);
