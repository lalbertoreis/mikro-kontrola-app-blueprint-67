
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Maximize2,
  Minimize2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { CalendarViewOptions } from "@/types/calendar";
import type { Employee } from "@/types/employee";

interface CalendarMainHeaderProps {
  view: CalendarViewOptions["view"];
  currentDate: Date;
  onNavigatePrevious: () => void;
  onNavigateNext: () => void;
  onToday: () => void;
  isMaximized: boolean;
  onToggleMaximized: () => void;
  selectedEmployeeId?: string;
  employees: Employee[];
  onEmployeeChange: (employeeId: string | undefined) => void;
  onViewChange: (view: CalendarViewOptions["view"]) => void;
  hideCanceled: boolean;
  onToggleHideCanceled: () => void;
  onNewAppointment: () => void;
  onBlockTime: () => void;
  isEmployeeView?: boolean;
}

const CalendarMainHeader: React.FC<CalendarMainHeaderProps> = ({
  view,
  currentDate,
  onNavigatePrevious,
  onNavigateNext,
  onToday,
  isMaximized,
  onToggleMaximized,
  selectedEmployeeId,
  employees,
  onEmployeeChange,
  onViewChange,
  hideCanceled,
  onToggleHideCanceled,
  onNewAppointment,
  onBlockTime,
  isEmployeeView = false,
}) => {
  const getDateRangeText = () => {
    if (view === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 });
      const end = endOfWeek(currentDate, { weekStartsOn: 0 });
      return `${format(start, "dd/MM", { locale: ptBR })} - ${format(end, "dd/MM/yyyy", { locale: ptBR })}`;
    } else {
      return format(currentDate, "MMMM yyyy", { locale: ptBR });
    }
  };

  return (
    <div className="flex flex-col space-y-4 mb-6">
      {/* Top row - Navigation and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Date navigation */}
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={onNavigatePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onToday}>
              Hoje
            </Button>
            <Button variant="outline" size="sm" onClick={onNavigateNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Current period display */}
          <div className="text-lg font-semibold">
            {getDateRangeText()}
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-2">
          {!isEmployeeView && (
            <>
              <Button onClick={onNewAppointment} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Novo Agendamento
              </Button>
              <Button onClick={onBlockTime} variant="outline" size="sm">
                <Clock className="h-4 w-4 mr-1" />
                Bloquear Horário
              </Button>
            </>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleMaximized}
          >
            {isMaximized ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Bottom row - Filters and view controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Employee filter - hidden for employee view */}
          {!isEmployeeView && (
            <div className="flex items-center space-x-2">
              <Label htmlFor="employee-select">Funcionário:</Label>
              <Select
                value={selectedEmployeeId || "all"}
                onValueChange={(value) => onEmployeeChange(value === "all" ? undefined : value)}
              >
                <SelectTrigger className="w-[200px]" id="employee-select">
                  <SelectValue placeholder="Todos os funcionários" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os funcionários</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Hide canceled toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="hide-canceled"
              checked={hideCanceled}
              onCheckedChange={onToggleHideCanceled}
            />
            <Label htmlFor="hide-canceled">Ocultar cancelados</Label>
          </div>
        </div>

        {/* View selector - hidden for employee view */}
        {!isEmployeeView && (
          <div className="flex items-center space-x-2">
            <Button
              variant={view === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => onViewChange("week")}
            >
              Semana
            </Button>
            <Button
              variant={view === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => onViewChange("month")}
            >
              Mês
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarMainHeader;
