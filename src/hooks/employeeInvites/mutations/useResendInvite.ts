import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useResendInvite() {
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
        .select("email, temporary_password")
        .eq("employee_id", employeeId)
        .single();

      if (inviteError) {
        throw new Error("Convite não encontrado");
      }

      // Buscar informações do funcionário
      const { data: employee, error: employeeError } = await supabase
        .from("employees")
        .select("name")
        .eq("id", employeeId)
        .single();

      if (employeeError) {
        throw new Error("Funcionário não encontrado");
      }

      console.log("Reenviando convite para:", invite.email);

      // Reenviar usando reset password do Supabase
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        invite.email,
        {
          redirectTo: `${window.location.origin}/login`
        }
      );

      console.log("Resultado do resetPasswordForEmail:", { resetError });

      if (resetError) {
        console.error("Erro ao reenviar convite:", resetError);
        throw new Error(`Erro ao reenviar convite: ${resetError.message}`);
      }

      console.log("Convite reenviado com sucesso para:", invite.email);

      return { success: true };
    },
    onSuccess: () => {
      toast.success("Convite reenviado com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao reenviar convite:", error);
      toast.error(error.message || "Erro ao reenviar convite. Tente novamente.");
    },
  });
}