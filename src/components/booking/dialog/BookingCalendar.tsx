
import React, { useEffect, useState, useMemo } from "react";
import { format, addDays, startOfWeek, isToday, isSameDay, addWeeks, parseISO, isSameMonth, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Employee } from "@/types/employee";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Holiday } from "@/types/holiday";
import { supabase } from "@/integrations/supabase/client";
import { setSlugContext } from "@/services/appointment/availability/slugContext";
import { fetchHolidays } from "@/services/appointment/availability/fetchData";

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
  const [isLoadingDays, setIsLoadingDays] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [availableDays, setAvailableDays] = useState<{ [key: number]: boolean }>({});
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [bookingFutureLimit, setBookingFutureLimit] = useState(30); // Default 30 days
  
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
  
  // Get the booking settings (including future limit)
  useEffect(() => {
    const fetchBookingSettings = async () => {
      try {
        if (businessSlug) {
          await setSlugContext(businessSlug);
        }
        
        const { data: serviceData } = await supabase
          .from('business_services_view')
          .select('booking_future_limit')
          .eq('id', serviceId)
          .maybeSingle();
          
        if (serviceData && serviceData.booking_future_limit) {
          // Sempre converter para dias (independentemente se está em meses ou dias)
          let futureLimitInDays = serviceData.booking_future_limit;
          
          // Se o valor for pequeno (provavelmente representando meses), converter para dias
          if (futureLimitInDays <= 12) {  // Valores até 12 são provavelmente meses
            futureLimitInDays = Math.round(futureLimitInDays * 30);
          }
          
          console.log(`Setting booking future limit to ${futureLimitInDays} days (from ${serviceData.booking_future_limit})`);
          setBookingFutureLimit(futureLimitInDays);
        }
      } catch (error) {
        console.error("Error fetching booking settings:", error);
      }
    };
    
    if (serviceId) {
      fetchBookingSettings();
    }
  }, [serviceId, businessSlug]);

  // Fetch holidays for the current month and next month
  useEffect(() => {
    const fetchCalendarHolidays = async () => {
      try {
        const startOfCurrentMonth = new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth(), 1);
        const endOfNextMonth = new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth() + 2, 0);
        
        const startDate = format(startOfCurrentMonth, 'yyyy-MM-dd');
        const endDate = format(endOfNextMonth, 'yyyy-MM-dd');
        
        // First check the start date
        const startDateHolidays = await fetchHolidays(startDate, businessSlug);
        
        // Then check the end date
        const endDateHolidays = await fetchHolidays(endDate, businessSlug);
        
        // Combine the holidays (this is simplified, in a real app we'd fetch all dates in between)
        const allHolidays = [...startDateHolidays, ...endDateHolidays];
        
        console.log(`Found ${allHolidays?.length || 0} holidays for calendar period`);
        setHolidays(allHolidays);
      } catch (error) {
        console.error("Error fetching holidays:", error);
        setHolidays([]);
      }
    };
    
    fetchCalendarHolidays();
  }, [currentWeekStart, businessSlug]);

  // Fetch available days for the employee
  useEffect(() => {
    const fetchAvailableDays = async () => {
      setIsLoadingDays(true);
      try {
        if (!employeeId) {
          console.log("No employee ID provided");
          setAvailableDays({});
          return;
        }
        
        console.log(`Fetching available days for employee ${employeeId}`);
        
        // Set the business slug context
        if (businessSlug) {
          await setSlugContext(businessSlug);
        }
        
        // Fetch shifts directly from employees_shifts_view
        const { data: shifts, error } = await supabase
          .from('employees_shifts_view')
          .select('day_of_week')
          .eq('employee_id', employeeId);
        
        if (error) {
          throw error;
        }
        
        // Create a map of available days based on shifts
        const dayMap: { [key: number]: boolean } = {
          0: false, // Sunday
          1: false, // Monday
          2: false, // Tuesday
          3: false, // Wednesday
          4: false, // Thursday
          5: false, // Friday
          6: false  // Saturday
        };
        
        shifts?.forEach(shift => {
          if (shift.day_of_week !== null) {
            dayMap[shift.day_of_week] = true;
          }
        });
        
        console.log("Employee available days:", dayMap);
        setAvailableDays(dayMap);
      } catch (error) {
        console.error("Error fetching available days:", error);
        setAvailableDays({});
      } finally {
        setIsLoadingDays(false);
      }
    };
    
    if (employeeId) {
      fetchAvailableDays();
    }
  }, [employeeId, businessSlug]);

  // Calculate if we can navigate to other weeks
  const today = new Date();
  const maxFutureDate = addDays(today, bookingFutureLimit);
  const canGoNext = currentWeekStart < maxFutureDate;
  const canGoPrevious = currentWeekStart > today;

  // Check if a day is a holiday
  const getHolidayForDate = (date: Date): Holiday | undefined => {
    const dateString = format(date, 'yyyy-MM-dd');
    return holidays.find(holiday => holiday.date === dateString);
  };

  // Memorize the days and their availability
  const calendarDays = useMemo(() => {
    return weekDays.map((day) => {
      const dayOfWeek = day.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const isAvailableDayOfWeek = availableDays[dayOfWeek] || false;
      const isSelected = selectedDate && 
                        selectedDate.getDate() === day.getDate() &&
                        selectedDate.getMonth() === day.getMonth() &&
                        selectedDate.getFullYear() === day.getFullYear();
      const holiday = getHolidayForDate(day);
      const isHoliday = !!holiday;
      const isFutureLimit = day > maxFutureDate;
      const isPastDay = isBefore(day, today) && !isSameDay(day, today); // Hoje é considerado válido
      const isDifferentMonth = !isSameMonth(day, currentWeekStart);
      
      // Um dia é disponível se:
      // 1. O funcionário tem um turno neste dia
      // 2. Não é um feriado
      // 3. Não está além do limite de agendamento futuro
      // 4. Não está no passado
      // 5. Está no mesmo mês que estamos visualizando
      const isTrulyAvailable = isAvailableDayOfWeek && 
                              !isHoliday && 
                              !isFutureLimit && 
                              !isPastDay &&
                              !isDifferentMonth;
      
      return { 
        day, 
        dayOfWeek, 
        isAvailable: isTrulyAvailable,
        isSelected,
        isHoliday,
        holiday,
        isFutureLimit,
        isPastDay,
        isDifferentMonth
      };
    });
  }, [weekDays, availableDays, selectedDate, holidays, maxFutureDate, today, currentWeekStart]);

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
          calendarDays.map(({ day, isAvailable, isSelected, isHoliday, holiday, isPastDay, isFutureLimit, isDifferentMonth }) => {
            // Calculate button style based on state
            let buttonStyle: React.CSSProperties = {};
            let textColorClass = "";
            let className = "h-10";
            
            // Aplicar estilo especial para dia selecionado
            if (isSelected) {
              buttonStyle = { backgroundColor: themeColor };
              textColorClass = "text-white";
            } 
            // Aplicar estilo para feriados
            else if (isHoliday) {
              buttonStyle = { backgroundColor: "#FFDEE2", borderColor: "#ea384c" };
              textColorClass = "text-red-700";
            } 
            // Destacar o dia atual
            else if (isToday(day)) {
              buttonStyle = { borderColor: themeColor };
              textColorClass = "";
            }
            
            // Mês diferente ou indisponível mostra opaco
            if (isDifferentMonth || !isAvailable) {
              className += " opacity-50";
              
              // Dias de outro mês ou indisponíveis não são clicáveis
              if (isDifferentMonth) {
                className += " cursor-not-allowed";
              }
              
              // Estilos específicos para diferentes tipos de indisponibilidade
              if (isHoliday) {
                buttonStyle = { backgroundColor: "#FFDEE2", borderColor: "#ea384c" };
                textColorClass = "text-red-700";
              } 
              // Estilo para dias além do limite futuro
              else if (isFutureLimit) {
                buttonStyle = { backgroundColor: "#f5f5f5", borderColor: "#e0e0e0" };
                textColorClass = "text-gray-400";
              }
              // Estilo para dias passados
              else if (isPastDay) {
                buttonStyle = { backgroundColor: "#f5f5f5", borderColor: "#e0e0e0" };
                textColorClass = "text-gray-400";
              }
              
              // Dias de mês diferente ficam mais claros
              if (isDifferentMonth) {
                textColorClass = "text-gray-400";
              }
            }
            
            // Criar o botão do dia com tooltip para feriados
            return (
              <TooltipProvider key={day.toISOString()}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        className={`${className} ${textColorClass} w-full`}
                        style={buttonStyle}
                        disabled={!isAvailable}
                        onClick={() => isAvailable && onDateSelect(day)}
                      >
                        {format(day, 'd')}
                      </Button>
                      {isHoliday && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full" />
                      )}
                    </div>
                  </TooltipTrigger>
                  {isHoliday && holiday && (
                    <TooltipContent>
                      <p>{holiday.name}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            );
          })
        )}
      </div>
    </div>
  );
};

export default React.memo(BookingCalendar);
