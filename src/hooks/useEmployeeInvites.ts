
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
        throw new Error("Já existe um convite para este funcionário");
      }

      const { data, error } = await supabase
        .from("employee_invites")
        .insert({
          employee_id: inviteData.employeeId,
          email: inviteData.email,
          temporary_password: inviteData.temporaryPassword,
          created_by: userId,
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
    createInvite: createMutation.mutate,
    isCreating: createMutation.isPending,
    getInviteByEmployeeId,
  };
}
