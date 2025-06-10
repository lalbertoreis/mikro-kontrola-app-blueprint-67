
import React from "react";
import WeekCalendar from "./WeekCalendar";
import MonthCalendar from "./MonthCalendar";
import { AppointmentWithDetails, CalendarViewOptions } from "@/types/calendar";
import { Employee } from "@/types/employee";

interface CalendarContentProps {
  view: CalendarViewOptions["view"];
  appointments: AppointmentWithDetails[];
  currentDate: Date;
  employees: Employee[];
  selectedEmployee?: string;
  onSelectAppointment: (appointment: AppointmentWithDetails) => void;
  onSelectTimeSlot: (date: Date, hour?: number) => void;
  setView: (view: CalendarViewOptions["view"]) => void;
  isLoading: boolean;
}

const CalendarContent: React.FC<CalendarContentProps> = ({
  view,
  appointments,
  currentDate,
  employees,
  selectedEmployee,
  onSelectAppointment,
  onSelectTimeSlot,
  setView,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400">Carregando agendamentos...</p>
        </div>
      </div>
    );
  }

  if (view === "week") {
    return (
      <WeekCalendar
        appointments={appointments}
        date={currentDate}
        employees={employees}
        selectedEmployee={selectedEmployee}
        onSelectAppointment={onSelectAppointment}
        onSelectTimeSlot={onSelectTimeSlot}
      />
    );
  }

  return (
    <MonthCalendar
      appointments={appointments}
      date={currentDate}
      employees={employees}
      selectedEmployee={selectedEmployee}
      onSelectAppointment={onSelectAppointment}
      onSelectDate={(date) => {
        setView("week");
      }}
    />
  );
};

export default CalendarContent;
