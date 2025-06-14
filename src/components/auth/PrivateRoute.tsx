
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth, useEmployeePermissions } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const { checkEmployeePermissions } = useEmployeePermissions();
  const [isEmployee, setIsEmployee] = useState<boolean | null>(null);
  const [checkingPermissions, setCheckingPermissions] = useState(true);

  useEffect(() => {
    const verifyUserType = async () => {
      if (!user) {
        setIsEmployee(false);
        setCheckingPermissions(false);
        return;
      }

      try {
        const permissions = await checkEmployeePermissions();
        setIsEmployee(!!permissions);
      } catch (error) {
        console.error("Erro ao verificar tipo de usuário:", error);
        setIsEmployee(false);
      } finally {
        setCheckingPermissions(false);
      }
    };

    if (!loading) {
      verifyUserType();
    }
  }, [user, loading, checkEmployeePermissions]);

  if (loading || checkingPermissions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se for funcionário, redirecionar para a agenda restrita
  if (isEmployee) {
    return <Navigate to="/employee/calendar" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
