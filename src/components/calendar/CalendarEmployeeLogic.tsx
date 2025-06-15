
import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployeePermissions } from "@/hooks/useAuth";

interface EmployeeLogicProps {
  setIsEmployee: (value: boolean) => void;
  setEmployeeData: (data: any) => void;
  setLoading: (value: boolean) => void;
  setSelectedEmployee: (employeeId?: string) => void;
}

export const useEmployeeLogic = ({
  setIsEmployee,
  setEmployeeData,
  setLoading,
  setSelectedEmployee,
}: EmployeeLogicProps) => {
  const { user } = useAuth();
  const { checkEmployeePermissions } = useEmployeePermissions();

  useEffect(() => {
    const checkEmployeeStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const permissions = await checkEmployeePermissions();
        
        if (permissions && permissions.employee_id) {
          console.log("Employee detected - ID:", permissions.employee_id);
          setIsEmployee(true);
          setEmployeeData(permissions);
          // Aplicar automaticamente o filtro do funcionário
          setSelectedEmployee(permissions.employee_id);
        } else {
          setIsEmployee(false);
          setEmployeeData(null);
        }
      } catch (error) {
        console.error("Erro ao verificar permissões:", error);
        setIsEmployee(false);
        setEmployeeData(null);
      } finally {
        setLoading(false);
      }
    };

    checkEmployeeStatus();
  }, [user, checkEmployeePermissions, setSelectedEmployee, setIsEmployee, setEmployeeData, setLoading]);
};
