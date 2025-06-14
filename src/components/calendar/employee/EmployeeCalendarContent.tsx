
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";
import { useCalendarState } from "@/hooks/useCalendarState";
import CalendarMainHeader from "../CalendarMainHeader";
import CalendarContent from "../CalendarContent";
import EmployeeDebugInfo from "./EmployeeDebugInfo";
import EmployeePermissionsInfo from "./EmployeePermissionsInfo";
import { AppointmentWithDetails } from "@/types/calendar";
import { Employee } from "@/types/employee";

interface EmployeeCalendarContentProps {
  employeeData: any;
  appointmentsWithDetails: AppointmentWithDetails[];
  employees: Employee[];
  appointmentsLoading: boolean;
  totalAppointments: number;
  filteredAppointments: number;
}

const EmployeeCalendarContent: React.FC<EmployeeCalendarContentProps> = ({
  employeeData,
  appointmentsWithDetails,
  employees,
  appointmentsLoading,
  totalAppointments,
  filteredAppointments,
}) => {
  const {
    view,
    currentDate,
    handleSelectAppointment,
    navigatePrevious,
    navigateNext,
    goToToday,
    isMaximized,
    toggleMaximized,
  } = useCalendarState();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Minha Agenda - {employeeData.employee?.name || 'Funcionário'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Debug info detalhado */}
        <EmployeeDebugInfo
          employeeData={employeeData}
          totalAppointments={totalAppointments}
          filteredAppointments={filteredAppointments}
          finalAppointments={appointmentsWithDetails.length}
          appointmentsLoading={appointmentsLoading}
        />

        <EmployeePermissionsInfo />
        
        {/* Header do calendário com navegação */}
        <CalendarMainHeader
          view={view}
          currentDate={currentDate}
          onNavigatePrevious={navigatePrevious}
          onNavigateNext={navigateNext}
          onToday={goToToday}
          isMaximized={isMaximized}
          onToggleMaximized={toggleMaximized}
          selectedEmployeeId={employeeData.employee?.id}
          employees={employees}
          onEmployeeChange={() => {}} // Funcionário não pode trocar de funcionário
          onViewChange={() => {}} // View fixa para funcionários
          hideCanceled={false}
          onToggleHideCanceled={() => {}} // Sempre mostrar todos
          onNewAppointment={() => {}} // Funcionários não podem criar agendamentos
          onBlockTime={() => {}} // Funcionários não podem bloquear horários
        />
        
        {/* Conteúdo do calendário */}
        <CalendarContent
          view={view}
          appointments={appointmentsWithDetails}
          currentDate={currentDate}
          employees={employees}
          selectedEmployee={employeeData.employee?.id}
          onSelectAppointment={handleSelectAppointment}
          onSelectTimeSlot={() => {}} // Funcionários não podem criar agendamentos
          setView={() => {}} // View fixa para funcionários
          isLoading={appointmentsLoading}
          isEmployeeView={true}
        />
      </CardContent>
    </Card>
  );
};

export default EmployeeCalendarContent;
