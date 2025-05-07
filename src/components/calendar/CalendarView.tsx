
import React from "react";
import { startOfToday } from "date-fns";
import { useCalendarState } from "@/hooks/useCalendarState";
import { useAppointments } from "@/hooks/useAppointments";
import { useEmployees } from "@/hooks/useEmployees";
import CalendarHeader from "./CalendarHeader";
import CalendarNavigation from "./CalendarNavigation";
import EmployeeFilter from "./EmployeeFilter";
import WeekCalendar from "./WeekCalendar";
import MonthCalendar from "./MonthCalendar";
import CalendarDialogs from "./CalendarDialogs";
import { Card, CardContent } from "@/components/ui/card";

export default function CalendarView() {
  const {
    view,
    setView,
    currentDate,
    selectedEmployee,
    setSelectedEmployee,
    appointmentDialogOpen,
    setAppointmentDialogOpen,
    blockTimeDialogOpen,
    setBlockTimeDialogOpen,
    actionsDialogOpen,
    setActionsDialogOpen,
    selectedAppointment,
    editMode,
    dialogKey,
    hideCanceled,
    toggleHideCanceled,
    handleSelectAppointment,
    handleEditAppointment,
    navigatePrevious,
    navigateNext,
    handleOpenNewAppointment,
    handleOpenBlockTime,
  } = useCalendarState();

  const { appointments, isLoading } = useAppointments();
  const { employees } = useEmployees();

  // Filter appointments based on selected employee and canceled status
  const filteredAppointments = appointments.filter(appointment => {
    const matchesEmployee = !selectedEmployee || appointment.employee_id === selectedEmployee;
    const notCanceled = !hideCanceled || appointment.status !== 'canceled';
    return matchesEmployee && notCanceled;
  });

  return (
    <Card className="glass-panel">
      <CardContent className="p-0">
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <CalendarHeader 
              view={view}
              onViewChange={setView}
              onNewAppointment={handleOpenNewAppointment}
              onBlockTime={handleOpenBlockTime}
              hideCanceled={hideCanceled}
              onToggleHideCanceled={toggleHideCanceled}
            />

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CalendarNavigation 
                view={view}
                date={currentDate}
                onPrevious={navigatePrevious}
                onNext={navigateNext}
                onToday={() => setCurrentDate(startOfToday())}
              />

              <EmployeeFilter
                employees={employees}
                selectedEmployee={selectedEmployee}
                onSelectEmployee={setSelectedEmployee}
              />
            </div>
          </div>

          <div className="relative min-h-[500px]">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <p>Carregando agendamentos...</p>
              </div>
            ) : view === "week" ? (
              <WeekCalendar
                appointments={filteredAppointments}
                date={currentDate}
                employees={employees}
                selectedEmployee={selectedEmployee}
                onSelectAppointment={handleSelectAppointment}
                onSelectTimeSlot={handleOpenNewAppointment}
              />
            ) : (
              <MonthCalendar
                appointments={filteredAppointments}
                date={currentDate}
                employees={employees}
                selectedEmployee={selectedEmployee}
                onSelectAppointment={handleSelectAppointment}
                onSelectDate={(date) => {
                  setCurrentDate(date);
                  setView("week");
                }}
              />
            )}
          </div>

          <CalendarDialogs
            appointmentDialogOpen={appointmentDialogOpen}
            blockTimeDialogOpen={blockTimeDialogOpen}
            actionsDialogOpen={actionsDialogOpen}
            selectedAppointment={selectedAppointment}
            editMode={editMode}
            currentDate={currentDate}
            selectedEmployeeId={selectedEmployee}
            dialogKey={dialogKey}
            onAppointmentDialogClose={() => setAppointmentDialogOpen(false)}
            onBlockTimeDialogClose={() => setBlockTimeDialogOpen(false)}
            onActionsDialogOpenChange={setActionsDialogOpen}
            onEditAppointment={handleEditAppointment}
          />
        </div>
      </CardContent>
    </Card>
  );
}
