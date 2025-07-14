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

      // Buscar informações do negócio para o e-mail
      const { data: profile } = await supabase
        .from("profiles")
        .select("business_name")
        .eq("id", userId)
        .single();

      const businessName = profile?.business_name || "Sua Empresa";
      const loginUrl = `${window.location.origin}/login`;

      console.log("Reenviando credenciais para:", invite.email);

      // Primeiro, resetar a senha do usuário
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        invite.email,
        {
          redirectTo: `${window.location.origin}/login`,
        }
      );

      if (resetError) {
        console.error("Erro ao resetar senha:", resetError);
        throw new Error(`Erro ao resetar senha: ${resetError.message}`);
      }

      // Reenviar credenciais usando Edge Function
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        
        const response = await fetch(`https://dehmfbnguglqlptbucdq.supabase.co/functions/v1/send-employee-credentials`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session?.access_token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlaG1mYm5ndWdscWxwdGJ1Y2RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4NjA3OTYsImV4cCI6MjA2MTQzNjc5Nn0.dxlYat64Emh-KznMm_CRtU9_k6SVuwaxwGLCf9YGSKw',
          },
          body: JSON.stringify({
            employeeName: employee.name,
            employeeEmail: invite.email,
            temporaryPassword: invite.temporary_password,
            businessName,
            loginUrl
          }),
        });

        const emailResult = await response.json();
        
        if (!response.ok || !emailResult.success) {
          throw new Error(emailResult.error || "Erro ao enviar e-mail de credenciais");
        }
        
        console.log("Credenciais reenviadas com sucesso para:", invite.email);
      } catch (emailError) {
        console.error("Erro ao reenviar credenciais:", emailError);
        throw new Error("Erro ao reenviar credenciais por e-mail");
      }

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