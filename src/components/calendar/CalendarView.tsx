
import React from "react";
import { useCalendarState } from "@/hooks/useCalendarState";
import { useAppointments } from "@/hooks/useAppointments";
import { useEmployees } from "@/hooks/useEmployees";
import CalendarDialogs from "./CalendarDialogs";
import MobileCalendarView from "./MobileCalendarView";
import CalendarLayout from "./CalendarLayout";
import CalendarContent from "./CalendarContent";
import { useFilteredAppointments } from "./CalendarFilters";
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

  const appointmentsWithDetails = useFilteredAppointments({
    appointments,
    selectedEmployee,
    hideCanceled,
  });

  // Handler for selecting a time slot (to open new appointment)
  const handleSelectTimeSlot = (date: Date, hour?: number) => {
    setSelectedTimeSlot({ date, hour });
    handleOpenNewAppointment();
  };

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900">
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
    <CalendarLayout
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
      currentDate={currentDate}
      onNavigatePrevious={navigatePrevious}
      onNavigateNext={navigateNext}
    >
      <CalendarContent
        view={view}
        appointments={appointmentsWithDetails}
        currentDate={currentDate}
        employees={employees}
        selectedEmployee={selectedEmployee}
        onSelectAppointment={handleSelectAppointment}
        onSelectTimeSlot={handleSelectTimeSlot}
        setView={setView}
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
    </CalendarLayout>
  );
}
