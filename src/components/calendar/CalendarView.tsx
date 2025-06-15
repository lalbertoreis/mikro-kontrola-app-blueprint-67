
import React from "react";
import { useCalendarState } from "@/hooks/useCalendarState";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployeeLogic } from "./CalendarEmployeeLogic";
import CalendarViewHeader from "./CalendarViewHeader";
import CalendarViewContent from "./CalendarViewContent";

export default function CalendarView() {
  const { user } = useAuth();
  const [isEmployee, setIsEmployee] = React.useState<boolean>(false);
  const [employeeData, setEmployeeData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  const calendarState = useCalendarState();
  const { setSelectedEmployee, isMaximized } = calendarState;

  // Use employee logic hook
  useEmployeeLogic({
    setIsEmployee,
    setEmployeeData,
    setLoading,
    setSelectedEmployee,
  });

  // Show loading or authentication states
  const headerComponent = CalendarViewHeader({ loading, user });
  if (headerComponent) {
    return headerComponent;
  }

  // Render main calendar content
  return (
    <CalendarViewContent
      calendarState={calendarState}
      isEmployee={isEmployee}
      employeeData={employeeData}
      isMaximized={isMaximized}
    />
  );
}
