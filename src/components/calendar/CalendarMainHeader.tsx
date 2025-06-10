
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Maximize, Minimize } from "lucide-react";
import { CalendarViewOptions } from "@/types/calendar";
import { Employee } from "@/types/employee";

interface CalendarMainHeaderProps {
  currentDate: Date;
  view: CalendarViewOptions["view"];
  onNavigatePrevious: () => void;
  onNavigateNext: () => void;
  onToday: () => void;
  isMaximized: boolean;
  onToggleMaximized: () => void;
  onNewAppointment: () => void;
  onBlockTime: () => void;
  employees: Employee[];
  selectedEmployeeId?: string;
  onEmployeeChange: (employeeId?: string) => void;
  onViewChange: (view: CalendarViewOptions["view"]) => void;
  hideCanceled: boolean;
  onToggleHideCanceled: () => void;
}

const CalendarMainHeader: React.FC<CalendarMainHeaderProps> = ({
  currentDate,
  view,
  onNavigatePrevious,
  onNavigateNext,
  onToday,
  isMaximized,
  onToggleMaximized,
}) => {
  const getDateDisplay = () => {
    if (view === "week") {
      return format(currentDate, "MMMM yyyy", { locale: ptBR });
    }
    return format(currentDate, "MMMM yyyy", { locale: ptBR });
  };

  return (
    <div className="flex items-center justify-between w-full">
      {/* Left side - Navigation */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onNavigatePrevious}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={onNavigateNext}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <Button
          variant="outline"
          onClick={onToday}
          className="text-sm"
        >
          Hoje
        </Button>
      </div>

      {/* Center - Date display */}
      <div className="flex-1 flex justify-center">
        <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-200 capitalize">
          {getDateDisplay()}
        </h1>
      </div>

      {/* Right side - Maximize/Minimize button */}
      <div className="flex items-center">
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleMaximized}
          className="h-8 w-8"
          title={isMaximized ? "Minimizar" : "Maximizar"}
        >
          {isMaximized ? (
            <Minimize className="h-4 w-4" />
          ) : (
            <Maximize className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default CalendarMainHeader;
