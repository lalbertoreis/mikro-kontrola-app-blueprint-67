
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, temporaryPassword, employeeId, employeeName } = await req.json();

    console.log('Creating user for employee:', { email, employeeId, employeeName });

    // Criar usuário no Supabase Auth
    const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
      email: email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        employee_id: employeeId,
        employee_name: employeeName,
        role: 'employee'
      }
    });

    if (createError) {
      console.error('Erro ao criar usuário:', createError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Erro ao criar usuário: ${createError.message}` 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    console.log('Usuário criado com sucesso:', newUser.user?.id);

    // Obter o ID do proprietário do negócio a partir do employee
    const { data: employee, error: employeeError } = await supabaseClient
      .from('employees')
      .select('user_id')
      .eq('id', employeeId)
      .single();

    if (employeeError) {
      console.error('Erro ao buscar funcionário:', employeeError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Erro ao buscar funcionário: ${employeeError.message}` 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Criar permissões para o funcionário
    const { error: permissionsError } = await supabaseClient
      .from('employee_permissions')
      .insert({
        user_id: newUser.user!.id,
        employee_id: employeeId,
        business_owner_id: employee.user_id,
        can_view_calendar: true,
        can_manage_appointments: false,
        can_edit_own_appointments: false
      });

    if (permissionsError) {
      console.error('Erro ao criar permissões:', permissionsError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Erro ao configurar permissões: ${permissionsError.message}` 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Atualizar o convite com o user_id
    const { error: updateInviteError } = await supabaseClient
      .from('employee_invites')
      .update({
        user_id: newUser.user!.id,
        activated_at: new Date().toISOString()
      })
      .eq('employee_id', employeeId);

    if (updateInviteError) {
      console.error('Erro ao atualizar convite:', updateInviteError);
    }

    // Atualizar employee com auth_user_id
    const { error: updateEmployeeError } = await supabaseClient
      .from('employees')
      .update({ auth_user_id: newUser.user!.id })
      .eq('id', employeeId);

    if (updateEmployeeError) {
      console.error('Erro ao atualizar funcionário:', updateEmployeeError);
    }

    console.log('Usuário e permissões criados com sucesso');

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: newUser.user!.id,
        message: 'Usuário criado com sucesso' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Erro inesperado:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Erro inesperado: ${error.message}` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
})
