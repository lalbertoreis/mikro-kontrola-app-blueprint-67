
import React from "react";
import { Holiday } from "@/types/holiday";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CalendarX } from "lucide-react";

interface HolidayIndicatorProps {
  holiday: Holiday;
  date: Date;
  className?: string;
}

const HolidayIndicator: React.FC<HolidayIndicatorProps> = ({ holiday, date, className = "" }) => {
  const getBackgroundColor = () => {
    switch (holiday.blockingType) {
      case 'full_day':
        return 'bg-red-50 border-red-200';
      case 'morning':
      case 'afternoon':
      case 'custom':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getBlockingText = () => {
    switch (holiday.blockingType) {
      case 'full_day':
        return 'Dia inteiro bloqueado';
      case 'morning':
        return 'Manhã bloqueada (até 12:00)';
      case 'afternoon':
        return 'Tarde bloqueada (após 12:00)';
      case 'custom':
        return `Bloqueado: ${holiday.customStartTime} - ${holiday.customEndTime}`;
      default:
        return 'Feriado sem bloqueio';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`absolute inset-0 ${getBackgroundColor()} ${className} flex items-center justify-center opacity-80`}>
            <CalendarX className="h-4 w-4 text-red-600" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">{holiday.name}</p>
            <p className="text-sm text-gray-600">{getBlockingText()}</p>
            {holiday.description && (
              <p className="text-sm">{holiday.description}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default HolidayIndicator;
