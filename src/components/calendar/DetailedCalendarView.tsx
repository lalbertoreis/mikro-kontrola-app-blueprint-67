
import React, { useState } from "react";
import { format, addDays, subDays, startOfWeek, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Clock, Ban, Calendar as CalendarIcon } from "lucide-react";
import { AppointmentWithDetails } from "@/types/calendar";
import { Employee } from "@/types/employee";
import { useHolidaysByDate } from "@/hooks/useHolidaysByDate";
import HolidayIndicator from "./HolidayIndicator";

interface DetailedCalendarViewProps {
  appointments: AppointmentWithDetails[];
  currentDate: Date;
  employees: Employee[];
  selectedEmployee?: string;
  onSelectAppointment: (appointment: AppointmentWithDetails) => void;
  onSelectTimeSlot: (date: Date, hour?: number) => void;
  onDateChange: (date: Date) => void;
  onBackToSimpleView: () => void;
  isEmployeeView?: boolean;
  isLoading: boolean;
  showBackButton?: boolean;
}

const DetailedCalendarView: React.FC<DetailedCalendarViewProps> = ({
  appointments,
  currentDate,
  employees,
  selectedEmployee,
  onSelectAppointment,
  onSelectTimeSlot,
  onDateChange,
  onBackToSimpleView,
  isEmployeeView = false,
  isLoading,
  showBackButton = true,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(currentDate);

  // Gerar os 7 dias da semana baseado na data atual
  const generateWeekDays = () => {
    const days = [];
    const startWeek = startOfWeek(currentDate, { weekStartsOn: 0 }); // Domingo como primeiro dia
    for (let i = 0; i < 7; i++) {
      days.push(addDays(startWeek, i));
    }
    return days;
  };

  const weekDays = generateWeekDays();

  // Hook para buscar feriados do dia selecionado
  const { data: holidays = [] } = useHolidaysByDate(format(selectedDate, "yyyy-MM-dd"));

  // Gerar horários do expediente (7h às 20h)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 7; hour <= 20; hour++) {
      slots.push(hour);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Filtrar agendamentos do dia selecionado
  const dayAppointments = appointments.filter(appointment =>
    isSameDay(new Date(appointment.start), selectedDate)
  );

  // Função para obter agendamento de um horário específico
  const getAppointmentForSlot = (hour: number) => {
    return dayAppointments.find(appointment => {
      const appointmentHour = new Date(appointment.start).getHours();
      return appointmentHour === hour;
    });
  };

  // Função para verificar se um horário está bloqueado por feriado
  const isSlotBlockedByHoliday = (hour: number) => {
    return holidays.some(holiday => {
      if (holiday.blockingType === 'full_day') return true;
      if (holiday.blockingType === 'morning' && hour < 12) return true;
      if (holiday.blockingType === 'afternoon' && hour >= 12) return true;
      if (holiday.blockingType === 'custom') {
        const startHour = holiday.customStartTime ? parseInt(holiday.customStartTime.split(':')[0]) : 0;
        const endHour = holiday.customEndTime ? parseInt(holiday.customEndTime.split(':')[0]) : 24;
        return hour >= startHour && hour < endHour;
      }
      return false;
    });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onDateChange(date);
  };

  const handleTimeSlotClick = (hour: number) => {
    const appointment = getAppointmentForSlot(hour);
    if (appointment) {
      onSelectAppointment(appointment);
    } else if (!isEmployeeView && !isSlotBlockedByHoliday(hour)) {
      onSelectTimeSlot(selectedDate, hour);
    }
  };

  const getSlotContent = (hour: number) => {
    const appointment = getAppointmentForSlot(hour);
    const isBlocked = isSlotBlockedByHoliday(hour);
    
    if (appointment) {
      const statusColors = {
        'scheduled': 'bg-blue-100 border-blue-300 text-blue-800',
        'confirmed': 'bg-green-100 border-green-300 text-green-800',
        'completed': 'bg-gray-100 border-gray-300 text-gray-800',
        'canceled': 'bg-red-100 border-red-300 text-red-800',
        'blocked': 'bg-orange-100 border-orange-300 text-orange-800',
      };
      
      const colorClass = statusColors[appointment.status as keyof typeof statusColors] || statusColors.scheduled;
      
      return (
        <div className={`p-2 rounded border-2 ${colorClass} cursor-pointer`}>
          <div className="text-xs font-medium truncate">{appointment.service.name}</div>
          <div className="text-xs truncate">{appointment.client.name}</div>
          <div className="text-xs">{appointment.employee.name}</div>
        </div>
      );
    }
    
    if (isBlocked) {
      return (
        <div className="p-2 rounded border-2 bg-red-50 border-red-200 text-red-600">
          <div className="flex items-center justify-center">
            <Ban className="h-4 w-4" />
          </div>
          <div className="text-xs text-center mt-1">Bloqueado</div>
        </div>
      );
    }
    
    return (
      <div className={`p-2 rounded border-2 border-dashed border-gray-200 text-gray-400 ${!isEmployeeView ? 'cursor-pointer hover:border-gray-300 hover:bg-gray-50' : ''}`}>
        <div className="text-xs text-center">Disponível</div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Navegação de dias - 7 dias com nomes abreviados */}
      <div className="p-2 bg-background border-b">
        <ScrollArea className="w-full">
          <div className="flex gap-1 pb-2 overflow-x-auto">
            {weekDays.map((day, index) => {
              const isSelected = isSameDay(day, selectedDate);
              const isDayToday = isToday(day);
              
              return (
                <Button
                  key={index}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className={`min-w-[42px] flex-col h-auto py-1.5 px-1 text-xs flex-shrink-0 ${isDayToday ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => handleDateSelect(day)}
                >
                  <div className="font-medium leading-tight text-[10px]">
                    {format(day, "E", { locale: ptBR })}
                  </div>
                  <div className="leading-tight text-[11px]">
                    {format(day, "dd")}
                  </div>
                  {isDayToday && (
                    <Badge variant="secondary" className="text-[8px] mt-0.5 px-1 py-0 h-3">
                      Hoje
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Header do dia selecionado */}
      <div className="p-4 bg-background border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </h3>
            <p className="text-sm text-muted-foreground">
              {dayAppointments.length} agendamento{dayAppointments.length !== 1 ? 's' : ''}
            </p>
          </div>
          {holidays.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              Feriado
            </Badge>
          )}
        </div>
      </div>

      {/* Grade de horários - 07:00 às 20:00 */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-slate-600 dark:text-slate-400">Carregando...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {timeSlots.map((hour) => (
              <div key={hour} className="flex items-center gap-3">
                <div className="w-16 text-sm font-medium text-muted-foreground">
                  {String(hour).padStart(2, '0')}:00
                </div>
                <div 
                  className="flex-1"
                  onClick={() => handleTimeSlotClick(hour)}
                >
                  {getSlotContent(hour)}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Indicadores de feriados se houver */}
      {holidays.map((holiday) => (
        <HolidayIndicator
          key={holiday.id}
          holiday={holiday}
          date={selectedDate}
          className="hidden"
        />
      ))}
    </div>
  );
};

export default DetailedCalendarView;
