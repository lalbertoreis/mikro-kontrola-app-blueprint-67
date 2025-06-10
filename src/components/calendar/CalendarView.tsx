
import React from "react";
import { useCalendarState } from "@/hooks/useCalendarState";
import { useAppointments } from "@/hooks/useAppointments";
import { useEmployees } from "@/hooks/useEmployees";
import CalendarSidebar from "./CalendarSidebar";
import CalendarMainHeader from "./CalendarMainHeader";
import WeekCalendar from "./WeekCalendar";
import MonthCalendar from "./MonthCalendar";
import CalendarDialogs from "./CalendarDialogs";
import MobileCalendarView from "./MobileCalendarView";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

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
    selectedTimeSlot,
    setSelectedTimeSlot,
    handleSelectAppointment,
    handleEditAppointment,
    navigatePrevious,
    navigateNext,
    handleOpenNewAppointment,
    handleOpenBlockTime,
    goToToday,
  } = useCalendarState();

  const { appointments, isLoading } = useAppointments();
  const { employees } = useEmployees();
  const isMobile = useIsMobile();

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

  // Handler for selecting a time slot (to open new appointment)
  const handleSelectTimeSlot = (date: Date, hour?: number) => {
    setSelectedTimeSlot({ date, hour });
    handleOpenNewAppointment();
  };

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900">
        {/* Mobile Header */}
        <CalendarMainHeader
          currentDate={currentDate}
          view={view}
          onNavigatePrevious={navigatePrevious}
          onNavigateNext={navigateNext}
          onToday={goToToday}
        />

        {/* Mobile Calendar View */}
        <MobileCalendarView
          appointments={appointmentsWithDetails}
          currentDate={currentDate}
          employees={employees}
          selectedEmployee={selectedEmployee}
          view={view}
          hideCanceled={hideCanceled}
          onSelectAppointment={handleSelectAppointment}
          onSelectTimeSlot={handleSelectTimeSlot}
          onViewChange={setView}
          onEmployeeChange={setSelectedEmployee}
          onToggleHideCanceled={toggleHideCanceled}
          onNewAppointment={handleOpenNewAppointment}
          onBlockTime={handleOpenBlockTime}
          isLoading={isLoading}
        />

        {/* Dialogs */}
        <CalendarDialogs
          appointmentDialogOpen={appointmentDialogOpen}
          blockTimeDialogOpen={blockTimeDialogOpen}
          actionsDialogOpen={actionsDialogOpen}
          selectedAppointment={selectedAppointment}
          editMode={editMode}
          currentDate={selectedTimeSlot?.date || currentDate}
          selectedEmployeeId={selectedEmployee}
          selectedTimeSlot={selectedTimeSlot}
          dialogKey={dialogKey}
          onAppointmentDialogClose={() => {
            setAppointmentDialogOpen(false);
            setSelectedTimeSlot(null);
          }}
          onBlockTimeDialogClose={() => setBlockTimeDialogOpen(false)}
          onActionsDialogOpenChange={setActionsDialogOpen}
          onEditAppointment={handleEditAppointment}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 max-w-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 p-4 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 overflow-y-auto">
        <CalendarSidebar
          view={view}
          onViewChange={setView}
          employees={employees}
          selectedEmployeeId={selectedEmployee}
          onEmployeeChange={setSelectedEmployee}
          hideCanceled={hideCanceled}
          onToggleHideCanceled={toggleHideCanceled}
          onNewAppointment={handleOpenNewAppointment}
          onBlockTime={handleOpenBlockTime}
          onGoToToday={goToToday}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <CalendarMainHeader
          currentDate={currentDate}
          view={view}
          onNavigatePrevious={navigatePrevious}
          onNavigateNext={navigateNext}
          onToday={goToToday}
        />

        {/* Calendar Content */}
        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          <Card className="h-full max-w-none">
            <CardContent className="p-0 h-full">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-slate-600 dark:text-slate-400">Carregando agendamentos...</p>
                  </div>
                </div>
              ) : view === "week" ? (
                <WeekCalendar
                  appointments={appointmentsWithDetails}
                  date={currentDate}
                  employees={employees}
                  selectedEmployee={selectedEmployee}
                  onSelectAppointment={handleSelectAppointment}
                  onSelectTimeSlot={handleSelectTimeSlot}
                />
              ) : (
                <MonthCalendar
                  appointments={appointmentsWithDetails}
                  date={currentDate}
                  employees={employees}
                  selectedEmployee={selectedEmployee}
                  onSelectAppointment={handleSelectAppointment}
                  onSelectDate={(date) => {
                    setView("week");
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <CalendarDialogs
        appointmentDialogOpen={appointmentDialogOpen}
        blockTimeDialogOpen={blockTimeDialogOpen}
        actionsDialogOpen={actionsDialogOpen}
        selectedAppointment={selectedAppointment}
        editMode={editMode}
        currentDate={selectedTimeSlot?.date || currentDate}
        selectedEmployeeId={selectedEmployee}
        selectedTimeSlot={selectedTimeSlot}
        dialogKey={dialogKey}
        onAppointmentDialogClose={() => {
          setAppointmentDialogOpen(false);
          setSelectedTimeSlot(null);
        }}
        onBlockTimeDialogClose={() => setBlockTimeDialogOpen(false)}
        onActionsDialogOpenChange={setActionsDialogOpen}
        onEditAppointment={handleEditAppointment}
      />
    </div>
  );
}
