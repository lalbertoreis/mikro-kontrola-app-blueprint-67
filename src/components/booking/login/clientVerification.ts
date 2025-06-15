
import { supabase } from "@/integrations/supabase/client";
import { setSlugContext } from "@/services/appointment/availability/slugContext";
import { ClientCheckResult, ExistingUserData } from "./types";

/**
 * Normalize phone number to ensure consistent format for database queries
 * Only accepts 11 digit numbers
 */
const normalizePhoneForDatabase = (phone: string): string => {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  console.log("normalizePhoneForDatabase - Input:", phone, "Digits:", digitsOnly);
  
  // Return the digits as-is - let the database functions handle the format validation
  return digitsOnly;
};

export const checkClientExists = async (
  phone: string, 
  businessSlug?: string
): Promise<ExistingUserData | null> => {
  const normalizedPhone = normalizePhoneForDatabase(phone);
  
  // Validate phone length (only 11 digits accepted)
  if (!normalizedPhone || normalizedPhone.length !== 11) {
    console.log("checkClientExists - Invalid phone length:", normalizedPhone.length);
    return null;
  }

  try {
    console.log("Checking user exists for normalized phone:", normalizedPhone, "business:", businessSlug);
    
    // Set slug context if available
    if (businessSlug) {
      await setSlugContext(businessSlug);
    }
    
    // Use the secure function to check if client exists with normalized phone
    const { data: clientData, error } = await supabase
      .rpc('check_client_by_phone', { phone_param: normalizedPhone });
    
    if (error) {
      console.error('Error checking client:', error);
      throw new Error("Erro ao verificar cadastro");
    }
    
    console.log("Client check result:", clientData);
    
    const clientArray = clientData as ClientCheckResult[] | null;
    const client = clientArray && clientArray.length > 0 ? clientArray[0] : null;
    
    if (client) {
      // Client exists
      console.log("Client found:", client);
      return {
        name: client.name,
        hasPin: client.has_pin
      };
    } else {
      // Check if client exists in other businesses with the normalized phone
      console.log("Client not found, checking other businesses with normalized phone");
      const { data: allClientsData, error: findError } = await supabase
        .rpc('find_clients_by_phone', { phone_param: normalizedPhone });
      
      if (findError) {
        console.error('Error finding clients:', findError);
        // Continue as new client
        return null;
      }
      
      console.log("All clients result:", allClientsData);
      
      const allClientsArray = allClientsData as ClientCheckResult[] | null;
      const allClients = allClientsArray || [];
      
      if (allClients.length > 0) {
        // Client exists in another business
        const firstClient = allClients[0];
        console.log("Found client in another business:", firstClient);
        return {
          name: firstClient.name,
          hasPin: firstClient.has_pin
        };
      } else {
        // New client
        console.log("No client found, creating new");
        return null;
      }
    }
  } catch (err) {
    console.error('Error in checkClientExists:', err);
    throw new Error("Erro ao verificar cadastro");
  }
};
