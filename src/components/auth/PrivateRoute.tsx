
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
    if (!loading && user && isEmployee !== false) {
      const timer = setTimeout(() => {
        setMinLoadingTime(false);
      }, 2000); // 2 segundos mínimo de loading

      return () => clearTimeout(timer);
    } else {
      setMinLoadingTime(false);
    }
  }, [loading, user, isEmployee]);

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

  // Loading inicial enquanto verifica autenticação
  if (loading) {
    console.log("PrivateRoute - Initial loading");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Se não tem usuário, redirecionar para login
  if (!user) {
    console.log("PrivateRoute - No user, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Se ainda está verificando permissões, mostrar loading
  if (checkingPermissions) {
    console.log("PrivateRoute - Checking permissions");
    return <EmployeeLoginLoading />;
  }

  // Se é funcionário e ainda está no tempo mínimo de loading
  if (isEmployee && minLoadingTime) {
    console.log("PrivateRoute - Employee minimum loading time");
    return <EmployeeLoginLoading />;
  }

  // Se for funcionário, redirecionar diretamente para a agenda
  if (isEmployee) {
    console.log("PrivateRoute - Employee detected, redirecting to calendar");
    return <Navigate to="/dashboard/calendar" replace />;
  }

  // Se não é funcionário mas está tentando acessar a agenda, permitir
  if (window.location.pathname === "/dashboard/calendar") {
    console.log("PrivateRoute - Business owner accessing calendar");
    return <>{children}</>;
  }

  console.log("PrivateRoute - Rendering children for business owner");
  return <>{children}</>;
};

export default PrivateRoute;
