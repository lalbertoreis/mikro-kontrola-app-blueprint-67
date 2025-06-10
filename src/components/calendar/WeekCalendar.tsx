
import React from "react";
import { format, startOfWeek, addDays, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppointmentWithDetails } from "@/types/calendar";
import { Employee } from "@/types/employee";
import AppointmentChip from "./AppointmentChip";

interface WeekCalendarProps {
  appointments: AppointmentWithDetails[];
  date: Date;
  employees: Employee[];
  selectedEmployee?: string;
  onSelectAppointment: (appointment: AppointmentWithDetails) => void;
  onSelectTimeSlot: (date: Date, hour?: number) => void;
}

const WeekCalendar: React.FC<WeekCalendarProps> = ({
  appointments,
  date,
  employees,
  selectedEmployee,
  onSelectAppointment,
  onSelectTimeSlot,
}) => {
  // Gerar horários de 6h às 22h
  const hours = Array.from({ length: 17 }, (_, i) => i + 6);
  
  // Gerar dias da semana
  const weekStart = startOfWeek(date, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Filtrar agendamentos para a semana atual
  const weekAppointments = appointments.filter(appointment => {
    const appointmentDate = typeof appointment.start === 'string' 
      ? parseISO(appointment.start) 
      : appointment.start;
    
    return weekDays.some(day => isSameDay(appointmentDate, day));
  });

  // Função para obter agendamentos de um dia e hora específicos
  const getAppointmentsForTimeSlot = (day: Date, hour: number) => {
    return weekAppointments.filter(appointment => {
      const appointmentDate = typeof appointment.start === 'string' 
        ? parseISO(appointment.start) 
        : appointment.start;
      
      return isSameDay(appointmentDate, day) && 
             appointmentDate.getHours() === hour;
    });
  };

  // Função para lidar com clique em slot de tempo
  const handleTimeSlotClick = (day: Date, hour: number) => {
    onSelectTimeSlot(day, hour);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      {/* Header com dias da semana - altura fixa */}
      <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-8 bg-slate-50 dark:bg-slate-800">
          {/* Coluna vazia para os horários */}
          <div className="p-4 border-r border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Horário</span>
          </div>
          
          {/* Colunas dos dias */}
          {weekDays.map((day, index) => (
            <div 
              key={index}
              className="p-4 text-center border-r border-slate-200 dark:border-slate-700 last:border-r-0"
            >
              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {format(day, "EEE", { locale: ptBR })}
              </div>
              <div className="text-lg font-semibold text-slate-700 dark:text-slate-300 mt-1">
                {format(day, "dd")}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid de horários - área scrollável */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full">
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-700 min-h-[80px]">
              {/* Coluna de horário */}
              <div className="p-3 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-start">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>
              
              {/* Colunas dos dias */}
              {weekDays.map((day, dayIndex) => {
                const dayAppointments = getAppointmentsForTimeSlot(day, hour);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div
                    key={dayIndex}
                    className={`
                      p-2 border-r border-slate-200 dark:border-slate-700 last:border-r-0 
                      relative cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 
                      transition-colors duration-150 min-h-[80px]
                      ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                    `}
                    onClick={() => handleTimeSlotClick(day, hour)}
                  >
                    {/* Indicador de hoje */}
                    {isToday && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                    
                    {/* Agendamentos */}
                    <div className="space-y-1">
                      {dayAppointments.map((appointment) => (
                        <AppointmentChip
                          key={appointment.id}
                          appointment={appointment}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectAppointment(appointment);
                          }}
                          showTime={true}
                          compact={false}
                        />
                      ))}
                    </div>
                    
                    {/* Placeholder para slot vazio */}
                    {dayAppointments.length === 0 && (
                      <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-600 text-xs opacity-0 hover:opacity-100 transition-opacity">
                        + Novo
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeekCalendar;
