import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InviteEmailRequest {
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
    }: InviteEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Kontrola <convites@resend.dev>",
      to: [employeeEmail],
      subject: `Convite para acessar o painel - ${businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Convite para o Painel</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Kontrola - Sistema de Agendamento</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Olá, ${employeeName}!</h2>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              Você foi convidado(a) para acessar o painel administrativo da empresa <strong>${businessName}</strong>.
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #333; margin-top: 0; font-size: 18px;">Suas credenciais de acesso:</h3>
              <p style="margin: 10px 0; color: #666;"><strong>Email:</strong> ${employeeEmail}</p>
              <p style="margin: 10px 0; color: #666;"><strong>Senha temporária:</strong> <code style="background: #e9ecef; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${temporaryPassword}</code></p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold; 
                        font-size: 16px;
                        display: inline-block;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                Acessar Painel
              </a>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 25px 0;">
              <h4 style="color: #856404; margin-top: 0; display: flex; align-items: center;">
                <span style="margin-right: 8px;">⚠️</span> Importante
              </h4>
              <p style="color: #856404; margin: 0; font-size: 14px;">
                Por motivos de segurança, você deve alterar sua senha no primeiro acesso ao sistema.
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              Este convite foi enviado automaticamente pelo sistema Kontrola.<br>
              Se você não esperava receber este e-mail, pode ignorá-lo com segurança.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Employee invite email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-employee-invite function:", error);
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