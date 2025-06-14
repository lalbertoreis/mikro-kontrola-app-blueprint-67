
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
  isEmployeeView?: boolean;
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
  isEmployeeView = false,
}) => {
  const handleTimeSlotSelect = isEmployeeView ? () => {} : onSelectTimeSlot;

  if (view === "week") {
    return (
      <WeekCalendar
        appointments={appointments}
        currentDate={currentDate}
        employees={employees}
        selectedEmployee={selectedEmployee}
        onSelectAppointment={onSelectAppointment}
        onSelectTimeSlot={handleTimeSlotSelect}
        isLoading={isLoading}
        isEmployeeView={isEmployeeView}
      />
    );
  }

  return (
    <MonthCalendar
      appointments={appointments}
      currentDate={currentDate}
      onSelectAppointment={onSelectAppointment}
      onSelectTimeSlot={handleTimeSlotSelect}
      setView={setView}
      isLoading={isLoading}
      isEmployeeView={isEmployeeView}
    />
  );
};

export default CalendarContent;
