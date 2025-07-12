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

      // Criar usuário no Supabase Auth
      console.log("Criando usuário no Auth:", inviteData.email);
      
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

      if (authError) {
        console.error("Erro ao criar usuário:", authError);
        throw new Error(`Erro ao criar usuário: ${authError.message}`);
      }

      console.log("Usuário criado com sucesso:", authData.user?.id);

      // Buscar informações do negócio para o e-mail
      const { data: profile } = await supabase
        .from("profiles")
        .select("business_name")
        .eq("id", userId)
        .single();

      const businessName = profile?.business_name || "Sua Empresa";
      const loginUrl = `${window.location.origin}/login`;

      // Enviar e-mail com credenciais usando Edge Function
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
            employeeEmail: inviteData.email,
            temporaryPassword: inviteData.temporaryPassword,
            businessName,
            loginUrl
          }),
        });

        const emailResult = await response.json();
        
        if (!response.ok || !emailResult.success) {
          console.warn("Erro ao enviar e-mail de credenciais:", emailResult.error);
        } else {
          console.log("E-mail de credenciais enviado com sucesso!");
        }
      } catch (emailError) {
        console.warn("Erro ao enviar e-mail de credenciais:", emailError);
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