
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LoginResult } from "./types";
import { createClientSecure, checkClientExists } from "@/hooks/booking/utils/clientCreation";

export async function handleCreateNewUser(
  name: string,
  phone: string,
  pin: string,
  confirmPin: string,
  businessUserId: string | null
): Promise<LoginResult> {
  try {
    console.log("Creating new user:", { name, phone, businessUserId });
    
    // Validate inputs
    if (!name.trim() || name.trim().length < 2) {
      toast.error("Nome deve ter pelo menos 2 caracteres");
      return { success: false };
    }
    
    if (!phone || phone.replace(/\D/g, '').length !== 11) {
      toast.error("Número de telefone deve ter 11 dígitos (DDD + número)");
      return { success: false };
    }
    
    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      toast.error("PIN deve ter exatamente 4 dígitos numéricos");
      return { success: false };
    }
    
    if (pin !== confirmPin) {
      toast.error("Confirmação do PIN não confere");
      return { success: false };
    }
    
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if client already exists
    const clientCheck = await checkClientExists(cleanPhone);
    
    if (clientCheck.error) {
      toast.error(`Erro ao verificar cliente: ${clientCheck.error}`);
      return { success: false };
    }
    
    if (clientCheck.exists) {
      toast.error("Este número de telefone já está cadastrado");
      return { success: false };
    }
    
    // Create new client
    const createResult = await createClientSecure({
      name: name.trim(),
      phone: cleanPhone,
      pin,
      businessUserId
    });
    
    if (!createResult.success) {
      toast.error(createResult.error || "Erro ao criar usuário");
      return { success: false };
    }
    
    toast.success("Usuário criado com sucesso!");
    
    return {
      success: true,
      userData: {
        name: name.trim(),
        phone: cleanPhone
      }
    };
    
  } catch (error: any) {
    console.error("Error creating new user:", error);
    toast.error(`Erro inesperado: ${error.message || "Falha ao criar usuário"}`);
    return { success: false };
  }
}

export async function handleExistingUserLogin(
  phone: string,
  pin: string
): Promise<LoginResult> {
  try {
    console.log("Logging in existing user:", phone);
    
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Validate inputs
    if (cleanPhone.length !== 11) {
      toast.error("Formato de telefone inválido");
      return { success: false };
    }
    
    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      toast.error("PIN deve ter 4 dígitos");
      return { success: false };
    }
    
    // Verify PIN using secure RPC function
    const { data, error } = await supabase
      .rpc('verify_client_pin', {
        phone_param: cleanPhone,
        pin_param: pin
      });
    
    if (error) {
      console.error("Error verifying PIN:", error);
      toast.error("Erro ao verificar PIN");
      return { success: false };
    }
    
    if (!data || data.length === 0) {
      toast.error("Número não encontrado ou PIN incorreto");
      return { success: false };
    }
    
    const clientData = data[0];
    
    if (!clientData.pin_valid) {
      toast.error("PIN incorreto");
      return { success: false };
    }
    
    toast.success("Login realizado com sucesso!");
    
    return {
      success: true,
      userData: {
        name: clientData.name,
        phone: cleanPhone
      }
    };
    
  } catch (error: any) {
    console.error("Error logging in:", error);
    toast.error(`Erro no login: ${error.message || "Falha na autenticação"}`);
    return { success: false };
  }
}
