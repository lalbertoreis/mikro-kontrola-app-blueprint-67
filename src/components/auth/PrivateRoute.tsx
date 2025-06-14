
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

  console.log("PrivateRoute render - user:", user?.id, "loading:", loading, "checkingPermissions:", checkingPermissions, "isEmployee:", isEmployee);

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

  if (loading || checkingPermissions) {
    console.log("PrivateRoute - Showing loading state");
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

  // Se for funcionário, redirecionar para a agenda (somente se não estiver já na rota correta)
  if (isEmployee && window.location.pathname !== "/dashboard/calendar") {
    console.log("PrivateRoute - Employee detected, redirecting to calendar");
    return <Navigate to="/dashboard/calendar" replace />;
  }

  console.log("PrivateRoute - Rendering children");
  return <>{children}</>;
};

export default PrivateRoute;
