
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CreateClientResult {
  success: boolean;
  clientId?: string;
  error?: string;
}

/**
 * Create a new client using the secure RPC function
 */
export async function createClientSecure({
  name,
  phone,
  pin,
  businessUserId
}: {
  name: string;
  phone: string;
  pin?: string;
  businessUserId: string | null;
}): Promise<CreateClientResult> {
  try {
    console.log("Creating client with secure RPC function:", { name, phone, hasPin: !!pin, businessUserId });
    
    // Clean phone number - remove all non-digits
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Validate phone number format (Brazilian format: 11 digits)
    if (cleanPhone.length !== 11) {
      return {
        success: false,
        error: 'Número de telefone deve ter 11 dígitos (DDD + número)'
      };
    }
    
    // Validate name
    if (!name || name.trim().length < 2) {
      return {
        success: false,
        error: 'Nome deve ter pelo menos 2 caracteres'
      };
    }
    
    // Validate PIN if provided
    if (pin && pin.length !== 4) {
      return {
        success: false,
        error: 'PIN deve ter exatamente 4 dígitos'
      };
    }
    
    // Call the secure RPC function
    const { data, error } = await supabase
      .rpc('create_client_for_auth', {
        name_param: name.trim(),
        phone_param: cleanPhone,
        pin_param: pin || null,
        business_user_id_param: businessUserId
      });
    
    if (error) {
      console.error('RPC function error:', error);
      return {
        success: false,
        error: `Erro ao criar cliente: ${error.message}`
      };
    }
    
    if (!data || data.length === 0 || !data[0].success) {
      console.error('RPC function returned failure:', data);
      return {
        success: false,
        error: 'Erro ao criar cliente: dados inválidos ou telefone já cadastrado'
      };
    }
    
    const clientId = data[0].id;
    console.log('Client created successfully:', clientId);
    
    return {
      success: true,
      clientId: clientId
    };
    
  } catch (error: any) {
    console.error('Error in createClientSecure:', error);
    return {
      success: false,
      error: `Erro inesperado: ${error.message || 'Falha na criação do cliente'}`
    };
  }
}

/**
 * Verify if a client exists by phone number
 */
export async function checkClientExists(phone: string): Promise<{
  exists: boolean;
  client?: any;
  error?: string;
}> {
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length !== 11) {
      return {
        exists: false,
        error: 'Formato de telefone inválido'
      };
    }
    
    const { data, error } = await supabase
      .rpc('check_client_by_phone', { phone_param: cleanPhone });
    
    if (error) {
      console.error('Error checking client:', error);
      return {
        exists: false,
        error: error.message
      };
    }
    
    const exists = data && data.length > 0;
    
    return {
      exists,
      client: exists ? data[0] : null
    };
    
  } catch (error: any) {
    console.error('Error in checkClientExists:', error);
    return {
      exists: false,
      error: error.message
    };
  }
}
