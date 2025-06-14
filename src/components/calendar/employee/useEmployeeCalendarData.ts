
import { useState, useEffect } from "react";
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
        console.log("EmployeeCalendarView: No user found");
        setAccessDenied(true);
        setLoading(false);
        return;
      }
      
      try {
        console.log("EmployeeCalendarView: Checking permissions for user:", user.id);
        const permissions = await checkEmployeePermissions();
        console.log("EmployeeCalendarView: Permissions received:", permissions);
        
        if (!permissions) {
          console.log("EmployeeCalendarView: No permissions found, access denied");
          setAccessDenied(true);
        } else {
          console.log("EmployeeCalendarView: Access granted, employee data:", permissions);
          setEmployeeData(permissions);
          setAccessDenied(false);
        }
      } catch (error) {
        console.error("EmployeeCalendarView: Erro ao carregar dados do funcionário:", error);
        setAccessDenied(true);
      } finally {
        setLoading(false);
      }
    };

    loadEmployeeData();
  }, [user, checkEmployeePermissions]);

  // Log detalhado dos agendamentos para debug
  console.log("EmployeeCalendarView: Debug detalhado:", {
    appointmentsTotal: appointments.length,
    employeeDataExists: !!employeeData,
    employeeId: employeeData?.employee?.id,
    allAppointments: appointments.map(app => ({
      id: app.id,
      title: app.title,
      employeeId: app.employeeId,
      matchesEmployee: app.employeeId === employeeData?.employee?.id
    }))
  });

  // Filtrar agendamentos apenas do funcionário logado com logs detalhados
  const employeeAppointments = appointments.filter(appointment => {
    if (!employeeData?.employee?.id) {
      console.log("EmployeeCalendarView: No employee ID found for filtering");
      return false;
    }
    
    const matches = appointment.employeeId === employeeData.employee.id;
    console.log(`EmployeeCalendarView: Appointment ${appointment.id} (${appointment.title}) - employeeId: "${appointment.employeeId}" vs expected: "${employeeData.employee.id}" - matches: ${matches}`);
    
    return matches;
  });

  console.log("EmployeeCalendarView: Filtered appointments:", {
    total: employeeAppointments.length,
    appointments: employeeAppointments.map(app => ({
      id: app.id,
      title: app.title,
      employeeId: app.employeeId
    }))
  });

  const appointmentsWithDetails = useFilteredAppointments({
    appointments: employeeAppointments,
    selectedEmployee: employeeData?.employee?.id,
    hideCanceled: false,
  });

  console.log("EmployeeCalendarView: Final appointments with details:", {
    count: appointmentsWithDetails.length,
    appointments: appointmentsWithDetails.map(app => ({
      id: app.id,
      title: app.title,
      employeeId: app.employeeId
    }))
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
