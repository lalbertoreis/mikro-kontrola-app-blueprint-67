
import React from "react";
import { AppointmentWithDetails } from "@/types/calendar";

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
      <h4 className="font-medium text-yellow-900 mb-2">Debug Info Detalhado:</h4>
      <div className="text-yellow-800 space-y-1">
        <div>Employee ID: {employeeData?.employee?.id || 'UNDEFINED'}</div>
        <div>Total Appointments: {totalAppointments}</div>
        <div>Filtered Appointments: {filteredAppointments}</div>
        <div>Final Appointments: {finalAppointments}</div>
        <div>Loading Appointments: {appointmentsLoading ? 'Yes' : 'No'}</div>
      </div>
    </div>
  );
};

export default EmployeeDebugInfo;
