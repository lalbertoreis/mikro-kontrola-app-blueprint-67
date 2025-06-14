
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";
import { useCalendarState } from "@/hooks/useCalendarState";
import { useFilteredAppointments } from "./CalendarFilters";
import CalendarMainHeader from "./CalendarMainHeader";
import CalendarContent from "./CalendarContent";
import CalendarDialogs from "./CalendarDialogs";
import { useAppointments } from "@/hooks/useAppointments";
import { useEmployees } from "@/hooks/useEmployees";

interface CalendarLayoutProps {
  isEmployeeView?: boolean;
  employeeId?: string;
}

const CalendarLayout: React.FC<CalendarLayoutProps> = ({
  isEmployeeView = false,
  employeeId,
}) => {
  const {
    view,
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
    setSelectedAppointment,
    editMode,
    setEditMode,
    dialogKey,
    hideCanceled,
    selectedTimeSlot,
    setSelectedTimeSlot,
    isMaximized,
    toggleHideCanceled,
    toggleMaximized,
    handleSelectAppointment,
    handleEditAppointment,
    navigatePrevious,
    navigateNext,
    handleOpenNewAppointment,
    handleOpenBlockTime,
    goToToday,
  } = useCalendarState();

  const { appointments, isLoading: appointmentsLoading } = useAppointments();
  const { employees } = useEmployees();

  // Se for vista de funcionário, usar o employeeId fixo
  const effectiveSelectedEmployee = isEmployeeView ? employeeId : selectedEmployee;

  const appointmentsWithDetails = useFilteredAppointments({
    appointments,
    selectedEmployee: effectiveSelectedEmployee,
    hideCanceled,
  });

  // Encontrar dados do funcionário se for vista de funcionário
  const employee = isEmployeeView && employeeId
    ? employees.find(emp => emp.id === employeeId)
    : null;

  const handleEmployeeChange = (newEmployeeId: string | undefined) => {
    // Se for vista de funcionário, não permitir mudança
    if (!isEmployeeView) {
      setSelectedEmployee(newEmployeeId);
    }
  };

  const handleNewAppointment = () => {
    // Funcionários não podem criar agendamentos
    if (!isEmployeeView) {
      handleOpenNewAppointment();
    }
  };

  const handleBlockTime = () => {
    // Funcionários não podem bloquear horários
    if (!isEmployeeView) {
      handleOpenBlockTime();
    }
  };

  const calendarTitle = isEmployeeView && employee
    ? `Minha Agenda - ${employee.name}`
    : "Agenda";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          {calendarTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Header do calendário com navegação */}
        <CalendarMainHeader
          view={view}
          currentDate={currentDate}
          onNavigatePrevious={navigatePrevious}
          onNavigateNext={navigateNext}
          onToday={goToToday}
          isMaximized={isMaximized}
          onToggleMaximized={toggleMaximized}
          selectedEmployeeId={effectiveSelectedEmployee}
          employees={employees}
          onEmployeeChange={handleEmployeeChange}
          onViewChange={() => {}} // View fixa para funcionários
          hideCanceled={hideCanceled}
          onToggleHideCanceled={toggleHideCanceled}
          onNewAppointment={handleNewAppointment}
          onBlockTime={handleBlockTime}
          isEmployeeView={isEmployeeView}
        />
        
        {/* Conteúdo do calendário */}
        <CalendarContent
          view={view}
          appointments={appointmentsWithDetails}
          currentDate={currentDate}
          employees={employees}
          selectedEmployee={effectiveSelectedEmployee}
          onSelectAppointment={handleSelectAppointment}
          onSelectTimeSlot={setSelectedTimeSlot}
          setView={() => {}} // View fixa para funcionários
          isLoading={appointmentsLoading}
          isEmployeeView={isEmployeeView}
        />

        {/* Diálogos */}
        {!isEmployeeView && (
          <CalendarDialogs
            appointmentDialogOpen={appointmentDialogOpen}
            setAppointmentDialogOpen={setAppointmentDialogOpen}
            blockTimeDialogOpen={blockTimeDialogOpen}
            setBlockTimeDialogOpen={setBlockTimeDialogOpen}
            actionsDialogOpen={actionsDialogOpen}
            setActionsDialogOpen={setActionsDialogOpen}
            selectedAppointment={selectedAppointment}
            setSelectedAppointment={setSelectedAppointment}
            editMode={editMode}
            setEditMode={setEditMode}
            dialogKey={dialogKey}
            selectedTimeSlot={selectedTimeSlot}
            setSelectedTimeSlot={setSelectedTimeSlot}
            selectedEmployee={effectiveSelectedEmployee}
            onEditAppointment={handleEditAppointment}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default CalendarLayout;
