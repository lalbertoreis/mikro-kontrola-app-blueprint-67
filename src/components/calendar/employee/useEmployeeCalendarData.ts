
import { useState, useEffect, useMemo } from "react";
import { useAuth, useEmployeePermissions } from "@/hooks/useAuth";
import { useAppointments } from "@/hooks/useAppointments";
import { useEmployees } from "@/hooks/useEmployees";
import { useFilteredAppointments } from "../CalendarFilters";

export function useEmployeeCalendarData() {
  const { user } = useAuth();
  const { checkEmployeePermissions } = useEmployeePermissions();
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  const { appointments, isLoading: appointmentsLoading } = useAppointments();
  const { employees } = useEmployees();

  useEffect(() => {
    const loadEmployeeData = async () => {
      if (!user) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }
      
      try {
        const permissions = await checkEmployeePermissions();
        
        if (!permissions) {
          setAccessDenied(true);
        } else {
          setEmployeeData(permissions);
          setAccessDenied(false);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do funcionário:", error);
        setAccessDenied(true);
      } finally {
        setLoading(false);
      }
    };

    loadEmployeeData();
  }, [user?.id, checkEmployeePermissions]); // Dependências específicas

  // Memoizar o filtro de agendamentos para evitar recálculos desnecessários
  const employeeAppointments = useMemo(() => {
    if (!employeeData?.employee?.id) {
      return [];
    }
    
    return appointments.filter(appointment => 
      appointment.employeeId === employeeData.employee.id
    );
  }, [appointments, employeeData?.employee?.id]);

  const appointmentsWithDetails = useFilteredAppointments({
    appointments: employeeAppointments,
    selectedEmployee: employeeData?.employee?.id,
    hideCanceled: false,
  });

  return {
    user,
    employeeData,
    loading,
    accessDenied,
    appointments,
    appointmentsLoading,
    employees,
    employeeAppointments,
    appointmentsWithDetails,
  };
}
