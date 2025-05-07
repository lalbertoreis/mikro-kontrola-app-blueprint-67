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
import { AppointmentWithDetails } from "@/types/calendar";
import { Employee } from "@/types/employee";
import AppointmentChip from "./AppointmentChip";

interface MonthCalendarProps {
  date: Date;
  appointments: AppointmentWithDetails[];
  employees: Employee[];
  selectedEmployee?: string;
  onSelectAppointment: (appointment: AppointmentWithDetails) => void;
  onSelectDate?: (date: Date) => void;
}

const WEEKDAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const MonthCalendar: React.FC<MonthCalendarProps> = ({ 
  date, 
  appointments, 
  employees, 
  selectedEmployee, 
  onSelectAppointment,
  onSelectDate 
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
  
  // Function to get employee color based on employeeId
  const getEmployeeColor = (employeeId: string) => {
    // Define color palette for employees
    const colors = [
      "bg-kontrola-600 text-white",
      "bg-blue-600 text-white",
      "bg-green-600 text-white",
      "bg-yellow-600 text-white",
      "bg-red-600 text-white",
      "bg-purple-600 text-white"
    ];
    
    // Find employee index and use modulo to cycle through colors if more employees than colors
    const employeeIndex = employees.findIndex(emp => emp.id === employeeId);
    return employeeIndex !== -1 ? colors[employeeIndex % colors.length] : colors[0];
  };

  return (
    <div className="border rounded-lg bg-white overflow-hidden">
      {/* Header with weekday names */}
      <div className="grid grid-cols-7">
        {WEEKDAY_NAMES.map((day) => (
          <div 
            key={day} 
            className="p-2 font-medium text-xs text-center border-b border-r last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, i) => {
          const isCurrentMonth = isSameMonth(day, date);
          const isCurrentDay = isToday(day);
          const dayAppointments = getAppointmentsForDay(day);
          const maxToShow = 3;
          
          return (
            <div 
              key={i}
              className={`min-h-[100px] p-1 border-b border-r last:border-r-0 ${
                isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'
              } ${isCurrentDay ? 'bg-accent/20' : ''}`}
              onClick={() => onSelectDate && onSelectDate(day)}
            >
              <div className="text-xs font-medium p-1">
                {format(day, "d")}
              </div>
              
              <div className="space-y-1 mt-1">
                {dayAppointments.slice(0, maxToShow).map(appointment => (
                  <AppointmentChip
                    key={appointment.id}
                    appointment={appointment}
                    colorClass={getEmployeeColor(appointment.employeeId)}
                    onClick={() => onSelectAppointment(appointment)}
                  />
                ))}
                
                {dayAppointments.length > maxToShow && (
                  <div className="text-xs text-center text-muted-foreground">
                    +{dayAppointments.length - maxToShow} mais
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthCalendar;
