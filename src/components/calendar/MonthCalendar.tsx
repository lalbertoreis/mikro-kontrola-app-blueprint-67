
import React from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday,
  isSameDay,
  startOfWeek,
  endOfWeek
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppointmentWithDetails, CalendarViewOptions } from "@/types/calendar";
import { Employee } from "@/types/employee";
import AppointmentChip from "./AppointmentChip";
import { TooltipProvider } from "@/components/ui/tooltip";

interface MonthCalendarProps {
  date: Date;
  appointments: AppointmentWithDetails[];
  employees: Employee[];
  selectedEmployee?: string;
  onSelectAppointment: (appointment: AppointmentWithDetails) => void;
  onSelectTimeSlot?: (date: Date) => void;
  setView: (view: CalendarViewOptions["view"]) => void;
  isLoading?: boolean;
  isEmployeeView?: boolean;
}

const WEEKDAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const MonthCalendar: React.FC<MonthCalendarProps> = ({ 
  date, 
  appointments, 
  employees, 
  selectedEmployee, 
  onSelectAppointment,
  onSelectTimeSlot,
  setView,
  isLoading = false,
  isEmployeeView = false
}) => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  
  // Get all days to display in the calendar grid
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  // Function to get appointments for a specific day
  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter(appointment => 
      isSameDay(new Date(appointment.start), day)
    );
  };

  // Handler for calendar day cell clicks
  const handleDayCellClick = (day: Date, event: React.MouseEvent) => {
    // Se for employee view, não permitir criar agendamentos
    if (isEmployeeView) return;
    
    // Only trigger for direct clicks on the cell, not when clicking on appointment chips
    if (event.currentTarget === event.target && onSelectTimeSlot) {
      onSelectTimeSlot(day);
    }
  };

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col">
        {/* Header with weekday names */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          {WEEKDAY_NAMES.map((day) => (
            <div 
              key={day} 
              className="p-4 font-medium text-sm text-center border-r border-slate-200 dark:border-slate-700 last:border-r-0"
            >
              <div className="text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                {day}
              </div>
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="flex-1 grid grid-cols-7 auto-rows-fr">
          {calendarDays.map((day, i) => {
            const isCurrentMonth = isSameMonth(day, date);
            const isCurrentDay = isToday(day);
            const dayAppointments = getAppointmentsForDay(day);
            const maxToShow = 2;
            
            return (
              <div 
                key={i}
                className={`min-h-[120px] p-2 border-b border-r border-slate-200 dark:border-slate-700 last:border-r-0 transition-all ${
                  isEmployeeView 
                    ? "cursor-default" 
                    : "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                } ${
                  isCurrentMonth ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/30'
                } ${isCurrentDay ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                onClick={(e) => handleDayCellClick(day, e)}
              >
                <div className={`text-sm font-medium p-1 mb-2 ${
                  isCurrentDay 
                    ? 'bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center' 
                    : isCurrentMonth 
                      ? 'text-slate-900 dark:text-slate-100' 
                      : 'text-slate-400 dark:text-slate-600'
                }`}>
                  {format(day, "d")}
                </div>
                
                <div className="space-y-1">
                  {dayAppointments.slice(0, maxToShow).map(appointment => (
                    <AppointmentChip
                      key={appointment.id}
                      appointment={appointment}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent day cell click
                        onSelectAppointment(appointment);
                      }}
                      showTime={true}
                      compact={true}
                    />
                  ))}
                  
                  {dayAppointments.length > maxToShow && (
                    <div className="text-xs text-center text-slate-500 dark:text-slate-400 p-1 bg-slate-100 dark:bg-slate-800 rounded">
                      +{dayAppointments.length - maxToShow} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default MonthCalendar;
