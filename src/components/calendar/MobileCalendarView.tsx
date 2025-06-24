
import React, { useState, useEffect } from "react";
import { format, isSameDay, isToday, addDays, subDays, addWeeks, subWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Filter, Calendar, Clock, ChevronLeft, ChevronRight, Ban } from "lucide-react";
import { AppointmentWithDetails, CalendarViewOptions } from "@/types/calendar";
import { Employee } from "@/types/employee";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import DetailedCalendarView from "./DetailedCalendarView";

interface MobileCalendarViewProps {
  appointments: AppointmentWithDetails[];
  currentDate: Date;
  employees: Employee[];
  selectedEmployee?: string;
  view: CalendarViewOptions["view"];
  hideCanceled: boolean;
  onSelectAppointment: (appointment: AppointmentWithDetails) => void;
  onSelectTimeSlot: (date: Date, hour?: number) => void;
  onViewChange: (view: CalendarViewOptions["view"]) => void;
  onEmployeeChange: (employeeId?: string) => void;
  onToggleHideCanceled: () => void;
  onNewAppointment: () => void;
  onBlockTime: () => void;
  onGoToToday: () => void;
  onNavigatePrevious: () => void;
  onNavigateNext: () => void;
  onToggleMaximized: () => void;
  isLoading: boolean;
  isEmployeeView?: boolean;
}

const MobileCalendarView: React.FC<MobileCalendarViewProps> = ({
  appointments,
  currentDate,
  employees,
  selectedEmployee,
  view,
  hideCanceled,
  onSelectAppointment,
  onSelectTimeSlot,
  onViewChange,
  onEmployeeChange,
  onToggleHideCanceled,
  onNewAppointment,
  onBlockTime,
  onNavigatePrevious,
  onNavigateNext,
  isLoading,
  isEmployeeView = false,
}) => {
  const [detailedViewDate, setDetailedViewDate] = useState<Date>(currentDate);
  
  const selectedEmployee_ = employees.find(emp => emp.id === selectedEmployee);

  // Atualizar a data da visão detalhada quando currentDate mudar
  useEffect(() => {
    setDetailedViewDate(currentDate);
  }, [currentDate]);

  const handleNavigatePreviousWeek = () => {
    const previousWeek = subWeeks(detailedViewDate, 1);
    setDetailedViewDate(previousWeek);
    onSelectTimeSlot(previousWeek);
  };

  const handleNavigateNextWeek = () => {
    const nextWeek = addWeeks(detailedViewDate, 1);
    setDetailedViewDate(nextWeek);
    onSelectTimeSlot(nextWeek);
  };

  const handleDateChange = (date: Date) => {
    setDetailedViewDate(date);
    onSelectTimeSlot(date);
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Fixed Action Buttons at Top - Reorganized */}
      <div className="bg-background border-b p-3 space-y-2">
        {/* Primary Action Button - Full Width */}
        {!isEmployeeView && (
          <Button onClick={onNewAppointment} className="w-full" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Agendamento
          </Button>
        )}
        
        {/* Secondary Actions - Side by Side */}
        <div className="flex gap-2">
          {!isEmployeeView && (
            <Button onClick={onBlockTime} variant="outline" className="flex-1" size="sm">
              <Ban className="h-4 w-4 mr-1" />
              Bloquear
            </Button>
          )}
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex-1" size="sm">
                <Filter className="h-4 w-4 mr-1" />
                Filtros
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto">
              <SheetHeader>
                <SheetTitle>Filtros e Configurações</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-4">
                {!isEmployeeView && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Funcionário</Label>
                    <Select value={selectedEmployee || "all"} onValueChange={(value) => onEmployeeChange(value === "all" ? undefined : value)}>
                      <SelectTrigger>
                        <SelectValue>
                          {selectedEmployee_ ? selectedEmployee_.name : "Todos"}
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
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="hide-canceled-mobile" 
                    checked={hideCanceled} 
                    onCheckedChange={onToggleHideCanceled}
                  />
                  <Label htmlFor="hide-canceled-mobile">Ocultar Cancelados</Label>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleNavigatePreviousWeek}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-center">
            <h3 className="text-sm font-semibold">
              Semana de {format(detailedViewDate, "dd/MM", { locale: ptBR })}
            </h3>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleNavigateNextWeek}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Detailed Calendar View */}
      <DetailedCalendarView
        appointments={appointments}
        currentDate={detailedViewDate}
        employees={employees}
        selectedEmployee={selectedEmployee}
        onSelectAppointment={onSelectAppointment}
        onSelectTimeSlot={onSelectTimeSlot}
        onDateChange={handleDateChange}
        onBackToSimpleView={() => {}} // Not used in mobile default view
        isEmployeeView={isEmployeeView}
        isLoading={isLoading}
        showBackButton={false} // Hide back button in mobile default view
      />
    </div>
  );
};

export default MobileCalendarView;
