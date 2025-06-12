
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { setSlugContext } from "@/services/appointment/availability/slugContext";
import { ClientVerifyResult, ClientCreateResult, LoginResult, ExistingUserData } from "./types";

export const handleFormSubmission = async (
  phone: string,
  name: string,
  pin: string,
  confirmPin: string,
  pinMode: 'verify' | 'create' | null,
  existingUserData: ExistingUserData | null,
  businessSlug?: string
): Promise<LoginResult> => {
  try {
    console.log("Starting form submission with mode:", pinMode);
    
    // Validate inputs
    const cleanPhone = phone.replace(/\D/g, '');
    if (!phone || cleanPhone.length !== 11) {
      toast.error("Por favor, insira um número de telefone válido");
      return { success: false };
    }
    
    if (!existingUserData && !name) {
      toast.error("Por favor, insira seu nome");
      return { success: false };
    }
    
    // Set slug context if available
    if (businessSlug) {
      await setSlugContext(businessSlug);
    }
    
    // Get business user ID if slug is provided
    let businessUserId = null;
    if (businessSlug) {
      const { data: business } = await supabase
        .from('profiles')
        .select('id')
        .eq('slug', businessSlug)
        .maybeSingle();
      
      businessUserId = business?.id;
      console.log("Business user ID:", businessUserId);
      
      if (!businessUserId) {
        toast.error("Erro ao identificar o negócio");
        return { success: false };
      }
    }

    // PIN validation
    if (pinMode === 'verify') {
      return await handlePinVerification(cleanPhone, pin);
    } else if (pinMode === 'create') {
      return await handlePinCreation(
        cleanPhone, 
        name, 
        pin, 
        confirmPin, 
        existingUserData, 
        businessUserId
      );
    }
    
    return { success: false };
  } catch (error) {
    console.error('Error in login process:', error);
    toast.error("Erro ao processar o login: " + (error instanceof Error ? error.message : "Erro desconhecido"));
    return { success: false };
  }
};

const handlePinVerification = async (
  cleanPhone: string, 
  pin: string
): Promise<LoginResult> => {
  console.log("Verifying PIN");
  // Use secure function to verify PIN
  const { data: verifyData, error: verifyError } = await supabase
    .rpc('verify_client_pin', { 
      phone_param: cleanPhone, 
      pin_param: pin 
    });
  
  if (verifyError) {
    console.error('Error verifying PIN:', verifyError);
    toast.error("Erro ao verificar PIN");
    return { success: false };
  }
  
  console.log("PIN verification result:", verifyData);
  
  const verifyArray = verifyData as ClientVerifyResult[] | null;
  const verifyResult = verifyArray && verifyArray.length > 0 ? verifyArray[0] : null;
  
  if (!verifyResult || !verifyResult.pin_valid) {
    toast.error("PIN incorreto");
    return { success: false };
  }
  
  console.log("PIN verified successfully for user:", verifyResult.name);
  
  return { 
    success: true,
    userData: { 
      name: verifyResult.name || "Usuário", 
      phone: `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 7)}-${cleanPhone.slice(7)}`
    }
  };
};

const handlePinCreation = async (
  cleanPhone: string,
  name: string,
  pin: string,
  confirmPin: string,
  existingUserData: ExistingUserData | null,
  businessUserId: string | null
): Promise<LoginResult> => {
  console.log("Creating new PIN");
  
  // Validation
  if (pin.length !== 4) {
    toast.error("O PIN deve ter 4 dígitos");
    return { success: false };
  }
  
  if (pin !== confirmPin) {
    toast.error("Os PINs não conferem");
    return { success: false };
  }
  
  if (existingUserData) {
    console.log("Updating existing client with PIN");
    // Update existing client with PIN
    const { data: updateSuccess, error: updateError } = await supabase
      .rpc('update_client_pin', {
        phone_param: cleanPhone,
        pin_param: pin
      });
    
    if (updateError || !updateSuccess) {
      console.error('Error updating PIN:', updateError);
      toast.error("Erro ao criar PIN");
      return { success: false };
    }
    
    // If the client doesn't exist in this business, create it
    if (businessUserId) {
      console.log("Creating client copy for current business");
      const { error: createError } = await supabase
        .rpc('create_client_for_auth', {
          name_param: name || existingUserData.name || '',
          phone_param: cleanPhone,
          pin_param: pin,
          business_user_id_param: businessUserId
        });
        
      if (createError) {
        console.error('Error creating client for business:', createError);
      }
    }
    
    return { 
      success: true,
      userData: { 
        name: name || existingUserData.name || "Usuário", 
        phone: `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 7)}-${cleanPhone.slice(7)}`
      }
    };
  } else if (businessUserId) {
    console.log("Creating completely new client");
    // Create new client with PIN
    const { data: createData, error: createError } = await supabase
      .rpc('create_client_for_auth', {
        name_param: name,
        phone_param: cleanPhone,
        pin_param: pin,
        business_user_id_param: businessUserId
      });
    
    if (createError) {
      console.error('Create error:', createError);
      toast.error("Erro ao criar usuário: " + (createError.message || "Erro desconhecido"));
      return { success: false };
    }
    
    console.log("Create result:", createData);
    
    const createArray = createData as ClientCreateResult[] | null;
    const createResult = createArray && createArray.length > 0 ? createArray[0] : null;
    
    if (!createResult || !createResult.success) {
      toast.error("Erro ao criar usuário");
      return { success: false };
    }
    
    console.log("Client created successfully with ID:", createResult.id);
    
    return { 
      success: true,
      userData: { 
        name: name, 
        phone: `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 7)}-${cleanPhone.slice(7)}`
      }
    };
  } else {
    toast.error("Erro ao identificar o negócio para cadastro");
    return { success: false };
  }
};
