
import React from "react";
import { useAuth, useEmployeePermissions } from "@/hooks/useAuth";
import { useAppointments } from "@/hooks/useAppointments";
import { useEmployees } from "@/hooks/useEmployees";
import CalendarContent from "./CalendarContent";
import { useCalendarState } from "@/hooks/useCalendarState";
import { useFilteredAppointments } from "./CalendarFilters";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, User } from "lucide-react";
import { useState, useEffect } from "react";

export default function EmployeeCalendarView() {
  const { user } = useAuth();
  const { checkEmployeePermissions } = useEmployeePermissions();
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const {
    view,
    currentDate,
    selectedTimeSlot,
    handleSelectAppointment,
    navigatePrevious,
    navigateNext,
    goToToday,
  } = useCalendarState();

  const { appointments, isLoading: appointmentsLoading } = useAppointments();
  const { employees } = useEmployees();

  useEffect(() => {
    const loadEmployeeData = async () => {
      if (!user) return;
      
      try {
        const permissions = await checkEmployeePermissions();
        setEmployeeData(permissions);
      } catch (error) {
        console.error("Erro ao carregar dados do funcionário:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEmployeeData();
  }, [user, checkEmployeePermissions]);

  // Filtrar agendamentos apenas do funcionário logado
  const employeeAppointments = appointments.filter(appointment => {
    if (!employeeData?.employee?.id) return false;
    return appointment.employeeId === employeeData.employee.id;
  });

  const appointmentsWithDetails = useFilteredAppointments({
    appointments: employeeAppointments,
    selectedEmployee: employeeData?.employee?.id,
    hideCanceled: false,
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

  if (!employeeData || !employeeData.employee) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="p-6 text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta área.
            </p>
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
                Minha Agenda - {employeeData.employee.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Suas Permissões:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Visualizar apenas seus próprios agendamentos</li>
                  <li>• Acesso somente à agenda</li>
                  <li>• Não é possível criar ou editar agendamentos</li>
                </ul>
              </div>
              
              <CalendarContent
                view={view}
                appointments={appointmentsWithDetails}
                currentDate={currentDate}
                employees={employees}
                selectedEmployee={employeeData.employee.id}
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
