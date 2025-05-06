
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarViewOptions } from "@/types/calendar";

interface CalendarNavigationProps {
  currentDate: Date;
  view: CalendarViewOptions["view"];
  onNavigatePrevious: () => void;
  onNavigateNext: () => void;
}

const CalendarNavigation: React.FC<CalendarNavigationProps> = ({
  currentDate,
  view,
  onNavigatePrevious,
  onNavigateNext,
}) => {
  const formattedDate = view === "week" 
    ? format(currentDate, "'Semana de' dd 'de' MMMM", { locale: ptBR })
    : format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="flex items-center justify-between mb-2">
      <Button variant="outline" size="sm" onClick={onNavigatePrevious}>
        <ChevronLeft className="h-4 w-4" />
        {view === "week" ? "Semana anterior" : "Mês anterior"}
      </Button>
      
      <h2 className="text-lg font-medium capitalize">
        {formattedDate}
      </h2>
      
      <Button variant="outline" size="sm" onClick={onNavigateNext}>
        {view === "week" ? "Próxima semana" : "Próximo mês"}
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
};

export default CalendarNavigation;
