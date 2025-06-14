
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { TooltipProvider } from "@/components/ui/tooltip";
import CalendarLayout from "./CalendarLayout";
import { useEmployeePermissions } from "@/hooks/useAuth";
import { useEmployees } from "@/hooks/useEmployees";
import { useEffect, useState } from "react";

export default function CalendarView() {
  const { checkEmployeePermissions } = useEmployeePermissions();
  const { employees } = useEmployees();
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [isEmployee, setIsEmployee] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkIfEmployee = async () => {
      try {
        const permissions = await checkEmployeePermissions();
        if (permissions) {
          setEmployeeData(permissions);
          setIsEmployee(true);
        }
      } catch (error) {
        console.error("Erro ao verificar permissões:", error);
      } finally {
        setLoading(false);
      }
    };

    checkIfEmployee();
  }, [checkEmployeePermissions]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p>Carregando agenda...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <TooltipProvider>
        <CalendarLayout 
          isEmployeeView={isEmployee}
          employeeId={employeeData?.employee_id}
        />
      </TooltipProvider>
    </DashboardLayout>
  );
}
