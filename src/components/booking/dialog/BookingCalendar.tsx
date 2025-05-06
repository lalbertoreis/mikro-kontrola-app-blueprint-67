
import React, { useEffect, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Employee } from "@/types/employee";

interface BookingCalendarProps {
  weekDays: Date[];
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  availableDays: { [key: number]: boolean };
  selectedEmployee: Employee | null;
  isLoadingDays: boolean;
  canGoNext: boolean;
  canGoPrevious: boolean;
  currentWeekStart: Date;
  goToNextWeek: () => void;
  goToPreviousWeek: () => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  weekDays,
  selectedDate,
  onDateSelect,
  availableDays,
  selectedEmployee,
  isLoadingDays,
  canGoNext,
  canGoPrevious,
  currentWeekStart,
  goToNextWeek,
  goToPreviousWeek
}) => {
  // Para fins de depuração - executar apenas quando props relevantes mudam
  useEffect(() => {
    console.log("BookingCalendar props:", { 
      availableDays, 
      isLoadingDays,
      selectedDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null,
      selectedEmployee: selectedEmployee?.name
    });
  }, [availableDays, isLoadingDays, selectedDate, selectedEmployee?.id]);

  // Memorizar os dias e suas disponibilidades para evitar recálculos em renderizações
  const calendarDays = useMemo(() => {
    return weekDays.map((day) => {
      const dayOfWeek = day.getDay(); // 0 = Domingo, 1 = Segunda, etc.
      const isAvailable = availableDays[dayOfWeek] || false;
      const isSelected = selectedDate && 
                        selectedDate.getDate() === day.getDate() &&
                        selectedDate.getMonth() === day.getMonth();
      
      // Para debugging
      if (selectedEmployee) {
        console.log(`Dia ${format(day, 'dd/MM')} (${dayOfWeek}): disponível = ${isAvailable}`);
      }
      
      return { day, dayOfWeek, isAvailable, isSelected };
    });
  }, [weekDays, availableDays, selectedDate, selectedEmployee]);

  return (
    <div className="mb-6">
      <p className="text-sm text-gray-500 mb-2">Escolha a data:</p>
      <div className="flex justify-between items-center mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousWeek}
          disabled={!canGoPrevious}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Anterior
        </Button>
        
        <p className="text-sm font-medium text-center">
          {format(currentWeekStart, 'MMMM yyyy', { locale: ptBR })}
        </p>
        
        <Button
          variant="outline"
          size="sm"
          onClick={goToNextWeek}
          disabled={!canGoNext}
        >
          Próxima
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {/* Cabeçalhos dos dias da semana */}
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, i) => (
          <div key={`header-${i}`} className="text-center text-xs font-medium py-1">
            {day}
          </div>
        ))}
        
        {/* Dias do calendário */}
        {isLoadingDays ? (
          // Mostrar skeletons durante carregamento
          Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={`skeleton-${i}`} className="h-10 rounded-md" />
          ))
        ) : (
          calendarDays.map(({ day, dayOfWeek, isAvailable, isSelected }) => (
            <Button
              key={day.toISOString()}
              variant={isSelected ? "default" : "outline"}
              className={`h-10 ${isSelected ? "bg-purple-500 hover:bg-purple-600" : ""} ${
                !isAvailable ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!isAvailable}
              onClick={() => isAvailable && onDateSelect(day)}
            >
              {format(day, 'd')}
            </Button>
          ))
        )}
      </div>
    </div>
  );
};

export default React.memo(BookingCalendar);
