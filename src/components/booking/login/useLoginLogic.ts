
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { setSlugContext } from "@/services/appointment/availability/slugContext";

interface ClientCheckResult {
  id: string;
  name: string;
  phone: string;
  user_id: string;
  has_pin: boolean;
}

interface ClientCreateResult {
  id: string;
  success: boolean;
}

interface ClientVerifyResult {
  id: string;
  name: string;
  phone: string;
  user_id: string;
  pin_valid: boolean;
}

export function useLoginLogic(businessSlug?: string) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinMode, setPinMode] = useState<'verify' | 'create' | null>(null);
  const [existingUserData, setExistingUserData] = useState<{ name?: string, hasPin: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user exists when phone number is complete
  useEffect(() => {
    const checkUserExists = async () => {
      if (phone && phone.replace(/\D/g, '').length === 11) {
        try {
          setIsLoading(true);
          
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
            toast.error("Erro ao verificar cadastro");
            return;
          }
          
          const client = clientData as ClientCheckResult | null;
          
          if (client) {
            // Client exists
            setName(client.name || '');
            setExistingUserData({
              name: client.name,
              hasPin: client.has_pin
            });
            
            if (client.has_pin) {
              setPinMode('verify');
            } else {
              setPinMode('create');
            }
          } else {
            // Check if client exists in other businesses
            const { data: allClientsData, error: findError } = await supabase
              .rpc('find_clients_by_phone', { phone_param: cleanPhone });
            
            if (findError) {
              console.error('Error finding clients:', findError);
              // Continue as new client
              setExistingUserData(null);
              setPinMode('create');
              return;
            }
            
            const allClients = allClientsData as ClientCheckResult[] | null;
            
            if (allClients && allClients.length > 0) {
              // Client exists in another business
              const firstClient = allClients[0];
              setName(firstClient.name || '');
              setExistingUserData({
                name: firstClient.name,
                hasPin: firstClient.has_pin
              });
              
              if (firstClient.has_pin) {
                setPinMode('verify');
              } else {
                setPinMode('create');
              }
            } else {
              // New client
              setExistingUserData(null);
              setPinMode('create');
            }
          }
        } catch (err) {
          console.error('Error in checkUserExists:', err);
          toast.error("Erro ao verificar cadastro");
        } finally {
          setIsLoading(false);
        }
      } else {
        // Reset data if phone is cleared or incomplete
        setPinMode(null);
        setExistingUserData(null);
      }
    };
    
    checkUserExists();
  }, [phone, businessSlug]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate inputs
      const cleanPhone = phone.replace(/\D/g, '');
      if (!phone || cleanPhone.length !== 11) {
        toast.error("Por favor, insira um número de telefone válido");
        setIsLoading(false);
        return;
      }
      
      if (!existingUserData && !name) {
        toast.error("Por favor, insira seu nome");
        setIsLoading(false);
        return;
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
        if (!businessUserId) {
          toast.error("Erro ao identificar o negócio");
          setIsLoading(false);
          return;
        }
      }

      // PIN validation
      if (pinMode === 'verify') {
        // Use secure function to verify PIN
        const { data: verifyData, error: verifyError } = await supabase
          .rpc('verify_client_pin', { 
            phone_param: cleanPhone, 
            pin_param: pin 
          });
        
        if (verifyError) {
          console.error('Error verifying PIN:', verifyError);
          toast.error("Erro ao verificar PIN");
          setIsLoading(false);
          return;
        }
        
        const verifyResult = verifyData as ClientVerifyResult | null;
        
        if (!verifyResult || !verifyResult.pin_valid) {
          toast.error("PIN incorreto");
          setIsLoading(false);
          return;
        }
        
        // If the client exists in another business, but not in this one, copy it
        if (businessUserId && verifyResult.user_id !== businessUserId) {
          const { error: createError } = await supabase
            .rpc('create_client_for_auth', {
              name_param: verifyResult.name || name,
              phone_param: cleanPhone,
              pin_param: pin,
              business_user_id_param: businessUserId
            });
            
          if (createError) {
            console.error('Error copying client to business:', createError);
          }
        }
        
        return { 
          success: true,
          userData: { 
            name: verifyResult.name || "Usuário", 
            phone: phone 
          }
        };
      } else if (pinMode === 'create') {
        // Creating new PIN
        if (pin.length !== 4) {
          toast.error("O PIN deve ter 4 dígitos");
          setIsLoading(false);
          return { success: false };
        }
        
        if (pin !== confirmPin) {
          toast.error("Os PINs não conferem");
          setIsLoading(false);
          return { success: false };
        }
        
        if (existingUserData) {
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
            await supabase
              .rpc('create_client_for_auth', {
                name_param: name || existingUserData.name || '',
                phone_param: cleanPhone,
                pin_param: pin,
                business_user_id_param: businessUserId
              });
          }
          
          return { 
            success: true,
            userData: { 
              name: name || existingUserData.name || "Usuário", 
              phone: phone 
            }
          };
        } else if (businessUserId) {
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
            toast.error("Erro ao criar usuário");
            return { success: false };
          }
          
          const createResult = createData as ClientCreateResult | null;
          
          if (!createResult || !createResult.success) {
            toast.error("Erro ao criar usuário");
            return { success: false };
          }
          
          return { 
            success: true,
            userData: { 
              name: name, 
              phone: phone 
            }
          };
        } else {
          toast.error("Erro ao identificar o negócio para cadastro");
          return { success: false };
        }
      }
      
      return { success: false };
    } catch (error) {
      console.error('Error in login process:', error);
      toast.error("Erro ao processar o login");
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setPhone("");
    setName("");
    setPin("");
    setConfirmPin("");
    setPinMode(null);
    setExistingUserData(null);
  };

  return {
    phone,
    setPhone,
    name, 
    setName,
    pin,
    setPin,
    confirmPin,
    setConfirmPin,
    pinMode,
    existingUserData,
    isLoading,
    handleSubmit,
    resetForm
  };
}
