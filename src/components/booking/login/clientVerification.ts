
import { supabase } from "@/integrations/supabase/client";
import { setSlugContext } from "@/services/appointment/availability/slugContext";
import { ClientCheckResult, ExistingUserData } from "./types";

export const checkClientExists = async (
  phone: string, 
  businessSlug?: string
): Promise<ExistingUserData | null> => {
  if (!phone || phone.replace(/\D/g, '').length !== 11) {
    return null;
  }

  try {
    console.log("Checking user exists for phone:", phone, "business:", businessSlug);
    
    // Set slug context if available
    if (businessSlug) {
      await setSlugContext(businessSlug);
    }
    
    // Use the secure function to check if client exists
    const cleanPhone = phone.replace(/\D/g, '');
    const { data: clientData, error } = await supabase
      .rpc('check_client_by_phone', { phone_param: cleanPhone });
    
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
      // Check if client exists in other businesses
      console.log("Client not found, checking other businesses");
      const { data: allClientsData, error: findError } = await supabase
        .rpc('find_clients_by_phone', { phone_param: cleanPhone });
      
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
