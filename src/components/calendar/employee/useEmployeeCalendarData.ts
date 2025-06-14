
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
          // Buscar dados do funcionário usando o employee_id
          const employee = employees.find(emp => emp.id === permissions.employee_id);
          console.log("useEmployeeCalendarData - Employee found:", employee);
          
          // Adicionar os dados do funcionário aos dados de permissão
          const enrichedData = {
            ...permissions,
            employee: employee || null
          };
          
          console.log("useEmployeeCalendarData - Final employee data:", enrichedData);
          setEmployeeData(enrichedData);
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
  }, [user?.id, checkEmployeePermissions, employees]);

  // Usar employee_id diretamente para filtrar agendamentos
  const employeeAppointments = useMemo(() => {
    const employeeId = employeeData?.employee_id;
    
    console.log("useEmployeeCalendarData - Filtering appointments for employee_id:", employeeId);
    
    if (!employeeId) {
      console.log("useEmployeeCalendarData - No employee_id found");
      return [];
    }
    
    const filtered = appointments.filter(appointment => 
      appointment.employeeId === employeeId
    );
    
    console.log("useEmployeeCalendarData - Filtered appointments:", filtered.length);
    return filtered;
  }, [appointments, employeeData?.employee_id]);

  const appointmentsWithDetails = useFilteredAppointments({
    appointments: employeeAppointments,
    selectedEmployee: employeeData?.employee_id,
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
