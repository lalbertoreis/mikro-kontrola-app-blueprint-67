
import React, { useEffect, useState, useMemo } from "react";
import { format, addDays, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Employee } from "@/types/employee";

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
  themeColor = "#9b87f5",
  businessSlug
}) => {
  const [isLoadingDays, setIsLoadingDays] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [availableDays, setAvailableDays] = useState<{ [key: number]: boolean }>({});
  
  // Generate the days for the current week
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(currentWeekStart, i));
    }
    return days;
  }, [currentWeekStart]);

  // Function to go to the next week
  const goToNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  // Function to go to the previous week
  const goToPreviousWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
  };

  // Fetch available days for the employee
  useEffect(() => {
    const fetchAvailableDays = async () => {
      setIsLoadingDays(true);
      try {
        // In a real app, this would be an API call
        // For this demo, we'll just set some mock data after a delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock available days (0 = Sunday, 1 = Monday, etc.)
        const mockAvailableDays = {
          0: false,  // Sunday
          1: true,   // Monday
          2: true,   // Tuesday
          3: true,   // Wednesday
          4: true,   // Thursday
          5: true,   // Friday
          6: false,  // Saturday
        };
        
        setAvailableDays(mockAvailableDays);
      } catch (error) {
        console.error("Error fetching available days:", error);
      } finally {
        setIsLoadingDays(false);
      }
    };
    
    if (employeeId) {
      fetchAvailableDays();
    }
  }, [employeeId, serviceId, currentWeekStart, businessSlug]);

  // Calculate if we can navigate to other weeks
  const canGoNext = true;  // In a real app, this would be based on business rules
  const canGoPrevious = true;  // In a real app, this would be based on business rules

  // For debugging
  useEffect(() => {
    console.log("BookingCalendar props:", { 
      availableDays, 
      isLoadingDays,
      selectedDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null,
      employeeId
    });
  }, [availableDays, isLoadingDays, selectedDate, employeeId]);

  // Memorize the days and their availability
  const calendarDays = useMemo(() => {
    return weekDays.map((day) => {
      const dayOfWeek = day.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const isAvailable = availableDays[dayOfWeek] || false;
      const isSelected = selectedDate && 
                        selectedDate.getDate() === day.getDate() &&
                        selectedDate.getMonth() === day.getMonth();
      
      return { day, dayOfWeek, isAvailable, isSelected };
    });
  }, [weekDays, availableDays, selectedDate]);

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
          calendarDays.map(({ day, dayOfWeek, isAvailable, isSelected }) => {
            const buttonStyle = isSelected 
              ? { backgroundColor: themeColor } 
              : {};
              
            return (
              <Button
                key={day.toISOString()}
                variant={isSelected ? "default" : "outline"}
                className={`h-10 ${isSelected ? "text-white hover:opacity-90" : ""} ${
                  !isAvailable ? "opacity-50 cursor-not-allowed" : ""
                }`}
                style={buttonStyle}
                disabled={!isAvailable}
                onClick={() => isAvailable && onDateSelect(day)}
              >
                {format(day, 'd')}
              </Button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default React.memo(BookingCalendar);
