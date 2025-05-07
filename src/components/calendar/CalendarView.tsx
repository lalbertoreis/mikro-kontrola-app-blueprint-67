
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
    setCurrentDate,
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
    const matchesEmployee = !selectedEmployee || appointment.employeeId === selectedEmployee;
    const notCanceled = !hideCanceled || appointment.status !== 'canceled';
    return matchesEmployee && notCanceled;
  });

  // Convert Appointment[] to AppointmentWithDetails[] to match component props
  const appointmentsWithDetails = filteredAppointments.map(appointment => ({
    ...appointment,
    employee: appointment.employee || {
      id: appointment.employeeId,
      name: 'Unknown Employee',
      role: '',
      shifts: [],
      services: [],
      createdAt: '',
      updatedAt: ''
    },
    service: appointment.service || {
      id: appointment.serviceId || '',
      name: 'Unknown Service',
      price: 0,
      duration: 0,
      multipleAttendees: false,
      isActive: true,
      createdAt: '',
      updatedAt: ''
    },
    client: appointment.client || {
      id: appointment.clientId || '',
      name: 'Unknown Client',
      email: '',
      phone: '',
      cep: '',
      address: '',
      createdAt: '',
      updatedAt: ''
    }
  }));

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
                currentDate={currentDate}
                view={view}
                onNavigatePrevious={navigatePrevious}
                onNavigateNext={navigateNext}
                onToday={() => setCurrentDate(startOfToday())}
              />

              <EmployeeFilter
                employees={employees}
                selectedEmployeeId={selectedEmployee}
                onChange={setSelectedEmployee}
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
                appointments={appointmentsWithDetails}
                date={currentDate}
                employees={employees}
                selectedEmployee={selectedEmployee}
                onSelectAppointment={handleSelectAppointment}
                onSelectTimeSlot={handleOpenNewAppointment}
              />
            ) : (
              <MonthCalendar
                appointments={appointmentsWithDetails}
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
