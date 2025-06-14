
import React from "react";
import { useAuth, useEmployeePermissions } from "@/hooks/useAuth";
import { useAppointments } from "@/hooks/useAppointments";
import { useEmployees } from "@/hooks/useEmployees";
import { useCalendarState } from "@/hooks/useCalendarState";
import { useFilteredAppointments } from "./CalendarFilters";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, User } from "lucide-react";
import { useState, useEffect } from "react";
import CalendarMainHeader from "./CalendarMainHeader";
import CalendarContent from "./CalendarContent";

export default function EmployeeCalendarView() {
  const { user } = useAuth();
  const { checkEmployeePermissions } = useEmployeePermissions();
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  const {
    view,
    setView,
    currentDate,
    selectedTimeSlot,
    handleSelectAppointment,
    navigatePrevious,
    navigateNext,
    goToToday,
    isMaximized,
    toggleMaximized,
  } = useCalendarState();

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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <CalendarIcon className="h-8 w-8 animate-pulse mx-auto mb-2" />
            <p>Carregando sua agenda...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (accessDenied || !employeeData) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="p-6 text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta área.
            </p>
            <div className="mt-4 p-3 bg-gray-100 rounded text-sm text-left">
              <strong>Debug Info:</strong>
              <br />User ID: {user?.id}
              <br />Employee Data: {employeeData ? 'Present' : 'None'}
              <br />Access Denied: {accessDenied ? 'Yes' : 'No'}
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <TooltipProvider>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Minha Agenda - {employeeData.employee?.name || 'Funcionário'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Debug info detalhado */}
              <div className="bg-yellow-50 p-4 rounded-lg mb-4 text-sm">
                <h4 className="font-medium text-yellow-900 mb-2">Debug Info Detalhado:</h4>
                <div className="text-yellow-800 space-y-1">
                  <div>Employee ID: {employeeData.employee?.id || 'UNDEFINED'}</div>
                  <div>Total Appointments: {appointments.length}</div>
                  <div>Filtered Appointments: {employeeAppointments.length}</div>
                  <div>Final Appointments: {appointmentsWithDetails.length}</div>
                  <div>Loading Appointments: {appointmentsLoading ? 'Yes' : 'No'}</div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Suas Permissões:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Visualizar apenas seus próprios agendamentos</li>
                  <li>• Acesso somente à agenda</li>
                  <li>• Não é possível criar ou editar agendamentos</li>
                </ul>
              </div>
              
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
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
}
