
import React from "react";
import { format, addDays, startOfWeek, isToday, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppointmentWithDetails } from "@/types/calendar";
import { Employee } from "@/types/employee";
import AppointmentCard from "./AppointmentCard";
import HolidayIndicator from "./HolidayIndicator";
import { useHolidaysByDate } from "@/hooks/useHolidaysByDate";

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
  const weekStart = startOfWeek(date, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7:00 to 20:00

  // Get holidays for each day of the week
  const holidayQueries = weekDays.map(day => 
    useHolidaysByDate(format(day, 'yyyy-MM-dd'))
  );

  const getAppointmentsForSlot = (day: Date, hour: number) => {
    return appointments.filter(appointment => {
      const appointmentStart = new Date(appointment.start);
      const appointmentHour = appointmentStart.getHours();
      
      return (
        isSameDay(appointmentStart, day) &&
        appointmentHour === hour &&
        (!selectedEmployee || appointment.employeeId === selectedEmployee)
      );
    });
  };

  const getHolidaysForDay = (dayIndex: number) => {
    const query = holidayQueries[dayIndex];
    return query.data || [];
  };

  const getAppointmentColorClass = (appointment: AppointmentWithDetails) => {
    // Return color class based on appointment status or employee
    switch (appointment.status) {
      case 'confirmed':
        return "bg-green-100 border-green-600 text-green-800";
      case 'canceled':
        return "bg-red-100 border-red-600 text-red-800";
      case 'no-show':
        return "bg-amber-100 border-amber-600 text-amber-800";
      case 'completed':
        return "bg-blue-100 border-blue-600 text-blue-800";
      case 'blocked':
        return "bg-red-100 border-red-600 text-red-800";
      default:
        return "bg-slate-100 border-slate-600 text-slate-800";
    }
  };

  const handleTimeSlotClick = (day: Date, hour: number) => {
    // Check if there are blocking holidays for this time slot
    const dayIndex = weekDays.findIndex(d => isSameDay(d, day));
    const holidays = getHolidaysForDay(dayIndex);
    
    const isBlocked = holidays.some(holiday => {
      if (!holiday.isActive) return false;
      
      switch (holiday.blockingType) {
        case 'full_day':
          return true;
        case 'morning':
          return hour < 12;
        case 'afternoon':
          return hour >= 12;
        case 'custom':
          if (holiday.customStartTime && holiday.customEndTime) {
            const [customStartHour] = holiday.customStartTime.split(':').map(Number);
            const [customEndHour] = holiday.customEndTime.split(':').map(Number);
            return hour >= customStartHour && hour < customEndHour;
          }
          return false;
        default:
          return false;
      }
    });

    if (isBlocked) {
      const blockingHoliday = holidays.find(holiday => {
        if (!holiday.isActive) return false;
        
        switch (holiday.blockingType) {
          case 'full_day':
            return true;
          case 'morning':
            return hour < 12;
          case 'afternoon':
            return hour >= 12;
          case 'custom':
            if (holiday.customStartTime && holiday.customEndTime) {
              const [customStartHour] = holiday.customStartTime.split(':').map(Number);
              const [customEndHour] = holiday.customEndTime.split(':').map(Number);
              return hour >= customStartHour && hour < customEndHour;
            }
            return false;
          default:
            return false;
        }
      });
      
      alert(`Agendamento bloqueado devido ao feriado: ${blockingHoliday?.name}`);
      return;
    }

    onSelectTimeSlot(day, hour);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header with days */}
      <div className="grid grid-cols-8 gap-px bg-slate-200 dark:bg-slate-800 border-b">
        <div className="bg-white dark:bg-slate-900 p-4 text-center font-medium">
          Horário
        </div>
        {weekDays.map((day, index) => {
          const holidays = getHolidaysForDay(index);
          const hasHoliday = holidays.length > 0;
          
          return (
            <div
              key={day.toISOString()}
              className={`bg-white dark:bg-slate-900 p-4 text-center relative ${
                isToday(day) ? "bg-blue-50 dark:bg-blue-950" : ""
              } ${hasHoliday ? "bg-red-50 dark:bg-red-950" : ""}`}
            >
              {hasHoliday && (
                <HolidayIndicator 
                  holiday={holidays[0]} 
                  date={day}
                  className="rounded-t-lg"
                />
              )}
              <div className="relative z-10">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {format(day, "EEE", { locale: ptBR })}
                </div>
                <div className={`text-lg font-semibold ${
                  isToday(day) ? "text-blue-600 dark:text-blue-400" : ""
                }`}>
                  {format(day, "d")}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-8 gap-px bg-slate-200 dark:bg-slate-800">
          {hours.map((hour) => (
            <React.Fragment key={hour}>
              {/* Hour label */}
              <div className="bg-white dark:bg-slate-900 p-2 text-center text-sm font-medium border-r">
                {hour.toString().padStart(2, "0")}:00
              </div>
              
              {/* Day columns */}
              {weekDays.map((day, dayIndex) => {
                const slotAppointments = getAppointmentsForSlot(day, hour);
                const holidays = getHolidaysForDay(dayIndex);
                const hasBlockingHoliday = holidays.some(holiday => {
                  if (!holiday.isActive) return false;
                  
                  switch (holiday.blockingType) {
                    case 'full_day':
                      return true;
                    case 'morning':
                      return hour < 12;
                    case 'afternoon':
                      return hour >= 12;
                    case 'custom':
                      if (holiday.customStartTime && holiday.customEndTime) {
                        const [customStartHour] = holiday.customStartTime.split(':').map(Number);
                        const [customEndHour] = holiday.customEndTime.split(':').map(Number);
                        return hour >= customStartHour && hour < customEndHour;
                      }
                      return false;
                    default:
                      return false;
                  }
                });
                
                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className={`bg-white dark:bg-slate-900 p-1 min-h-[60px] border-b border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 relative ${
                      hasBlockingHoliday ? "bg-red-50 dark:bg-red-950 cursor-not-allowed" : ""
                    }`}
                    onClick={() => handleTimeSlotClick(day, hour)}
                  >
                    {hasBlockingHoliday && (
                      <div className="absolute inset-0 bg-red-100 dark:bg-red-900 opacity-50 flex items-center justify-center">
                        <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                          Bloqueado
                        </span>
                      </div>
                    )}
                    
                    <div className="space-y-1 relative z-10">
                      {slotAppointments.map((appointment) => (
                        <AppointmentCard
                          key={appointment.id}
                          appointment={appointment}
                          colorClass={getAppointmentColorClass(appointment)}
                          onClick={() => onSelectAppointment(appointment)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeekCalendar;
