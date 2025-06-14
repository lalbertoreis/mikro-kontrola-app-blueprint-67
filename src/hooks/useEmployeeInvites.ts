
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
      console.log("Creating invite for employee:", inviteData.employeeId);
      
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        throw new Error("Usuário não autenticado");
      }

      // Verificar se já existe um convite para este funcionário
      const { data: existingInvite } = await supabase
        .from("employee_invites")
        .select("id")
        .eq("employee_id", inviteData.employeeId)
        .single();

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
        
        // Também atualizar o email na tabela employees
        await supabase
          .from("employees")
          .update({ email: inviteData.email })
          .eq("id", inviteData.employeeId);

        return data;
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
        
        // Também atualizar o email na tabela employees
        await supabase
          .from("employees")
          .update({ email: inviteData.email })
          .eq("id", inviteData.employeeId);

        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-invites"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Acesso ao painel configurado com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao configurar acesso:", error);
      toast.error(error.message || "Erro ao configurar acesso. Tente novamente.");
    },
  });

  const getInviteByEmployeeId = (employeeId: string) => {
    return invites.find(invite => invite.employee_id === employeeId);
  };

  return {
    invites,
    isLoading,
    createInvite: createMutation.mutate,
    isCreating: createMutation.isPending,
    getInviteByEmployeeId,
  };
}
