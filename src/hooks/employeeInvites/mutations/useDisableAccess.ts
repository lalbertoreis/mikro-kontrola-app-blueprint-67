import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useDisableAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employeeId: string) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        throw new Error("Usuário não autenticado");
      }

      // Buscar o convite existente
      const { data: invite, error: inviteError } = await supabase
        .from("employee_invites")
        .select("user_id, email")
        .eq("employee_id", employeeId)
        .single();

      if (inviteError) {
        console.warn("Convite não encontrado:", inviteError);
        return { success: true };
      }

      // Desativar o convite
      const { error: updateError } = await supabase
        .from("employee_invites")
        .update({ is_active: false })
        .eq("employee_id", employeeId);

      if (updateError) {
        throw new Error("Erro ao desativar convite");
      }

      // Se o usuário já foi criado no Auth, desabilitar também
      if (invite.user_id) {
        try {
          const { error: deleteUserError } = await supabase.auth.admin.deleteUser(invite.user_id);
          if (deleteUserError) {
            console.warn("Erro ao deletar usuário do Auth:", deleteUserError);
          }
        } catch (error) {
          console.warn("Erro ao deletar usuário:", error);
        }
      }

      // Remover permissões do funcionário
      const { error: permissionsError } = await supabase
        .from("employee_permissions")
        .delete()
        .eq("employee_id", employeeId);

      if (permissionsError) {
        console.warn("Erro ao remover permissões:", permissionsError);
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-invites"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Acesso desabilitado com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao desabilitar acesso:", error);
      toast.error(error.message || "Erro ao desabilitar acesso. Tente novamente.");
    },
  });
}