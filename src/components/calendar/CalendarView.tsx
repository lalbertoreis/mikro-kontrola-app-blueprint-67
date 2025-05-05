
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import WeekCalendar from "./WeekCalendar";
import MonthCalendar from "./MonthCalendar";
import EmployeeFilter from "./EmployeeFilter";
import { useEmployees } from "@/hooks/useEmployees";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarViewOptions, AppointmentWithDetails } from "@/types/calendar";
import AppointmentDialog from "./AppointmentDialog";
import BlockTimeDialog from "./BlockTimeDialog";
import AppointmentActionsDialog from "./AppointmentActionsDialog";

const CalendarView: React.FC = () => {
  const [view, setView] = useState<CalendarViewOptions["view"]>("week");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const { employees, isLoading } = useEmployees();
  const [selectedEmployee, setSelectedEmployee] = useState<string | undefined>();

  // Dialog states
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [blockTimeDialogOpen, setBlockTimeDialogOpen] = useState(false);
  const [actionsDialogOpen, setActionsDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [editMode, setEditMode] = useState(false);

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
            onClick={() => setBlockTimeDialogOpen(true)}
          >
            Bloquear Horário
          </Button>
          <Button onClick={() => {
            setEditMode(false);
            setAppointmentDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" /> Agendar
          </Button>
        </div>
      </div>

      <EmployeeFilter
        employees={employees}
        selectedEmployeeId={selectedEmployee}
        onChange={setSelectedEmployee}
      />

      {view === "week" ? (
        <WeekCalendar
          date={currentDate}
          onDateChange={setCurrentDate}
          employeeId={selectedEmployee}
          onSelectAppointment={handleSelectAppointment}
        />
      ) : (
        <MonthCalendar
          date={currentDate}
          onDateChange={setCurrentDate}
          employeeId={selectedEmployee}
          onSelectAppointment={handleSelectAppointment}
        />
      )}

      {/* Appointment Dialog */}
      <AppointmentDialog 
        open={appointmentDialogOpen}
        onOpenChange={setAppointmentDialogOpen}
        appointmentId={editMode && selectedAppointment ? selectedAppointment.id : undefined}
      />

      {/* Block Time Dialog */}
      <BlockTimeDialog 
        open={blockTimeDialogOpen}
        onOpenChange={setBlockTimeDialogOpen}
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
