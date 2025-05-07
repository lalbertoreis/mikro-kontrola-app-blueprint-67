
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import bcrypt from "bcryptjs-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { setSlugContext } from "@/services/appointment/availability/slugContext";

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
  onLogin: (userData: { name: string; phone: string }) => void;
  businessSlug?: string;
  themeColor?: string;
}

const LoginDialog: React.FC<LoginDialogProps> = ({ 
  open, 
  onClose, 
  onLogin, 
  businessSlug,
  themeColor = "#9b87f5"
}) => {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinMode, setPinMode] = useState<'verify' | 'create' | null>(null);
  const [existingUserData, setExistingUserData] = useState<{ name?: string, hasPin: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Format phone number
  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    let formatted = '';
    
    if (digits.length <= 2) {
      formatted = digits;
    } else if (digits.length <= 7) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else if (digits.length <= 11) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    } else {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
    }
    
    return formatted;
  };

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
          const { data: localClient, error: localError } = await supabase
            .from('clients')
            .select('name, pin')
            .eq('phone', phone)
            .maybeSingle();
          
          if (localError) {
            if (localError.message.includes('multiple') || localError.message.includes('no rows')) {
              // If multiple results, need to get the specific client for this business
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
                    .select('name, pin')
                    .eq('phone', phone)
                    .eq('user_id', business.id) 
                    .maybeSingle();
                  
                  if (specificClient) {
                    setName(specificClient.name || '');
                    setExistingUserData({
                      name: specificClient.name,
                      hasPin: !!specificClient.pin
                    });
                    
                    if (specificClient.pin) {
                      setPinMode('verify');
                    } else {
                      setPinMode('create');
                    }
                    setIsLoading(false);
                    return;
                  }
                }
              }
              
              // Check if client exists in any business
              const { data: anyClient } = await supabase
                .rpc('get_client_by_phone', { phone_param: phone });
              
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
            } else {
              console.error('Error checking user:', localError);
              toast.error("Erro ao verificar cadastro");
            }
          } else if (localClient) {
            // Found client in current business
            if (localClient.name) {
              setName(localClient.name);
            }
            
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
            // New client for this business
            setExistingUserData(null);
            setPinMode('create');
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
          .rpc('get_client_by_phone', { phone_param: phone });
        
        if (!clientsData || clientsData.length === 0) {
          toast.error("Conta não encontrada");
          setIsLoading(false);
          return;
        }
        
        // Find a client record with a PIN
        const clientWithPin = clientsData.find(c => c.pin);
        
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
        
        // Login successful
        onLogin({ 
          name: clientWithPin.name || "Usuário", 
          phone 
        });
      } else if (pinMode === 'create') {
        // Creating new PIN
        if (pin.length !== 4) {
          toast.error("O PIN deve ter 4 dígitos");
          setIsLoading(false);
          return;
        }
        
        if (pin !== confirmPin) {
          toast.error("Os PINs não conferem");
          setIsLoading(false);
          return;
        }
        
        // Hash the PIN
        const saltRounds = 10;
        const hashedPin = await bcrypt.hash(pin, saltRounds);
        
        // Check if client exists in any business
        const { data: existingClients } = await supabase
          .rpc('get_client_by_phone', { phone_param: phone });
          
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
          
          // Call login function with user data
          onLogin({ 
            name: name || existingClients[0].name || "Usuário", 
            phone 
          });
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
            setIsLoading(false);
            return;
          }
          
          // Call login function with user data
          onLogin({ 
            name: newClient.name, 
            phone 
          });
        } else {
          toast.error("Erro ao identificar o negócio para cadastro");
          setIsLoading(false);
          return;
        }
      }
      
      // Close the dialog
      onClose();
      
    } catch (error) {
      console.error('Error in login process:', error);
      toast.error("Erro ao processar o login");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form when dialog is closed
  useEffect(() => {
    if (!open) {
      setPhone("");
      setName("");
      setPin("");
      setConfirmPin("");
      setPinMode(null);
      setExistingUserData(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-center">Acesse seus agendamentos</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Telefone (WhatsApp)
            </label>
            <input
              id="phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
              className="w-full p-2 border rounded-md"
              placeholder="(00) 00000-0000"
              disabled={isLoading}
              required
            />
          </div>
          
          {/* Only show name field for new users */}
          {!existingUserData && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome completo
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Seu nome completo"
                disabled={isLoading || (existingUserData?.name ? true : false)}
                required
              />
            </div>
          )}
          
          {pinMode === 'verify' && (
            <div>
              <label htmlFor="verify-pin" className="block text-sm font-medium text-gray-700 mb-1">
                Digite seu PIN de acesso
              </label>
              <div className="flex justify-center my-2">
                <InputOTP 
                  maxLength={4} 
                  value={pin} 
                  onChange={setPin}
                  disabled={isLoading}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">
                Digite o PIN de 4 dígitos que você criou anteriormente.
              </p>
            </div>
          )}
          
          {pinMode === 'create' && (
            <>
              <div>
                <label htmlFor="create-pin" className="block text-sm font-medium text-gray-700 mb-1">
                  Crie um PIN de acesso (4 dígitos)
                </label>
                <div className="flex justify-center my-2">
                  <InputOTP 
                    maxLength={4} 
                    value={pin} 
                    onChange={setPin}
                    disabled={isLoading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
              
              <div>
                <label htmlFor="confirm-pin" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirme o PIN
                </label>
                <div className="flex justify-center my-2">
                  <InputOTP 
                    maxLength={4} 
                    value={confirmPin} 
                    onChange={setConfirmPin}
                    disabled={isLoading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Esse PIN será usado para acessar e gerenciar seus agendamentos futuramente.
                </p>
              </div>
            </>
          )}
          
          <Button
            type="submit"
            className="w-full text-white"
            style={{ backgroundColor: themeColor, borderColor: themeColor }}
            disabled={isLoading || 
              !phone || 
              (!existingUserData && !name) ||
              (pinMode === 'verify' && pin.length !== 4) ||
              (pinMode === 'create' && (pin.length !== 4 || pin !== confirmPin))
            }
          >
            {isLoading ? "Processando..." : "Entrar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
