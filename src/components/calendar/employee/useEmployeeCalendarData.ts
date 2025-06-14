
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
        console.log("useEmployeeCalendarData - No user found");
        setAccessDenied(true);
        setLoading(false);
        return;
      }
      
      try {
        console.log("useEmployeeCalendarData - Loading data for user:", user.id);
        const permissions = await checkEmployeePermissions();
        
        console.log("useEmployeeCalendarData - Permissions result:", permissions);
        
        if (!permissions) {
          console.log("useEmployeeCalendarData - No permissions found");
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
  }, [user?.id, checkEmployeePermissions]);

  // Filtrar agendamentos usando employeeId (propriedade do tipo Appointment)
  const employeeAppointments = useMemo(() => {
    const employeeId = employeeData?.employee_id;
    
    console.log("useEmployeeCalendarData - employee_id from permissions:", employeeId);
    console.log("useEmployeeCalendarData - Total appointments:", appointments.length);
    
    if (!employeeId) {
      console.log("useEmployeeCalendarData - No employee_id found, returning empty array");
      return [];
    }
    
    // Filtrar agendamentos onde employeeId corresponde ao funcionário logado
    const filtered = appointments.filter(appointment => {
      const matches = appointment.employeeId === employeeId;
      console.log(`Appointment ${appointment.id}: employeeId=${appointment.employeeId}, target=${employeeId}, matches=${matches}`);
      return matches;
    });
    
    console.log(`useEmployeeCalendarData - Filtered ${filtered.length} appointments for employee ${employeeId}`);
    return filtered;
  }, [appointments, employeeData?.employee_id]);

  // Encontrar dados do funcionário pelos employees
  const employee = useMemo(() => {
    if (!employeeData?.employee_id) return null;
    return employees.find(emp => emp.id === employeeData.employee_id) || null;
  }, [employees, employeeData?.employee_id]);

  // Aplicar filtros adicionais usando o hook existente
  const appointmentsWithDetails = useFilteredAppointments({
    appointments: employeeAppointments,
    selectedEmployee: undefined, // Já filtrado acima
    hideCanceled: false,
  });

  return {
    user,
    employeeData: {
      ...employeeData,
      employee
    },
    loading,
    accessDenied,
    appointments,
    appointmentsLoading,
    employees,
    employeeAppointments,
    appointmentsWithDetails,
  };
}
