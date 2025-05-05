
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import WeekCalendar from "./WeekCalendar";
import MonthCalendar from "./MonthCalendar";
import EmployeeFilter from "./EmployeeFilter";
import { useEmployees } from "@/hooks/useEmployees";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarViewOptions, AppointmentWithDetails } from "@/types/calendar";
import AppointmentDialog from "./AppointmentDialog";
import BlockTimeDialog from "./BlockTimeDialog";
import AppointmentActionsDialog from "./AppointmentActionsDialog";
import { useAppointments } from "@/hooks/useAppointments";
import { format, addMonths, subMonths, addWeeks, subWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";

const CalendarView: React.FC = () => {
  const [view, setView] = useState<CalendarViewOptions["view"]>("week");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const { employees, isLoading } = useEmployees();
  const [selectedEmployee, setSelectedEmployee] = useState<string | undefined>();
  const { appointments } = useAppointments();

  // Dialog states
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [blockTimeDialogOpen, setBlockTimeDialogOpen] = useState(false);
  const [actionsDialogOpen, setActionsDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [dialogKey, setDialogKey] = useState(0); // Para forçar recriação do diálogo

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  const handleSelectAppointment = (appointment: AppointmentWithDetails) => {
    setSelectedAppointment(appointment);
    setActionsDialogOpen(true);
  };

  const handleEditAppointment = () => {
    setEditMode(true);
    setActionsDialogOpen(false);
    setAppointmentDialogOpen(true);
  };

  const navigatePrevious = () => {
    if (view === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const navigateNext = () => {
    if (view === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const handleOpenNewAppointment = () => {
    setEditMode(false);
    setDialogKey(prev => prev + 1); // Força recriação do diálogo para limpar cache
    setAppointmentDialogOpen(true);
  };

  const handleOpenBlockTime = () => {
    setDialogKey(prev => prev + 1); // Força recriação do diálogo para limpar cache
    setBlockTimeDialogOpen(true);
  };

  // Map appointments to AppointmentWithDetails
  const appointmentsWithDetails = appointments.map(appointment => {
    // Create objects for employee, service, and client with default values only if needed
    const employeeObject = appointment.employee || {
      id: appointment.employeeId,
      name: "Profissional não especificado",
      role: "",
      shifts: [],
      services: [],
      createdAt: "",
      updatedAt: ""
    };
    
    const serviceObject = appointment.service || {
      id: appointment.serviceId || "",
      name: "Serviço não especificado",
      price: 0,
      duration: 0,
      multipleAttendees: false,
      isActive: true,
      createdAt: "",
      updatedAt: ""
    };
    
    const clientObject = appointment.client || {
      id: appointment.clientId || "",
      name: "Cliente não especificado",
      email: "",
      phone: "",
      cep: "",
      address: "",
      createdAt: "",
      updatedAt: ""
    };

    return {
      ...appointment,
      employee: employeeObject,
      service: serviceObject,
      client: clientObject
    } as AppointmentWithDetails;
  });

  const formattedDate = view === "week" 
    ? format(currentDate, "'Semana de' dd 'de' MMMM", { locale: ptBR })
    : format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs defaultValue={view} onValueChange={(v) => setView(v as "week" | "month")}>
          <TabsList>
            <TabsTrigger value="week">Semana</TabsTrigger>
            <TabsTrigger value="month">Mês</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleOpenBlockTime}
          >
            Bloquear Horário
          </Button>
          <Button onClick={handleOpenNewAppointment}>
            <Plus className="mr-2 h-4 w-4" /> Agendar
          </Button>
        </div>
      </div>

      <EmployeeFilter
        employees={employees}
        selectedEmployeeId={selectedEmployee}
        onChange={setSelectedEmployee}
      />

      {/* Navegação do calendário */}
      <div className="flex items-center justify-between mb-2">
        <Button variant="outline" size="sm" onClick={navigatePrevious}>
          <ChevronLeft className="h-4 w-4" />
          {view === "week" ? "Semana anterior" : "Mês anterior"}
        </Button>
        
        <h2 className="text-lg font-medium capitalize">
          {formattedDate}
        </h2>
        
        <Button variant="outline" size="sm" onClick={navigateNext}>
          {view === "week" ? "Próxima semana" : "Próximo mês"}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {view === "week" ? (
        <WeekCalendar
          date={currentDate}
          appointments={appointmentsWithDetails}
          employees={employees}
          onSelectAppointment={handleSelectAppointment}
        />
      ) : (
        <MonthCalendar
          date={currentDate}
          appointments={appointmentsWithDetails}
          employees={employees}
          onSelectAppointment={handleSelectAppointment}
        />
      )}

      {/* Appointment Dialog */}
      <AppointmentDialog 
        key={`appointment-dialog-${dialogKey}`}
        isOpen={appointmentDialogOpen}
        onClose={() => setAppointmentDialogOpen(false)}
        selectedDate={currentDate}
        selectedEmployeeId={selectedEmployee}
        appointmentId={editMode ? selectedAppointment?.id : undefined}
      />

      {/* Block Time Dialog */}
      <BlockTimeDialog 
        key={`block-time-dialog-${dialogKey}`}
        isOpen={blockTimeDialogOpen}
        onClose={() => setBlockTimeDialogOpen(false)}
        selectedDate={currentDate}
        selectedEmployeeId={selectedEmployee}
      />

      {/* Appointment Actions Dialog */}
      <AppointmentActionsDialog
        open={actionsDialogOpen}
        onOpenChange={setActionsDialogOpen}
        appointment={selectedAppointment}
        onEdit={handleEditAppointment}
      />
    </div>
  );
};

export default CalendarView;
