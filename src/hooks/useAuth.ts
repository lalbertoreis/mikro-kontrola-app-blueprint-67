
import { useContext, useCallback } from "react";
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

  const checkEmployeePermissions = useCallback(async () => {
    if (!user) return null;

    console.log("checkEmployeePermissions - Checking for user:", user.id);

    const { data, error } = await supabase
      .from("employee_permissions")
      .select(`
        *,
        employee:employees!employee_permissions_employee_id_fkey(id, name, role)
      `)
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Erro ao verificar permissões de funcionário:", error);
      return null;
    }

    console.log("checkEmployeePermissions - Result:", data);
    return data;
  }, [user?.id]);

  return { checkEmployeePermissions };
};

export default useAuth;
