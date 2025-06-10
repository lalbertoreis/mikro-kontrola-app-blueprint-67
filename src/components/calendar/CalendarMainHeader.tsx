
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, Users, Clock } from "lucide-react";
import { CalendarViewOptions } from "@/types/calendar";
import { useAppointments } from "@/hooks/useAppointments";

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
  const { appointments } = useAppointments();
  
  // Calcular estatísticas do dia atual
  const todayAppointments = appointments.filter(apt => {
    const aptDate = typeof apt.start === 'string' ? new Date(apt.start) : apt.start;
    const today = new Date();
    return aptDate.toDateString() === today.toDateString();
  });
  
  const todayScheduled = todayAppointments.filter(apt => apt.status === 'scheduled').length;
  const todayCompleted = todayAppointments.filter(apt => apt.status === 'completed').length;

  const getDateRange = () => {
    if (view === "week") {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      return `${format(weekStart, "dd MMM", { locale: ptBR })} - ${format(weekEnd, "dd MMM yyyy", { locale: ptBR })}`;
    } else {
      return format(currentDate, "MMMM yyyy", { locale: ptBR });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      {/* Navegação e Data */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onNavigatePrevious}
            className="h-9 w-9 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onNavigateNext}
            className="h-9 w-9 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onToday}
            className="px-3"
          >
            Hoje
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 capitalize">
            {getDateRange()}
          </h2>
        </div>
      </div>

      {/* Resumo do Dia */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-blue-700 dark:text-blue-300 font-medium">
            {todayScheduled} agendados hoje
          </span>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="text-green-700 dark:text-green-300 font-medium">
            {todayCompleted} concluídos
          </span>
        </div>
        
        <div className="text-slate-600 dark:text-slate-400">
          <span className="font-medium">
            {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CalendarMainHeader;
