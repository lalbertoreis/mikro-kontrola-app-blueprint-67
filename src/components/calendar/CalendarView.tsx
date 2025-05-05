
import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Filter, CalendarPlus, CalendarX } from "lucide-react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, addWeeks, subWeeks, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { CalendarViewOptions } from "@/types/calendar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmployeeFilter from "./EmployeeFilter";
import WeekCalendar from "./WeekCalendar";
import MonthCalendar from "./MonthCalendar";
import AppointmentDialog from "./AppointmentDialog";
import BlockTimeDialog from "./BlockTimeDialog";
import { useAppointments } from "@/hooks/useAppointments";
import { useEmployees } from "@/hooks/useEmployees";

const CalendarView: React.FC = () => {
  const [calendarOptions, setCalendarOptions] = useState<CalendarViewOptions>({
    view: 'week',
    date: new Date(),
  });
  
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [isBlockTimeDialogOpen, setIsBlockTimeDialogOpen] = useState(false);

  const { appointments, isLoading } = useAppointments();
  const { employees } = useEmployees();

  const handleViewChange = (view: 'week' | 'month') => {
    setCalendarOptions((prev) => ({ ...prev, view }));
  };

  const handleDateChange = (direction: 'prev' | 'next') => {
    setCalendarOptions((prev) => {
      const { view, date } = prev;
      if (view === 'week') {
        return {
          ...prev,
          date: direction === 'prev' ? subWeeks(date, 1) : addWeeks(date, 1),
        };
      } else {
        return {
          ...prev,
          date: direction === 'prev' ? subMonths(date, 1) : addMonths(date, 1),
        };
      }
    });
  };

  const handleEmployeeFilter = (employeeId?: string) => {
    setCalendarOptions((prev) => ({ ...prev, employeeId }));
  };

  const formatDateRange = () => {
    const { view, date } = calendarOptions;
    
    if (view === 'week') {
      const start = startOfWeek(date, { weekStartsOn: 0 });
      const end = endOfWeek(date, { weekStartsOn: 0 });
      return `${format(start, "dd 'de' MMMM", { locale: ptBR })} - ${format(end, "dd 'de' MMMM", { locale: ptBR })}`;
    } else {
      return format(date, "MMMM 'de' yyyy", { locale: ptBR });
    }
  };

  // Filter appointments based on current view and filters
  const getFilteredAppointments = () => {
    if (isLoading) return [];
    
    const { view, date, employeeId } = calendarOptions;
    let startDate: Date;
    let endDate: Date;

    if (view === 'week') {
      startDate = startOfWeek(date, { weekStartsOn: 0 });
      endDate = endOfWeek(date, { weekStartsOn: 0 });
    } else {
      startDate = startOfMonth(date);
      endDate = endOfMonth(date);
    }

    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.start);
      const isInDateRange = appointmentDate >= startDate && appointmentDate <= endDate;
      const matchesEmployee = !employeeId || appointment.employeeId === employeeId;
      
      return isInDateRange && matchesEmployee;
    });
  };

  // Convert appointments to format expected by calendar components  
  const convertToAppointmentWithDetails = () => {
    return getFilteredAppointments().map(appointment => {
      const employee = employees.find(e => e.id === appointment.employeeId) || {
        id: appointment.employeeId,
        name: "Desconhecido",
        role: "",
        shifts: [],
        services: [],
        createdAt: "",
        updatedAt: "",
      };

      return {
        ...appointment,
        employee,
        service: {
          id: appointment.serviceId || "",
          name: appointment.title,
          price: 0,
          duration: 0,
          multipleAttendees: false,
          isActive: true,
          createdAt: "",
          updatedAt: "",
        },
        client: {
          id: appointment.clientId || "",
          name: "Cliente",
          email: "",
          phone: "",
          cep: "",
          address: "",
          createdAt: "",
          updatedAt: "",
        }
      };
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <CalendarIcon className="mr-2 h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-medium">{formatDateRange()}</h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <EmployeeFilter 
            employees={employees}
            selectedEmployeeId={calendarOptions.employeeId}
            onChange={handleEmployeeFilter}
          />
          
          <div className="flex items-center space-x-1">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleDateChange('prev')}
            >
              Anterior
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleDateChange('next')}
            >
              Próximo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCalendarOptions(prev => ({ ...prev, date: new Date() }))}
            >
              Hoje
            </Button>
          </div>
          
          <Tabs 
            value={calendarOptions.view} 
            onValueChange={(value) => handleViewChange(value as 'week' | 'month')}
            className="ml-2"
          >
            <TabsList>
              <TabsTrigger value="week">Semana</TabsTrigger>
              <TabsTrigger value="month">Mês</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center space-x-2">
            <Button 
              size="sm"
              onClick={() => setIsAppointmentDialogOpen(true)}
            >
              <CalendarPlus className="mr-2 h-4 w-4" />
              Novo Agendamento
            </Button>
            
            <Button 
              variant="secondary"
              size="sm"
              onClick={() => setIsBlockTimeDialogOpen(true)}
            >
              <CalendarX className="mr-2 h-4 w-4" />
              Bloquear Horário
            </Button>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <p>Carregando agenda...</p>
        </div>
      ) : calendarOptions.view === 'week' ? (
        <WeekCalendar 
          date={calendarOptions.date} 
          appointments={convertToAppointmentWithDetails()}
          employees={employees}
        />
      ) : (
        <MonthCalendar 
          date={calendarOptions.date} 
          appointments={convertToAppointmentWithDetails()}
          employees={employees}
        />
      )}
      
      <AppointmentDialog 
        isOpen={isAppointmentDialogOpen}
        onClose={() => setIsAppointmentDialogOpen(false)}
        selectedDate={calendarOptions.date}
        selectedEmployeeId={calendarOptions.employeeId}
      />
      
      <BlockTimeDialog
        isOpen={isBlockTimeDialogOpen}
        onClose={() => setIsBlockTimeDialogOpen(false)}
        selectedDate={calendarOptions.date}
        selectedEmployeeId={calendarOptions.employeeId}
      />
    </div>
  );
};

export default CalendarView;
