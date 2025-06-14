
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateEmployeeUserRequest {
  email: string;
  temporaryPassword: string;
  employeeId: string;
  employeeName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, temporaryPassword, employeeId, employeeName }: CreateEmployeeUserRequest = await req.json();
    
    // Criar cliente Supabase com service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verificar se o usuário já existe
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(user => user.email === email);

    let authUserId: string;

    if (existingUser) {
      // Se o usuário já existe, usar o ID existente
      authUserId = existingUser.id;
      console.log(`Usuário já existe: ${email}, usando ID: ${authUserId}`);
    } else {
      // Criar novo usuário no Supabase Auth
      const { data: newUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: temporaryPassword,
        email_confirm: true, // Auto-confirmar email
        user_metadata: {
          name: employeeName,
          role: 'employee',
          employee_id: employeeId
        }
      });

      if (authError) {
        console.error("Erro ao criar usuário:", authError);
        throw new Error(`Erro ao criar usuário: ${authError.message}`);
      }

      if (!newUser.user) {
        throw new Error("Falha ao criar usuário");
      }

      authUserId = newUser.user.id;
      console.log(`Novo usuário criado: ${email}, ID: ${authUserId}`);
    }

    // Obter o user_id do proprietário do negócio (quem está criando o funcionário)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Token de autorização não encontrado");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: requestUser, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !requestUser.user) {
      throw new Error("Usuário não autenticado");
    }

    const businessOwnerId = requestUser.user.id;

    // Atualizar a tabela employees com o auth_user_id
    const { error: updateError } = await supabaseAdmin
      .from("employees")
      .update({ 
        auth_user_id: authUserId,
        email: email 
      })
      .eq("id", employeeId);

    if (updateError) {
      console.error("Erro ao atualizar funcionário:", updateError);
      throw new Error(`Erro ao vincular funcionário: ${updateError.message}`);
    }

    // Criar ou atualizar permissões do funcionário
    const { error: permissionError } = await supabaseAdmin
      .from("employee_permissions")
      .upsert({
        user_id: authUserId,
        business_owner_id: businessOwnerId,
        employee_id: employeeId,
        can_view_schedule: true,
        can_edit_own_appointments: false
      }, {
        onConflict: "user_id,business_owner_id"
      });

    if (permissionError) {
      console.error("Erro ao criar permissões:", permissionError);
      throw new Error(`Erro ao configurar permissões: ${permissionError.message}`);
    }

    // Atualizar o convite como ativado
    const { error: inviteError } = await supabaseAdmin
      .from("employee_invites")
      .update({
        user_id: authUserId,
        activated_at: new Date().toISOString(),
        is_active: true
      })
      .eq("employee_id", employeeId);

    if (inviteError) {
      console.error("Erro ao atualizar convite:", inviteError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        userId: authUserId,
        message: "Usuário funcionário criado com sucesso"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Erro na função create-employee-user:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Erro interno do servidor" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
