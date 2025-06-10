
import React from "react";
import { format, addDays, startOfWeek, getDay, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppointmentWithDetails } from "@/types/calendar";
import { Employee } from "@/types/employee";
import AppointmentCard from "./AppointmentCard";
import { TooltipProvider } from "@/components/ui/tooltip";

interface WeekCalendarProps {
  date: Date;
  appointments: AppointmentWithDetails[];
  employees: Employee[];
  selectedEmployee?: string;
  onSelectAppointment: (appointment: AppointmentWithDetails) => void;
  onSelectTimeSlot?: (date: Date, hour: number) => void;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 - 20:00
const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6]; // Sunday - Saturday

const WeekCalendar: React.FC<WeekCalendarProps> = ({ 
  date, 
  appointments, 
  employees,
  selectedEmployee, 
  onSelectAppointment,
  onSelectTimeSlot 
}) => {
  // Get the starting date of the week (Sunday)
  const weekStart = startOfWeek(date, { weekStartsOn: 0 });
  
  // Generate the dates for the week
  const weekDates = WEEKDAYS.map(day => addDays(weekStart, day));

  // Function to get appointments for a specific day and hour
  const getAppointmentsForTimeSlot = (day: Date, hour: number) => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.start);
      const appointmentHour = appointmentDate.getHours();
      return isSameDay(appointmentDate, day) && appointmentHour === hour;
    });
  };

  // Function to get employee color based on employeeId
  const getEmployeeColor = (employeeId: string) => {
    // Define color palette for employees
    const colors = [
      "bg-blue-100 border-blue-500 text-blue-900",
      "bg-green-100 border-green-500 text-green-900",
      "bg-purple-100 border-purple-500 text-purple-900",
      "bg-orange-100 border-orange-500 text-orange-900",
      "bg-pink-100 border-pink-500 text-pink-900",
      "bg-indigo-100 border-indigo-500 text-indigo-900"
    ];
    
    // Find employee index and use modulo to cycle through colors if more employees than colors
    const employeeIndex = employees.findIndex(emp => emp.id === employeeId);
    return employeeIndex !== -1 ? colors[employeeIndex % colors.length] : colors[0];
  };

  // Handler for empty time slot clicks
  const handleTimeSlotClick = (day: Date, hour: number, event: React.MouseEvent) => {
    // Only trigger for direct clicks on the cell, not when clicking on appointment cards
    if (event.currentTarget === event.target && onSelectTimeSlot) {
      onSelectTimeSlot(day, hour);
    }
  };

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col">
        {/* Header with days of the week */}
        <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <div className="p-2 lg:p-4 font-medium text-xs lg:text-sm text-center border-r border-slate-200 dark:border-slate-700">
            <div className="text-slate-600 dark:text-slate-400">Horário</div>
          </div>
          {weekDates.map((day, index) => (
            <div 
              key={index} 
              className={`p-2 lg:p-4 font-medium text-xs lg:text-sm text-center ${
                index < 6 ? 'border-r border-slate-200 dark:border-slate-700' : ''
              } ${isSameDay(day, new Date()) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
            >
              <div className="text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wide">
                {format(day, "EEE", { locale: ptBR })}
              </div>
              <div className={`text-sm lg:text-lg font-semibold mt-1 ${
                isSameDay(day, new Date()) ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-slate-100'
              }`}>
                {format(day, "dd")}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 hidden lg:block">
                {format(day, "MMM", { locale: ptBR })}
              </div>
            </div>
          ))}
        </div>
        
        {/* Time slots */}
        <div className="flex-1 overflow-auto">
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-slate-100 dark:border-slate-800 last:border-b-0 hover:bg-slate-25 dark:hover:bg-slate-800/50">
              {/* Hour column */}
              <div className="p-2 lg:p-3 text-xs lg:text-sm font-medium text-center border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <div className="text-slate-700 dark:text-slate-300">{`${hour}:00`}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 hidden lg:block">
                  {hour < 12 ? 'AM' : 'PM'}
                </div>
              </div>
              
              {/* Days columns */}
              {weekDates.map((day, dayIndex) => {
                const appointmentsInSlot = getAppointmentsForTimeSlot(day, hour);
                
                return (
                  <div 
                    key={dayIndex} 
                    className={`min-h-[60px] lg:min-h-[100px] p-1 lg:p-2 relative cursor-pointer transition-colors ${
                      dayIndex < 6 ? 'border-r border-slate-200 dark:border-slate-700' : ''
                    } ${isSameDay(day, new Date()) ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''} hover:bg-slate-50 dark:hover:bg-slate-800/30`}
                    onClick={(e) => handleTimeSlotClick(day, hour, e)}
                  >
                    {appointmentsInSlot.map((appointment) => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        colorClass={getEmployeeColor(appointment.employeeId)}
                        onClick={() => onSelectAppointment(appointment)}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default WeekCalendar;
