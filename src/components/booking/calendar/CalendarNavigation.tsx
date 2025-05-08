
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarNavigationProps {
  currentWeekStart: Date;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

const CalendarNavigation: React.FC<CalendarNavigationProps> = ({
  currentWeekStart,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext
}) => {
  return (
    <div className="flex justify-between items-center mb-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrevious}
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
        onClick={onNext}
        disabled={!canGoNext}
      >
        Próxima
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
};

export default CalendarNavigation;
