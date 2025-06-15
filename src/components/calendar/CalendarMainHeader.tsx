
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Maximize, Minimize, Plus, Eye } from "lucide-react";
import { CalendarViewOptions } from "@/types/calendar";
import { Employee } from "@/types/employee";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
  isEmployeeView?: boolean;
}

const CalendarMainHeader: React.FC<CalendarMainHeaderProps> = ({
  currentDate,
  view,
  onNavigatePrevious,
  onNavigateNext,
  onToday,
  isMaximized,
  onToggleMaximized,
  onNewAppointment,
  onBlockTime,
  employees,
  selectedEmployeeId,
  onEmployeeChange,
  onViewChange,
  hideCanceled,
  onToggleHideCanceled,
  isEmployeeView = false,
}) => {
  const getDateDisplay = () => {
    if (view === "week") {
      return format(currentDate, "MMMM yyyy", { locale: ptBR });
    }
    return format(currentDate, "MMMM yyyy", { locale: ptBR });
  };

  const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);
  const headerTitle = isEmployeeView && selectedEmployee 
    ? `Minha Agenda - ${selectedEmployee.name}`
    : getDateDisplay();

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

        {/* Mobile controls - only show for employees when maximized */}
        {isMaximized && isEmployeeView && (
          <div className="flex items-center space-x-2">
            <Select value={view} onValueChange={(v) => onViewChange(v as "week" | "month")}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Semanal</SelectItem>
                <SelectItem value="month">Mensal</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="hide-canceled-header" 
                checked={hideCanceled} 
                onCheckedChange={onToggleHideCanceled}
              />
              <Label htmlFor="hide-canceled-header" className="text-sm">
                Ocultar Cancelados
              </Label>
            </div>
          </div>
        )}

        {/* Mobile controls for owners when maximized */}
        {isMaximized && !isEmployeeView && (
          <div className="flex items-center space-x-2">
            <Button onClick={onNewAppointment} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo
            </Button>
            
            <Button onClick={onBlockTime} variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Bloquear
            </Button>
            
            <Select value={view} onValueChange={(v) => onViewChange(v as "week" | "month")}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Semanal</SelectItem>
                <SelectItem value="month">Mensal</SelectItem>
              </SelectContent>
            </Select>

            {/* Employee filter for owners */}
            <Select 
              value={selectedEmployeeId || "all"} 
              onValueChange={(value) => onEmployeeChange(value === "all" ? undefined : value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue>
                  {selectedEmployee ? selectedEmployee.name : "Todos Funcionários"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Funcionários</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="hide-canceled-header" 
                checked={hideCanceled} 
                onCheckedChange={onToggleHideCanceled}
              />
              <Label htmlFor="hide-canceled-header" className="text-sm">
                Ocultar Cancelados
              </Label>
            </div>
          </div>
        )}
      </div>

      {/* Center - Date display */}
      <div className="flex-1 flex justify-center">
        <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-200 capitalize">
          {headerTitle}
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
