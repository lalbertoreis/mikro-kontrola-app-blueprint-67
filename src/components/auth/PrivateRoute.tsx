
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth, useEmployeePermissions } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import EmployeeLoginLoading from "@/components/employee/EmployeeLoginLoading";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const { checkEmployeePermissions } = useEmployeePermissions();
  const [isEmployee, setIsEmployee] = useState<boolean | null>(null);
  const [checkingPermissions, setCheckingPermissions] = useState(true);
  const [minLoadingTime, setMinLoadingTime] = useState(true);

  console.log("PrivateRoute render - user:", user?.id, "loading:", loading, "checkingPermissions:", checkingPermissions, "isEmployee:", isEmployee);

  // Garantir um tempo mínimo de loading para funcionários
  useEffect(() => {
    if (!loading && user) {
      const timer = setTimeout(() => {
        setMinLoadingTime(false);
      }, 2000); // 2 segundos mínimo de loading

      return () => clearTimeout(timer);
    }
  }, [loading, user]);

  useEffect(() => {
    const verifyUserType = async () => {
      console.log("PrivateRoute verifyUserType - user:", user?.id);
      
      if (!user) {
        console.log("PrivateRoute - No user, setting isEmployee to false");
        setIsEmployee(false);
        setCheckingPermissions(false);
        return;
      }

      try {
        console.log("PrivateRoute - Checking employee permissions for user:", user.id);
        const permissions = await checkEmployeePermissions();
        console.log("PrivateRoute - Employee permissions result:", permissions);
        
        const employeeStatus = !!permissions;
        setIsEmployee(employeeStatus);
        console.log("PrivateRoute - User is employee:", employeeStatus);
      } catch (error) {
        console.error("PrivateRoute - Erro ao verificar tipo de usuário:", error);
        setIsEmployee(false);
      } finally {
        setCheckingPermissions(false);
        console.log("PrivateRoute - Finished checking permissions");
      }
    };

    if (!loading) {
      verifyUserType();
    }
  }, [user, loading, checkEmployeePermissions]);

  // Mostrar loading enquanto carrega ou durante o tempo mínimo para funcionários
  if (loading || checkingPermissions || (user && minLoadingTime)) {
    console.log("PrivateRoute - Showing loading state");
    
    // Se já temos usuário, mostrar loading de funcionário
    if (user) {
      return <EmployeeLoginLoading />;
    }
    
    // Loading padrão quando ainda não tem usuário
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    console.log("PrivateRoute - No user, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Se for funcionário, redirecionar diretamente para a agenda
  if (isEmployee) {
    console.log("PrivateRoute - Employee detected, redirecting to calendar");
    return <Navigate to="/dashboard/calendar" replace />;
  }

  console.log("PrivateRoute - Rendering children for business owner");
  return <>{children}</>;
};

export default PrivateRoute;
