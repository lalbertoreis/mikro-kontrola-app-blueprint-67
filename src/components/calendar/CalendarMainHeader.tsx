
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarViewOptions } from "@/types/calendar";

interface CalendarMainHeaderProps {
  currentDate: Date;
  view: CalendarViewOptions["view"];
  onNavigatePrevious: () => void;
  onNavigateNext: () => void;
  onToday: () => void;
}

const CalendarMainHeader: React.FC<CalendarMainHeaderProps> = ({
  currentDate,
  view,
  onNavigatePrevious,
  onNavigateNext,
  onToday,
}) => {
  const formattedDate = view === "week" 
    ? format(currentDate, "'Semana de' dd 'de' MMMM", { locale: ptBR })
    : format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });

  const formattedYear = format(currentDate, "yyyy");

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-xl font-bold capitalize text-slate-900 dark:text-slate-100">
              {formattedDate}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {formattedYear}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onNavigatePrevious}
          className="hover:bg-slate-100 dark:hover:bg-slate-800 h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onToday}
          className="px-3 hover:bg-slate-100 dark:hover:bg-slate-800 h-8 text-xs"
        >
          Hoje
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onNavigateNext}
          className="hover:bg-slate-100 dark:hover:bg-slate-800 h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CalendarMainHeader;
