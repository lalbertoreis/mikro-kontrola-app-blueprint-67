
import React, { useState } from "react";
import { format, isSameDay, isToday, addDays, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Filter, Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
  isLoading,
}) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(currentDate);

  const todayAppointments = appointments.filter(appointment =>
    isSameDay(new Date(appointment.start), currentDate)
  );

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'scheduled': { label: 'Agendado', variant: 'secondary' as const },
      'confirmed': { label: 'Confirmado', variant: 'default' as const },
      'completed': { label: 'Concluído', variant: 'outline' as const },
      'canceled': { label: 'Cancelado', variant: 'destructive' as const },
      'blocked': { label: 'Bloqueado', variant: 'destructive' as const },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.scheduled;
  };

  const selectedEmployee_ = employees.find(emp => emp.id === selectedEmployee);

  const handlePreviousDay = () => {
    const previousDay = subDays(currentDate, 1);
    setSelectedCalendarDate(previousDay);
    // Simulate the navigation by updating the date through existing props
    // This will trigger the parent component to update currentDate
    onSelectTimeSlot(previousDay);
  };

  const handleNextDay = () => {
    const nextDay = addDays(currentDate, 1);
    setSelectedCalendarDate(nextDay);
    // Simulate the navigation by updating the date through existing props
    onSelectTimeSlot(nextDay);
  };

  const handleCalendarDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedCalendarDate(date);
      setCalendarOpen(false);
      // Update the parent component's date
      onSelectTimeSlot(date);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={onNewAppointment} className="flex-1" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto">
            <SheetHeader>
              <SheetTitle>Filtros e Configurações</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Visualização</Label>
                <Select value={view} onValueChange={(v) => onViewChange(v as "week" | "month")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Semanal</SelectItem>
                    <SelectItem value="month">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
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
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="hide-canceled-mobile" 
                  checked={hideCanceled} 
                  onCheckedChange={onToggleHideCanceled}
                />
                <Label htmlFor="hide-canceled-mobile">Ocultar Cancelados</Label>
              </div>
              
              <Button onClick={onBlockTime} variant="outline" className="w-full">
                Bloquear Horário
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Date Navigation Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousDay}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="font-medium text-left">
                    <Calendar className="h-4 w-4 mr-2" />
                    {format(currentDate, "dd/MM/yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedCalendarDate}
                    onSelect={handleCalendarDateSelect}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextDay}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <Badge variant="outline">
              {todayAppointments.length} agendamento{todayAppointments.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          
          <div className="mt-2">
            <h3 className="text-lg font-semibold">
              {format(currentDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isToday(currentDate) ? "Hoje" : format(currentDate, "yyyy")}
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Appointments List */}
      <div className="flex-1 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-slate-600 dark:text-slate-400">Carregando...</p>
            </div>
          </div>
        ) : todayAppointments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Nenhum agendamento para esta data</p>
              <Button 
                onClick={() => onSelectTimeSlot(currentDate)} 
                variant="outline" 
                size="sm" 
                className="mt-3"
              >
                Criar Agendamento
              </Button>
            </CardContent>
          </Card>
        ) : (
          todayAppointments
            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
            .map((appointment) => {
              const statusBadge = getStatusBadge(appointment.status);
              return (
                <Card 
                  key={appointment.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onSelectAppointment(appointment)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {format(new Date(appointment.start), "HH:mm")} - {format(new Date(appointment.end), "HH:mm")}
                          </span>
                        </div>
                        <h4 className="font-semibold text-sm mb-1">{appointment.service.name}</h4>
                        <p className="text-sm text-muted-foreground mb-1">{appointment.client.name}</p>
                        <p className="text-xs text-muted-foreground">{appointment.employee.name}</p>
                      </div>
                      <Badge variant={statusBadge.variant}>
                        {statusBadge.label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })
        )}
      </div>
    </div>
  );
};

export default MobileCalendarView;
