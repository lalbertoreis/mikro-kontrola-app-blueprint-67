
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import bcrypt from "bcryptjs-react";
import { setSlugContext } from "@/services/appointment/availability/slugContext";

interface Client {
  id: string;
  name: string;
  phone: string;
  pin?: string;
  email?: string;
  user_id: string;
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
          
          // First try to find a client within the current business context
          let localClient = null;
          
          if (businessSlug) {
            // First get the business user ID
            const { data: business } = await supabase
              .from('profiles')
              .select('id')
              .eq('slug', businessSlug)
              .maybeSingle();
              
            if (business && business.id) {
              // Then get the client for this specific business
              const { data: specificClient } = await supabase
                .from('clients')
                .select('id, name, phone, pin')
                .eq('phone', phone)
                .eq('user_id', business.id) 
                .maybeSingle();
              
              if (specificClient) {
                localClient = specificClient;
              }
            }
          }
          
          if (localClient) {
            // Found client in current business
            setName(localClient.name || '');
            setExistingUserData({
              name: localClient.name,
              hasPin: !!localClient.pin
            });
            
            if (localClient.pin) {
              setPinMode('verify');
            } else {
              setPinMode('create');
            }
          } else {
            // Check if client exists in any business
            const { data: anyClientData } = await supabase
              .from('clients')
              .select('id, name, phone, pin, user_id')
              .eq('phone', phone);
            
            const anyClient = anyClientData as Client[] | null;
            
            if (anyClient && anyClient.length > 0) {
              // Client exists in another business
              setName(anyClient[0].name || '');
              setExistingUserData({
                name: anyClient[0].name,
                hasPin: !!anyClient[0].pin
              });
              
              if (anyClient[0].pin) {
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
      if (!phone || phone.replace(/\D/g, '').length !== 11) {
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
      } else {
        // If no slug, try to get the current user ID
        const { data: { user } } = await supabase.auth.getUser();
        businessUserId = user?.id;
      }

      // PIN validation
      if (pinMode === 'verify') {
        // Search the client by phone across all businesses
        const { data: clientsData } = await supabase
          .from('clients')
          .select('id, name, phone, pin, user_id')
          .eq('phone', phone);
        
        const clientsWithTyping = clientsData as Client[] | null;
        
        if (!clientsWithTyping || clientsWithTyping.length === 0) {
          toast.error("Conta não encontrada");
          setIsLoading(false);
          return;
        }
        
        // Find a client record with a PIN
        const clientWithPin = clientsWithTyping.find(c => c.pin);
        
        if (!clientWithPin || !clientWithPin.pin) {
          toast.error("PIN não encontrado, crie um novo PIN");
          setPinMode('create');
          setIsLoading(false);
          return;
        }
        
        // Compare PIN with stored hash
        const pinMatch = await bcrypt.compare(pin, clientWithPin.pin);
        if (!pinMatch) {
          toast.error("PIN incorreto");
          setIsLoading(false);
          return;
        }
        
        // If the client exists in another business, but not in this one, copy it
        if (businessUserId) {
          const { data: existingLocalClient } = await supabase
            .from('clients')
            .select('id')
            .eq('phone', phone)
            .eq('user_id', businessUserId)
            .maybeSingle();
            
          if (!existingLocalClient) {
            // Clone the client to this business
            await supabase
              .from('clients')
              .insert({
                name: clientWithPin.name || name,
                phone: phone,
                pin: clientWithPin.pin,
                user_id: businessUserId
              });
          }
        }
        
        return { 
          success: true,
          userData: { 
            name: clientWithPin.name || "Usuário", 
            phone 
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
        
        // Hash the PIN
        const saltRounds = 10;
        const hashedPin = await bcrypt.hash(pin, saltRounds);
        
        // Check if client exists in any business
        const { data: existingClientsData } = await supabase
          .from('clients')
          .select('id, name, phone, pin, user_id')
          .eq('phone', phone);
        
        const existingClients = existingClientsData as Client[] | null;
          
        if (existingClients && existingClients.length > 0) {
          // Update existing clients with PIN across all businesses
          for (const client of existingClients) {
            await supabase
              .from('clients')
              .update({ 
                pin: hashedPin,
                name: name || client.name || ''
              })
              .eq('id', client.id);
          }
          
          // If the client doesn't exist in this business, create it
          if (businessUserId && !existingClients.some(c => c.user_id === businessUserId)) {
            await supabase
              .from('clients')
              .insert({
                name: name || existingClients[0].name || '',
                phone: phone,
                pin: hashedPin,
                user_id: businessUserId
              });
          }
          
          return { 
            success: true,
            userData: { 
              name: name || existingClients[0].name || "Usuário", 
              phone 
            }
          };
        } else if (businessUserId) {
          // Create new client with PIN
          const { data: newClient, error } = await supabase
            .from('clients')
            .insert([
              { 
                name, 
                phone,
                pin: hashedPin,
                user_id: businessUserId
              }
            ])
            .select()
            .single();
            
          if (error) {
            console.error('Insert error:', error);
            toast.error("Erro ao criar usuário");
            return { success: false };
          }
          
          return { 
            success: true,
            userData: { 
              name: newClient.name, 
              phone 
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
