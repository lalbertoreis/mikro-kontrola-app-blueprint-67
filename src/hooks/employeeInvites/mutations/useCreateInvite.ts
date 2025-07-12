import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CreateInviteData } from "../types";

export function useCreateInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteData: CreateInviteData) => {
      console.log("Creating invite for employee:", inviteData.employeeId);
      
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        throw new Error("Usuário não autenticado");
      }

      // Primeiro, buscar informações do funcionário
      const { data: employee, error: employeeError } = await supabase
        .from("employees")
        .select("name")
        .eq("id", inviteData.employeeId)
        .single();

      if (employeeError) {
        throw new Error(`Erro ao buscar funcionário: ${employeeError.message}`);
      }

      // Verificar se já existe um convite para este funcionário
      const { data: existingInvite } = await supabase
        .from("employee_invites")
        .select("id")
        .eq("employee_id", inviteData.employeeId)
        .maybeSingle();

      let inviteId: string;

      if (existingInvite) {
        // Atualizar convite existente
        const { data, error } = await supabase
          .from("employee_invites")
          .update({
            email: inviteData.email,
            temporary_password: inviteData.temporaryPassword,
            is_active: true,
          })
          .eq("employee_id", inviteData.employeeId)
          .select()
          .single();

        if (error) throw error;
        inviteId = data.id;
      } else {
        // Criar novo convite
        const { data, error } = await supabase
          .from("employee_invites")
          .insert({
            employee_id: inviteData.employeeId,
            email: inviteData.email,
            temporary_password: inviteData.temporaryPassword,
            created_by: userId,
            is_active: true,
          })
          .select()
          .single();

        if (error) throw error;
        inviteId = data.id;
      }

      // Verificar se o usuário já existe no Auth
      console.log("Verificando se usuário já existe:", inviteData.email);
      
      // Primeiro, tentar criar o usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: inviteData.email,
        password: inviteData.temporaryPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            employee_name: employee.name,
            employee_id: inviteData.employeeId
          }
        }
      });

      console.log("Resultado do signUp:", { authData, authError });

      if (authError) {
        // Se o usuário já existe, tentar enviar reset password
        if (authError.message.includes("already registered") || authError.message.includes("já cadastrado")) {
          console.log("Usuário já existe, enviando reset password");
          const { error: resetError } = await supabase.auth.resetPasswordForEmail(
            inviteData.email,
            {
              redirectTo: `${window.location.origin}/login`
            }
          );
          
          if (resetError) {
            console.error("Erro ao enviar reset password:", resetError);
            throw new Error(`Erro ao enviar convite: ${resetError.message}`);
          }
          
          console.log("Reset password enviado com sucesso");
        } else {
          throw new Error(`Erro ao criar usuário: ${authError.message}`);
        }
      } else {
        console.log("Usuário criado com sucesso, e-mail de confirmação enviado");
      }

      // Atualizar o email na tabela employees
      await supabase
        .from("employees")
        .update({ email: inviteData.email })
        .eq("id", inviteData.employeeId);

      // Atualizar o convite com o user_id criado
      if (authData.user?.id) {
        await supabase
          .from("employee_invites")
          .update({ user_id: authData.user.id })
          .eq("id", inviteId);
      }

      return { id: inviteId, user_id: authData.user?.id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-invites"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Convite enviado com sucesso! O funcionário receberá um e-mail com as instruções de acesso.");
    },
    onError: (error: any) => {
      console.error("Erro ao configurar acesso:", error);
      toast.error(error.message || "Erro ao configurar acesso. Tente novamente.");
    },
  });
}