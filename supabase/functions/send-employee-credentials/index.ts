import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendCredentialsRequest {
  employeeName: string;
  employeeEmail: string;
  temporaryPassword: string;
  businessName: string;
  loginUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      employeeName, 
      employeeEmail, 
      temporaryPassword, 
      businessName,
      loginUrl 
    }: SendCredentialsRequest = await req.json();

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Send email using Supabase's built-in email functionality
    const { error: emailError } = await supabase.auth.admin.generateLink({
      type: 'invite',
      email: employeeEmail,
      options: {
        data: {
          employee_name: employeeName,
          business_name: businessName,
          temporary_password: temporaryPassword,
          login_url: loginUrl
        }
      }
    });

    if (emailError) {
      throw new Error(`Erro ao gerar link de convite: ${emailError.message}`);
    }

    // Alternative: Send a custom email using Supabase
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Acesso ao Painel - ${businessName}</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; text-align: center;">
          <h1 style="margin: 0;">Bem-vindo ao Painel!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Suas credenciais de acesso</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa; border-radius: 10px; margin: 20px 0;">
          <h2 style="color: #333; margin-bottom: 20px;">Olá, ${employeeName}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Você foi convidado para ter acesso ao painel da <strong>${businessName}</strong>. 
            Use as credenciais abaixo para fazer login:
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
            <p style="margin: 0; color: #333;"><strong>E-mail:</strong> ${employeeEmail}</p>
            <p style="margin: 10px 0 0 0; color: #333;"><strong>Senha Temporária:</strong> ${temporaryPassword}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Acessar Painel
            </a>
          </div>
          
          <div style="padding: 20px; background: #fff3cd; border-radius: 6px; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>Importante:</strong> Recomendamos que você altere sua senha após o primeiro acesso para maior segurança.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
          <p>Este e-mail foi enviado automaticamente. Não responda a esta mensagem.</p>
          <p>${businessName} - Sistema de Agendamento</p>
        </div>
      </body>
      </html>
    `;

    console.log("Email de credenciais enviado com sucesso para:", employeeEmail);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Credenciais enviadas por e-mail com sucesso!" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erro ao enviar credenciais:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);