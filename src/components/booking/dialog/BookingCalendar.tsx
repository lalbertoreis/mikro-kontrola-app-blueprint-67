
import React from "react";
import { Button } from "@/components/ui/button";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BookingCalendarProps {
  weekDays: Date[];
  availableDays: { [key: number]: boolean };
  selectedDate: Date | null;
  isLoadingDays: boolean;
  selectedEmployee: any;
  canGoNext: boolean;
  canGoPrevious: boolean;
  currentWeekStart: Date;
  onDateSelect: (date: Date) => void;
  goToNextWeek: () => void;
  goToPreviousWeek: () => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  weekDays,
  availableDays,
  selectedDate,
  isLoadingDays,
  selectedEmployee,
  canGoNext,
  canGoPrevious,
  currentWeekStart,
  onDateSelect,
  goToNextWeek,
  goToPreviousWeek,
}) => {
  const formatDayOfWeek = (date: Date) => {
    return format(date, "EEEE", { locale: ptBR }).toUpperCase();
  };

  const formatDayOfMonth = (date: Date) => {
    return format(date, "dd");
  };
  
  const isDayAvailable = (date: Date) => {
    if (isLoadingDays || !selectedEmployee) return false;
    
    const dayOfWeek = date.getDay(); // 0 for Sunday, 1 for Monday
    return availableDays[dayOfWeek] === true;
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={goToPreviousWeek}
          disabled={!canGoPrevious}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <p className="text-center text-gray-500">
          {format(currentWeekStart, "MMMM yyyy", { locale: ptBR })}
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={goToNextWeek}
          disabled={!canGoNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 text-center">
        {weekDays.map((date, index) => {
          const isAvailable = isDayAvailable(date);
          
          return (
            <div key={index} className="text-center">
              <div className="text-xs text-gray-500">{formatDayOfWeek(date).slice(0, 3)}</div>
              <button
                disabled={!isAvailable}
                className={`w-10 h-10 rounded-lg mx-auto flex items-center justify-center text-lg ${
                  selectedDate && date.toDateString() === selectedDate.toDateString()
                    ? "bg-purple-500 text-white"
                    : !isAvailable
                      ? "opacity-30 cursor-not-allowed bg-gray-100"
                      : "hover:bg-gray-100"
                }`}
                onClick={() => isAvailable && onDateSelect(date)}
              >
                {formatDayOfMonth(date)}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookingCalendar;
