
import React from "react";

interface EmployeeDebugInfoProps {
  employeeData: any;
  totalAppointments: number;
  filteredAppointments: number;
  finalAppointments: number;
  appointmentsLoading: boolean;
}

const EmployeeDebugInfo: React.FC<EmployeeDebugInfoProps> = ({
  employeeData,
  totalAppointments,
  filteredAppointments,
  finalAppointments,
  appointmentsLoading,
}) => {
  return (
    <div className="bg-yellow-50 p-4 rounded-lg mb-4 text-sm">
      <h4 className="font-medium text-yellow-900 mb-2">Debug da Agenda:</h4>
      <div className="text-yellow-800 space-y-1">
        <div><strong>Employee ID:</strong> {employeeData?.employee_id || 'UNDEFINED'}</div>
        <div><strong>Funcionário:</strong> {employeeData?.employee?.name || 'Não encontrado'}</div>
        <div><strong>User ID:</strong> {employeeData?.user_id || 'UNDEFINED'}</div>
        <div><strong>Pode ver agenda:</strong> {employeeData?.can_view_calendar ? 'Sim' : 'Não'}</div>
        <div><strong>Total de Agendamentos (sistema):</strong> {totalAppointments}</div>
        <div><strong>Agendamentos do Funcionário:</strong> {filteredAppointments}</div>
        <div><strong>Agendamentos Finais (com filtros):</strong> {finalAppointments}</div>
        <div><strong>Carregando:</strong> {appointmentsLoading ? 'Sim' : 'Não'}</div>
      </div>
    </div>
  );
};

export default EmployeeDebugInfo;
