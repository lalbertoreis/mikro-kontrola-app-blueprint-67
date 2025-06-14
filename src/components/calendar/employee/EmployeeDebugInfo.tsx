
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
        <div>Dados do funcionário: {JSON.stringify(employeeData, null, 2)}</div>
        <div>Funcionário: {employeeData?.employee?.name || 'Não encontrado'}</div>
        <div>ID do Funcionário (employee): {employeeData?.employee?.id || 'UNDEFINED'}</div>
        <div>ID do Funcionário (employee_id): {employeeData?.employee_id || 'UNDEFINED'}</div>
        <div>Total de Agendamentos: {totalAppointments}</div>
        <div>Agendamentos Filtrados: {filteredAppointments}</div>
        <div>Agendamentos Finais: {finalAppointments}</div>
        <div>Carregando: {appointmentsLoading ? 'Sim' : 'Não'}</div>
      </div>
    </div>
  );
};

export default EmployeeDebugInfo;
