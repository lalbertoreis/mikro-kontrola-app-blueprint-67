
import React from "react";
import { useEmployees } from "@/hooks/useEmployees";
import { useAppointments } from "@/hooks/useAppointments";
import { AppointmentWithDetails } from "@/types/calendar";
import EmployeeFilter from "./EmployeeFilter";
import CalendarHeader from "./CalendarHeader";
import CalendarNavigation from "./CalendarNavigation";
import CalendarContent from "./CalendarContent";
import CalendarDialogs from "./CalendarDialogs";
import { useCalendarState } from "@/hooks/useCalendarState";

const CalendarView: React.FC = () => {
  const { employees, isLoading } = useEmployees();
  const { appointments } = useAppointments();
  
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
    handleSelectAppointment,
    handleEditAppointment,
    navigatePrevious,
    navigateNext,
    handleOpenNewAppointment,
    handleOpenBlockTime,
  } = useCalendarState();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  // Filter out canceled appointments
  const filteredAppointments = appointments.filter(appointment => 
    appointment.status !== 'canceled'
  );

  // Map appointments to AppointmentWithDetails with complete employee, service, and client objects
  const appointmentsWithDetails = filteredAppointments.map(appointment => {
    return {
      ...appointment,
      employee: appointment.employee || {
        id: appointment.employeeId,
        name: "Profissional não especificado",
        role: "",
        shifts: [],
        services: [],
        createdAt: "",
        updatedAt: ""
      },
      service: appointment.service || {
        id: appointment.serviceId || "",
        name: "Serviço não especificado",
        price: 0,
        duration: 0,
        multipleAttendees: false,
        isActive: true,
        createdAt: "",
        updatedAt: ""
      },
      client: appointment.client || {
        id: appointment.clientId || "",
        name: "Cliente não especificado",
        email: "",
        phone: "",
        cep: "",
        address: "",
        createdAt: "",
        updatedAt: ""
      }
    } as AppointmentWithDetails;
  });

  return (
    <div className="space-y-4">
      {/* Calendar Header with View Tabs and Action Buttons */}
      <CalendarHeader
        view={view}
        onViewChange={setView}
        onNewAppointment={handleOpenNewAppointment}
        onBlockTime={handleOpenBlockTime}
      />

      {/* Employee Filter */}
      <EmployeeFilter
        employees={employees}
        selectedEmployeeId={selectedEmployee}
        onChange={setSelectedEmployee}
      />

      {/* Calendar Navigation */}
      <CalendarNavigation
        currentDate={currentDate}
        view={view}
        onNavigatePrevious={navigatePrevious}
        onNavigateNext={navigateNext}
      />

      {/* Calendar Content */}
      <CalendarContent
        view={view}
        currentDate={currentDate}
        appointments={appointmentsWithDetails}
        employees={employees}
        onSelectAppointment={handleSelectAppointment}
      />

      {/* Calendar Dialogs */}
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
  );
};

export default CalendarView;
