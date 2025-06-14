
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

    const { data, error } = await supabase
      .from("employee_permissions")
      .select(`
        *,
        employee:employee_id(id, name, role)
      `)
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Erro ao verificar permissões de funcionário:", error);
      return null;
    }

    return data;
  }, [user?.id]); // Só re-cria a função se o user.id mudar

  return { checkEmployeePermissions };
};

export default useAuth;
