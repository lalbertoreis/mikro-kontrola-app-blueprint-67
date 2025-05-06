
import React from "react";
import WeekCalendar from "./WeekCalendar";
import MonthCalendar from "./MonthCalendar";
import { AppointmentWithDetails } from "@/types/calendar";
import { Employee } from "@/types/employee";
import { CalendarViewOptions } from "@/types/calendar";

interface CalendarContentProps {
  view: CalendarViewOptions["view"];
  currentDate: Date;
  appointments: AppointmentWithDetails[];
  employees: Employee[];
  onSelectAppointment: (appointment: AppointmentWithDetails) => void;
}

const CalendarContent: React.FC<CalendarContentProps> = ({
  view,
  currentDate,
  appointments,
  employees,
  onSelectAppointment,
}) => {
  return (
    <>
      {view === "week" ? (
        <WeekCalendar
          date={currentDate}
          appointments={appointments}
          employees={employees}
          onSelectAppointment={onSelectAppointment}
        />
      ) : (
        <MonthCalendar
          date={currentDate}
          appointments={appointments}
          employees={employees}
          onSelectAppointment={onSelectAppointment}
        />
      )}
    </>
  );
};

export default CalendarContent;
