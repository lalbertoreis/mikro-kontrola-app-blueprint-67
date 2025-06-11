
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
import DashboardLayout from "@/components/layout/DashboardLayout";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";

export default function CalendarView() {
  const { user } = useAuth();
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
    selectedTimeSlot,
    setSelectedTimeSlot,
    isMaximized,
    toggleMaximized,
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

  // Handler for selecting a time slot (to open new appointment or navigate to date)
  const handleSelectTimeSlot = (date: Date, hour?: number) => {
    // If it's just a date selection (no hour), update the current date
    if (!hour) {
      setCurrentDate(date);
      return;
    }
    
    // If it includes an hour, open the appointment dialog
    setSelectedTimeSlot({ date, hour });
    handleOpenNewAppointment();
  };

  // Show message if user is not authenticated
  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-10 text-muted-foreground">
          Você precisa estar logado para ver a agenda.
        </div>
      </DashboardLayout>
    );
  }

  // Maximized layout (fullscreen)
  if (isMaximized) {
    return (
      <TooltipProvider>
        <div className="h-screen w-screen bg-slate-50 dark:bg-slate-900">
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
            isMaximized={isMaximized}
            onToggleMaximized={toggleMaximized}
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
        </div>
      </TooltipProvider>
    );
  }

  // Mobile layout
  if (isMobile) {
    return (
      <DashboardLayout>
        <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-900">
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
            onGoToToday={goToToday}
            onNavigatePrevious={navigatePrevious}
            onNavigateNext={navigateNext}
            onToggleMaximized={toggleMaximized}
            isLoading={isLoading}
          />

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
      </DashboardLayout>
    );
  }

  // Desktop layout
  return (
    <DashboardLayout>
      <TooltipProvider>
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
          isMaximized={isMaximized}
          onToggleMaximized={toggleMaximized}
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
      </TooltipProvider>
    </DashboardLayout>
  );
}
