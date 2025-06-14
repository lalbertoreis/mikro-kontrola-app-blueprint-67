
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEmployeeCalendarData } from "./employee/useEmployeeCalendarData";
import EmployeeLoadingState from "./employee/EmployeeLoadingState";
import EmployeeAccessDenied from "./employee/EmployeeAccessDenied";
import EmployeeCalendarContent from "./employee/EmployeeCalendarContent";

export default function EmployeeCalendarView() {
  const {
    user,
    employeeData,
    loading,
    accessDenied,
    appointments,
    appointmentsLoading,
    employees,
    employeeAppointments,
    appointmentsWithDetails,
  } = useEmployeeCalendarData();

  if (loading) {
    return <EmployeeLoadingState />;
  }

  if (accessDenied || !employeeData) {
    return (
      <EmployeeAccessDenied
        userId={user?.id}
        employeeData={employeeData}
        accessDenied={accessDenied}
      />
    );
  }

  return (
    <DashboardLayout>
      <TooltipProvider>
        <div className="space-y-4">
          <EmployeeCalendarContent
            employeeData={employeeData}
            appointmentsWithDetails={appointmentsWithDetails}
            employees={employees}
            appointmentsLoading={appointmentsLoading}
            totalAppointments={appointments.length}
            filteredAppointments={employeeAppointments.length}
          />
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
}
