
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

      // Chamar a edge function para criar o usuário no Supabase Auth
      const { data: sessionData } = await supabase.auth.getSession();
      
      const response = await fetch(`https://dehmfbnguglqlptbucdq.supabase.co/functions/v1/create-employee-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session?.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlaG1mYm5ndWdscWxwdGJ1Y2RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4NjA3OTYsImV4cCI6MjA2MTQzNjc5Nn0.dxlYat64Emh-KznMm_CRtU9_k6SVuwaxwGLCf9YGSKw',
        },
        body: JSON.stringify({
          email: inviteData.email,
          temporaryPassword: inviteData.temporaryPassword,
          employeeId: inviteData.employeeId,
          employeeName: employee.name
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Erro ao criar usuário do funcionário");
      }

      // Também atualizar o email na tabela employees
      await supabase
        .from("employees")
        .update({ email: inviteData.email })
        .eq("id", inviteData.employeeId);

      // Buscar informações do negócio para o e-mail
      const { data: profile } = await supabase
        .from("profiles")
        .select("business_name")
        .eq("id", userId)
        .single();

      const businessName = profile?.business_name || "Sua Empresa";
      const loginUrl = `${window.location.origin}/login`;

      // Usar sistema de e-mail nativo do Supabase
      try {
        // Criar usuário com e-mail de convite
        const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(
          inviteData.email,
          {
            redirectTo: loginUrl,
            data: {
              employee_name: employee.name,
              business_name: businessName,
              temporary_password: inviteData.temporaryPassword,
              employee_id: inviteData.employeeId
            }
          }
        );

        if (authError) {
          console.warn("Erro ao enviar convite via Supabase Auth:", authError);
        } else {
          console.log("Convite enviado por e-mail com sucesso via Supabase Auth");
          
          // Atualizar o convite com o user_id criado
          if (authData.user?.id) {
            await supabase
              .from("employee_invites")
              .update({ user_id: authData.user.id })
              .eq("id", inviteId);
          }
        }
      } catch (emailError) {
        console.warn("Erro ao enviar e-mail:", emailError);
      }

      return { id: inviteId, ...result };
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

  const resendMutation = useMutation({
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

      // Buscar informações do negócio
      const { data: profile } = await supabase
        .from("profiles")
        .select("business_name")
        .eq("id", userId)
        .single();

      const businessName = profile?.business_name || "Sua Empresa";
      const loginUrl = `${window.location.origin}/login`;

      // Reenviar e-mail usando Supabase Auth
      try {
        // Reenviar convite via Supabase
        const { error: emailError } = await supabase.auth.admin.inviteUserByEmail(
          invite.email,
          {
            redirectTo: loginUrl,
            data: {
              employee_name: employee.name,
              business_name: businessName,
              temporary_password: invite.temporary_password,
              is_resend: true
            }
          }
        );

        if (emailError) {
          throw new Error("Erro ao reenviar e-mail via Supabase Auth");
        }
      } catch (emailError) {
        throw new Error("Erro ao reenviar e-mail");
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

  const disableAccessMutation = useMutation({
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

  const getInviteByEmployeeId = (employeeId: string) => {
    return invites.find(invite => invite.employee_id === employeeId);
  };

  return {
    invites,
    isLoading,
    createInvite: createMutation.mutate,
    isCreating: createMutation.isPending,
    resendInvite: resendMutation.mutate,
    isResending: resendMutation.isPending,
    disableAccess: disableAccessMutation.mutate,
    isDisabling: disableAccessMutation.isPending,
    getInviteByEmployeeId,
  };
}
