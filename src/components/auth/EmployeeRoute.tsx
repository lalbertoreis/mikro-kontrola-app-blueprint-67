
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth, useEmployeePermissions } from "@/hooks/useAuth";
import EmployeeLoginLoading from "@/components/employee/EmployeeLoginLoading";

interface EmployeeRouteProps {
  children: React.ReactNode;
}

const EmployeeRoute: React.FC<EmployeeRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const { checkEmployeePermissions } = useEmployeePermissions();
  const [isEmployee, setIsEmployee] = useState<boolean | null>(null);
  const [checkingPermissions, setCheckingPermissions] = useState(true);

  useEffect(() => {
    const verifyEmployeeStatus = async () => {
      if (!user) {
        setIsEmployee(false);
        setCheckingPermissions(false);
        return;
      }

      try {
        const permissions = await checkEmployeePermissions();
        setIsEmployee(!!permissions);
      } catch (error) {
        console.error("Erro ao verificar status de funcionário:", error);
        setIsEmployee(false);
      } finally {
        setCheckingPermissions(false);
      }
    };

    if (!loading) {
      verifyEmployeeStatus();
    }
  }, [user, loading, checkEmployeePermissions]);

  if (loading || checkingPermissions) {
    return <EmployeeLoginLoading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isEmployee === false) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default EmployeeRoute;
