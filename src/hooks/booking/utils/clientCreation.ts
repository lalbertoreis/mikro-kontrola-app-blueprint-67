
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
    
    // More flexible phone validation - accept various formats
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      return {
        success: false,
        error: 'Número de telefone deve ter entre 10 e 11 dígitos'
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
    if (pin && (pin.length !== 4 || !/^\d{4}$/.test(pin))) {
      return {
        success: false,
        error: 'PIN deve ter exatamente 4 dígitos numéricos'
      };
    }
    
    // Normalize phone to 11 digits if needed (add leading 0 for area codes)
    const normalizedPhone = cleanPhone.length === 10 ? `0${cleanPhone}` : cleanPhone;
    
    // Call the secure RPC function
    const { data, error } = await supabase
      .rpc('create_client_for_auth', {
        name_param: name.trim(),
        phone_param: normalizedPhone,
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
    
    if (!data || data.length === 0) {
      console.error('RPC function returned no data');
      return {
        success: false,
        error: 'Erro interno: função não retornou dados'
      };
    }
    
    const result = data[0];
    
    // Check if the operation was successful using the new return structure
    if (!result.success) {
      console.error('RPC function returned failure:', result);
      const errorMessage = result.error_message || 'Erro desconhecido na criação do cliente';
      return {
        success: false,
        error: errorMessage
      };
    }
    
    if (!result.id) {
      console.error('RPC function succeeded but no ID returned:', result);
      return {
        success: false,
        error: 'Erro interno: cliente criado mas ID não retornado'
      };
    }
    
    console.log('Client created successfully:', result.id);
    
    return {
      success: true,
      clientId: result.id
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
 * Verify if a client exists by phone number - more flexible validation
 */
export async function checkClientExists(phone: string): Promise<{
  exists: boolean;
  client?: any;
  error?: string;
}> {
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    
    // More flexible validation - accept 10 or 11 digits
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      return {
        exists: false,
        error: 'Formato de telefone inválido'
      };
    }
    
    // Try both normalized formats
    const phoneFormats = [cleanPhone];
    if (cleanPhone.length === 10) {
      phoneFormats.push(`0${cleanPhone}`);
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
      phoneFormats.push(cleanPhone.substring(1));
    }
    
    for (const phoneFormat of phoneFormats) {
      const { data, error } = await supabase
        .rpc('check_client_by_phone', { phone_param: phoneFormat });
      
      if (error) {
        console.error('Error checking client with format', phoneFormat, ':', error);
        continue;
      }
      
      if (data && data.length > 0) {
        return {
          exists: true,
          client: data[0]
        };
      }
    }
    
    return {
      exists: false
    };
    
  } catch (error: any) {
    console.error('Error in checkClientExists:', error);
    return {
      exists: false,
      error: error.message
    };
  }
}
