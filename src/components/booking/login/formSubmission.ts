
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LoginResult, ExistingUserData } from "./types";
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
    
    const cleanPhone = phone.replace(/\D/g, '');
    if (!phone || cleanPhone.length !== 11) {
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
    
    // Check if client already exists before trying to create
    console.log("Checking if client exists before creation...");
    const clientCheck = await checkClientExists(cleanPhone);
    
    if (clientCheck.error) {
      console.error("Error checking client existence:", clientCheck.error);
      toast.error(`Erro ao verificar cliente: ${clientCheck.error}`);
      return { success: false };
    }
    
    if (clientCheck.exists) {
      console.log("Client already exists");
      toast.error("Este número de telefone já está cadastrado");
      return { success: false };
    }
    
    // Create new client
    console.log("Creating new client...");
    const createResult = await createClientSecure({
      name: name.trim(),
      phone: cleanPhone,
      pin,
      businessUserId
    });
    
    if (!createResult.success) {
      console.error("Client creation failed:", createResult.error);
      toast.error(createResult.error || "Erro ao criar usuário");
      return { success: false };
    }
    
    console.log("Client created successfully:", createResult.clientId);
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

// Função para atualizar PIN de cliente existente
export async function handleUpdateClientPin(
  phone: string,
  pin: string,
  confirmPin: string,
  existingUserData: ExistingUserData
): Promise<LoginResult> {
  try {
    console.log("Updating PIN for existing client:", phone);
    
    // Validate inputs
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 11) {
      toast.error("Formato de telefone inválido");
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
    
    // Update PIN using secure RPC function
    const { data, error } = await supabase
      .rpc('update_client_pin', {
        phone_param: cleanPhone,
        pin_param: pin
      });
    
    if (error) {
      console.error("Error updating PIN:", error);
      toast.error("Erro ao atualizar PIN");
      return { success: false };
    }
    
    if (!data) {
      toast.error("Erro ao atualizar PIN");
      return { success: false };
    }
    
    console.log("PIN updated successfully for client:", existingUserData.name);
    toast.success("PIN criado com sucesso!");
    
    return {
      success: true,
      userData: {
        name: existingUserData.name,
        phone: cleanPhone
      }
    };
    
  } catch (error: any) {
    console.error("Error updating client PIN:", error);
    toast.error(`Erro inesperado: ${error.message || "Falha ao atualizar PIN"}`);
    return { success: false };
  }
}

export async function handleFormSubmission(
  phone: string,
  name: string,
  pin: string,
  confirmPin: string,
  pinMode: 'verify' | 'create' | null,
  existingUserData: ExistingUserData | null,
  businessSlug?: string
): Promise<LoginResult> {
  try {
    console.log("Handling form submission:", { pinMode, hasExistingData: !!existingUserData, businessSlug });
    
    if (!pinMode) {
      toast.error("Modo de PIN não definido");
      return { success: false };
    }
    
    if (pinMode === 'verify') {
      return await handleExistingUserLogin(phone, pin);
    } else if (pinMode === 'create') {
      // Check if this is an existing client creating PIN vs new client
      if (existingUserData) {
        // Cliente existente criando PIN - apenas atualizar PIN
        console.log("Existing client creating PIN, updating PIN only");
        return await handleUpdateClientPin(phone, pin, confirmPin, existingUserData);
      } else {
        // Novo cliente - criar usuário completo
        console.log("New client, creating full user");
        const userName = name;
        
        // Get business user ID if business slug is provided
        let businessUserId: string | null = null;
        if (businessSlug) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id')
            .eq('slug', businessSlug)
            .single();
          
          businessUserId = profileData?.id || null;
        }
        
        return await handleCreateNewUser(userName, phone, pin, confirmPin, businessUserId);
      }
    }
    
    toast.error("Modo de operação inválido");
    return { success: false };
    
  } catch (error: any) {
    console.error("Error in handleFormSubmission:", error);
    toast.error(`Erro no processamento: ${error.message || "Falha na operação"}`);
    return { success: false };
  }
}
