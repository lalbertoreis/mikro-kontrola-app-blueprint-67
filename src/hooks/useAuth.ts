
import { useContext } from "react";
import AuthContext from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Hook para verificar se o usuário é funcionário
export const useEmployeePermissions = () => {
  const { user } = useAuth();

  const checkEmployeePermissions = async () => {
    if (!user) {
      console.log("checkEmployeePermissions: No user found");
      return null;
    }

    console.log("checkEmployeePermissions: Starting check for user:", user.id);

    const { data, error } = await supabase
      .from("employee_permissions")
      .select(`
        *,
        employee:employees(id, name, role)
      `)
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("checkEmployeePermissions: Error fetching permissions:", error);
      return null;
    }

    console.log("checkEmployeePermissions: Raw data from query:", data);
    console.log("checkEmployeePermissions: Employee data:", data?.employee);

    if (!data) {
      console.log("checkEmployeePermissions: No data returned from query");
      return null;
    }

    if (!data.employee) {
      console.log("checkEmployeePermissions: No employee data in permissions");
      return null;
    }

    console.log("checkEmployeePermissions: Returning valid permissions with employee:", data.employee);
    return data;
  };

  return { checkEmployeePermissions };
};

export default useAuth;
