
import React from "react";
import { format, addDays, startOfWeek, getDay, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppointmentWithDetails } from "@/types/calendar";
import { Employee } from "@/types/employee";
import AppointmentCard from "./AppointmentCard";

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
      "bg-kontrola-100 border-kontrola-600 text-kontrola-800",
      "bg-blue-100 border-blue-600 text-blue-800",
      "bg-green-100 border-green-600 text-green-800",
      "bg-yellow-100 border-yellow-600 text-yellow-800",
      "bg-red-100 border-red-600 text-red-800",
      "bg-purple-100 border-purple-600 text-purple-800"
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
    <div className="border rounded-lg bg-white overflow-hidden">
      {/* Header with days of the week */}
      <div className="grid grid-cols-8 border-b">
        <div className="p-2 font-medium text-sm text-center border-r"></div>
        {weekDates.map((day, index) => (
          <div 
            key={index} 
            className={`p-2 font-medium text-sm text-center ${
              index < 6 ? 'border-r' : ''
            } ${isSameDay(day, new Date()) ? 'bg-accent' : ''}`}
          >
            <div>{format(day, "EEE", { locale: ptBR })}</div>
            <div>{format(day, "dd/MM")}</div>
          </div>
        ))}
      </div>
      
      {/* Time slots */}
      {HOURS.map((hour) => (
        <div key={hour} className="grid grid-cols-8 border-b last:border-b-0">
          {/* Hour column */}
          <div className="p-2 text-xs font-medium text-center border-r">
            {`${hour}:00`}
          </div>
          
          {/* Days columns */}
          {weekDates.map((day, dayIndex) => {
            const appointmentsInSlot = getAppointmentsForTimeSlot(day, hour);
            
            return (
              <div 
                key={dayIndex} 
                className={`min-h-[80px] p-1 relative ${
                  dayIndex < 6 ? 'border-r' : ''
                } ${isSameDay(day, new Date()) ? 'bg-accent/20' : ''}`}
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
  );
};

export default WeekCalendar;
