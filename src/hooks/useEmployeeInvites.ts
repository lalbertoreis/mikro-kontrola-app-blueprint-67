
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface EmployeeInvite {
  id: string;
  employee_id: string;
  email: string;
  temporary_password: string;
  is_active: boolean;
  created_at: string;
  activated_at?: string;
  user_id?: string;
}

interface CreateInviteData {
  employeeId: string;
  email: string;
  temporaryPassword: string;
}

export function useEmployeeInvites() {
  const queryClient = useQueryClient();

  const { data: invites = [], isLoading } = useQuery({
    queryKey: ["employee-invites"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_invites")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as EmployeeInvite[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (inviteData: CreateInviteData) => {
      const { data: userData } = await supabase.auth.getUser();
      const ownerUserId = userData.user?.id;
      if (!ownerUserId) {
        throw new Error("Usuário não autenticado");
      }

      // Verifica se o funcionário já tem um usuário no Auth criado
      const employeeResp = await supabase
        .from("employees")
        .select("id, email, auth_user_id")
        .eq("id", inviteData.employeeId)
        .maybeSingle();
      const employee = employeeResp?.data;
      if (!employee) throw new Error("Funcionário não encontrado");

      let newAuthUserId = employee.auth_user_id;

      // Cria usuário no Auth se não existir
      if (!newAuthUserId) {
        // Tenta buscar usuário pelo email
        let foundUser: string | null = null;
        const result = await supabase.auth.admin.listUsers({email: inviteData.email});
        if (result.data?.users[0]) {
          foundUser = result.data.users[0].id;
        }

        if (!foundUser) {
          // Cria usuário
          const signUpRes = await supabase.auth.admin.createUser({
            email: inviteData.email,
            password: inviteData.temporaryPassword,
            email_confirm: false,
          });
          if (signUpRes.error) throw signUpRes.error;
          foundUser = signUpRes.data.user?.id;
        }

        if (!foundUser) throw new Error("Não foi possível criar usuário Auth para o funcionário");

        newAuthUserId = foundUser;

        // Vincula employee.auth_user_id
        const { error: updError } = await supabase
          .from("employees")
          .update({ auth_user_id: newAuthUserId })
          .eq("id", inviteData.employeeId);
        if (updError) throw updError;
      }

      // Verificar se já existe convite ativo para este funcionário
      const { data: existingInvite } = await supabase
        .from("employee_invites")
        .select("id, is_active")
        .eq("employee_id", inviteData.employeeId)
        .maybeSingle();
      if (existingInvite && existingInvite.is_active) {
        throw new Error("Já existe um convite ativo para este funcionário");
      }

      // Envia convite de acesso (via insert, e edge function/trigger de email)
      const { data, error } = await supabase
        .from("employee_invites")
        .insert({
          employee_id: inviteData.employeeId,
          email: inviteData.email,
          temporary_password: inviteData.temporaryPassword,
          created_by: ownerUserId,
          is_active: true,
          user_id: newAuthUserId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-invites"] });
      toast.success("Convite criado com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao criar convite:", error);
      toast.error(error.message || "Erro ao criar convite. Tente novamente.");
    },
  });

  const getInviteByEmployeeId = (employeeId: string) => {
    return invites.find(invite => invite.employee_id === employeeId);
  };

  return {
    invites,
    isLoading,
    createInvite: createMutation.mutateAsync, // 🔑 use mutateAsync para await
    isCreating: createMutation.isPending,
    getInviteByEmployeeId,
  };
}
