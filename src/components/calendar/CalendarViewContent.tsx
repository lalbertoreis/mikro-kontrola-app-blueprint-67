
import React from "react";
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

interface CalendarViewContentProps {
  calendarState: any;
  isEmployee: boolean;
  employeeData: any;
  isMaximized: boolean;
}

const CalendarViewContent: React.FC<CalendarViewContentProps> = ({
  calendarState,
  isEmployee,
  employeeData,
  isMaximized,
}) => {
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
    toggleMaximized,
    handleSelectAppointment,
    handleEditAppointment,
    navigatePrevious,
    navigateNext,
    handleOpenNewAppointment,
    handleOpenBlockTime,
    goToToday,
  } = calendarState;

  const { appointments, isLoading } = useAppointments();
  const { employees } = useEmployees();
  const isMobile = useIsMobile();

  // Aplicar filtragem dos agendamentos
  const appointmentsWithDetails = useFilteredAppointments({
    appointments,
    selectedEmployee: isEmployee ? employeeData?.employee_id : selectedEmployee,
    hideCanceled,
  });

  // Handler for selecting a time slot (restrict for employees)
  const handleSelectTimeSlot = (date: Date, hour?: number) => {
    // Se é funcionário, não permite criar agendamentos
    if (isEmployee) {
      // Apenas navegar para a data
      if (!hour) {
        setCurrentDate(date);
      }
      return;
    }
    
    // If it's just a date selection (no hour), update the current date
    if (!hour) {
      setCurrentDate(date);
      return;
    }
    
    // If it includes an hour, open the appointment dialog
    setSelectedTimeSlot({ date, hour });
    handleOpenNewAppointment();
  };

  // Maximized layout (fullscreen)
  if (isMaximized) {
    return (
      <TooltipProvider>
        <div className="h-screen w-screen bg-slate-50 dark:bg-slate-900">
          <CalendarLayout
            view={view}
            onViewChange={setView}
            employees={employees}
            selectedEmployeeId={isEmployee ? employeeData?.employee_id : selectedEmployee}
            onEmployeeChange={isEmployee ? () => {} : setSelectedEmployee}
            hideCanceled={hideCanceled}
            onToggleHideCanceled={toggleHideCanceled}
            onNewAppointment={isEmployee ? () => {} : handleOpenNewAppointment}
            onBlockTime={isEmployee ? () => {} : handleOpenBlockTime}
            onGoToToday={goToToday}
            currentDate={currentDate}
            onNavigatePrevious={navigatePrevious}
            onNavigateNext={navigateNext}
            isMaximized={isMaximized}
            onToggleMaximized={toggleMaximized}
            isEmployeeView={isEmployee}
          >
            <CalendarContent
              view={view}
              appointments={appointmentsWithDetails}
              currentDate={currentDate}
              employees={employees}
              selectedEmployee={isEmployee ? employeeData?.employee_id : selectedEmployee}
              onSelectAppointment={handleSelectAppointment}
              onSelectTimeSlot={handleSelectTimeSlot}
              setView={setView}
              isLoading={isLoading}
              isEmployeeView={isEmployee}
            />

            {!isEmployee && (
              <CalendarDialogs
                appointmentDialogOpen={appointmentDialogOpen}
                blockTimeDialogOpen={blockTimeDialogOpen}
                actionsDialogOpen={actionsDialogOpen}
                selectedAppointment={selectedAppointment}
                editMode={editMode}
                currentDate={selectedTimeSlot?.date || currentDate}
                selectedEmployeeId={isEmployee ? employeeData?.employee_id : selectedEmployee}
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
            )}
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
            selectedEmployee={isEmployee ? employeeData?.employee_id : selectedEmployee}
            view={view}
            hideCanceled={hideCanceled}
            onSelectAppointment={handleSelectAppointment}
            onSelectTimeSlot={handleSelectTimeSlot}
            onViewChange={setView}
            onEmployeeChange={isEmployee ? () => {} : setSelectedEmployee}
            onToggleHideCanceled={toggleHideCanceled}
            onNewAppointment={isEmployee ? () => {} : handleOpenNewAppointment}
            onBlockTime={isEmployee ? () => {} : handleOpenBlockTime}
            onGoToToday={goToToday}
            onNavigatePrevious={navigatePrevious}
            onNavigateNext={navigateNext}
            onToggleMaximized={toggleMaximized}
            isLoading={isLoading}
            isEmployeeView={isEmployee}
          />

          {!isEmployee && (
            <CalendarDialogs
              appointmentDialogOpen={appointmentDialogOpen}
              blockTimeDialogOpen={blockTimeDialogOpen}
              actionsDialogOpen={actionsDialogOpen}
              selectedAppointment={selectedAppointment}
              editMode={editMode}
              currentDate={selectedTimeSlot?.date || currentDate}
              selectedEmployeeId={isEmployee ? employeeData?.employee_id : selectedEmployee}
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
          )}
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
          selectedEmployeeId={isEmployee ? employeeData?.employee_id : selectedEmployee}
          onEmployeeChange={isEmployee ? () => {} : setSelectedEmployee}
          hideCanceled={hideCanceled}
          onToggleHideCanceled={toggleHideCanceled}
          onNewAppointment={isEmployee ? () => {} : handleOpenNewAppointment}
          onBlockTime={isEmployee ? () => {} : handleOpenBlockTime}
          onGoToToday={goToToday}
          currentDate={currentDate}
          onNavigatePrevious={navigatePrevious}
          onNavigateNext={navigateNext}
          isMaximized={isMaximized}
          onToggleMaximized={toggleMaximized}
          isEmployeeView={isEmployee}
        >
          <CalendarContent
            view={view}
            appointments={appointmentsWithDetails}
            currentDate={currentDate}
            employees={employees}
            selectedEmployee={isEmployee ? employeeData?.employee_id : selectedEmployee}
            onSelectAppointment={handleSelectAppointment}
            onSelectTimeSlot={handleSelectTimeSlot}
            setView={setView}
            isLoading={isLoading}
            isEmployeeView={isEmployee}
          />

          {!isEmployee && (
            <CalendarDialogs
              appointmentDialogOpen={appointmentDialogOpen}
              blockTimeDialogOpen={blockTimeDialogOpen}
              actionsDialogOpen={actionsDialogOpen}
              selectedAppointment={selectedAppointment}
              editMode={editMode}
              currentDate={selectedTimeSlot?.date || currentDate}
              selectedEmployeeId={isEmployee ? employeeData?.employee_id : selectedEmployee}
              selectedTimeSlot={selectedTimeSlot}
              dialogKey={dialogKey}
              onAppointmentDialogClose={() => {
                setAppointmentDialogOpen(false);
                setSelectedTimeSlot(null);
              }}
              onBlockTimeDialogClose={() => setBlockTimeDialogClose(false)}
              onActionsDialogOpenChange={setActionsDialogOpen}
              onEditAppointment={handleEditAppointment}
            />
          )}
        </CalendarLayout>
      </TooltipProvider>
    </DashboardLayout>
  );
};

export default CalendarViewContent;
