
import React, { useEffect } from "react";
import { useCalendarState } from "@/hooks/useCalendarState";
import { useAppointments } from "@/hooks/useAppointments";
import { useEmployees } from "@/hooks/useEmployees";
import { useEmployeePermissions } from "@/hooks/useAuth";
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
  const { checkEmployeePermissions } = useEmployeePermissions();
  const [isEmployee, setIsEmployee] = React.useState<boolean>(false);
  const [employeeData, setEmployeeData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  console.log("CalendarView render - user:", user?.id, "isEmployee:", isEmployee, "loading:", loading);

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

  // Verificar se é funcionário
  useEffect(() => {
    const checkEmployeeStatus = async () => {
      console.log("Checking employee status for user:", user?.id);
      
      if (!user) {
        console.log("No user found, setting loading to false");
        setLoading(false);
        return;
      }

      try {
        const permissions = await checkEmployeePermissions();
        console.log("Employee permissions result:", permissions);
        
        if (permissions) {
          setIsEmployee(true);
          setEmployeeData(permissions);
          // Automaticamente selecionar o funcionário logado
          setSelectedEmployee(permissions.employee_id);
          console.log("User is employee, selected employee:", permissions.employee_id);
        } else {
          setIsEmployee(false);
          console.log("User is not employee");
        }
      } catch (error) {
        console.error("Erro ao verificar permissões:", error);
        setIsEmployee(false);
      } finally {
        setLoading(false);
        console.log("Employee check completed, loading set to false");
      }
    };

    checkEmployeeStatus();
  }, [user, checkEmployeePermissions, setSelectedEmployee]);

  const appointmentsWithDetails = useFilteredAppointments({
    appointments,
    selectedEmployee,
    hideCanceled,
  });

  // Handler for selecting a time slot (to open new appointment or navigate to date)
  const handleSelectTimeSlot = (date: Date, hour?: number) => {
    console.log("handleSelectTimeSlot called - isEmployee:", isEmployee, "date:", date, "hour:", hour);
    
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

  // Show loading state
  if (loading) {
    console.log("Showing loading state");
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-slate-600 dark:text-slate-400">Carregando agenda...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show message if user is not authenticated
  if (!user) {
    console.log("No user authenticated, showing login message");
    return (
      <DashboardLayout>
        <div className="text-center py-10 text-muted-foreground">
          Você precisa estar logado para ver a agenda.
        </div>
      </DashboardLayout>
    );
  }

  console.log("Rendering calendar - isEmployee:", isEmployee, "isMaximized:", isMaximized);

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
              selectedEmployee={selectedEmployee}
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
            selectedEmployee={selectedEmployee}
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
          selectedEmployeeId={selectedEmployee}
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
            selectedEmployee={selectedEmployee}
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
          )}
        </CalendarLayout>
      </TooltipProvider>
    </DashboardLayout>
  );
}
