
import React from "react";
import { format, isToday } from "date-fns";
import { Button } from "@/components/ui/button";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Holiday } from "@/types/holiday";

interface CalendarDayCellProps {
  day: Date;
  isAvailable: boolean;
  isSelected: boolean;
  isHoliday: boolean;
  holiday?: Holiday;
  isPastDay: boolean;
  isFutureLimit: boolean;
  isDifferentMonth: boolean;
  themeColor: string;
  onSelectDay: (day: Date) => void;
}

const CalendarDayCell: React.FC<CalendarDayCellProps> = ({
  day,
  isAvailable,
  isSelected,
  isHoliday,
  holiday,
  isPastDay,
  isFutureLimit,
  isDifferentMonth,
  themeColor,
  onSelectDay
}) => {
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

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            <Button
              variant={isSelected ? "default" : "outline"}
              className={`${className} ${textColorClass} w-full`}
              style={buttonStyle}
              disabled={!isAvailable}
              onClick={() => isAvailable && onSelectDay(day)}
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
};

export default CalendarDayCell;
