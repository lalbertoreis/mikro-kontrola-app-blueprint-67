
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import bcrypt from "bcryptjs-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
  onLogin: (userData: { name: string; phone: string }) => void;
  businessSlug?: string;
  themeColor?: string; // Add theme color prop
}

const LoginDialog: React.FC<LoginDialogProps> = ({ 
  open, 
  onClose, 
  onLogin, 
  businessSlug,
  themeColor = "#9b87f5" // Default color
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
            await supabase.rpc('set_slug_for_session', { slug: businessSlug });
          }
          
          // Verificar cliente em qualquer estabelecimento
          const { data, error } = await supabase
            .from('clients')
            .select('name, pin')
            .eq('phone', phone)
            .maybeSingle();
          
          if (error) {
            console.error('Error checking user:', error);
            setIsLoading(false);
            return;
          }
          
          // If user exists
          if (data) {
            if (data.name) {
              setName(data.name);
            }
            
            // Check if user has a PIN
            setExistingUserData({ 
              name: data.name,
              hasPin: !!data.pin 
            });
            
            if (data.pin) {
              setPinMode('verify');
            } else {
              setPinMode('create');
            }
          } else {
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
        await supabase.rpc('set_slug_for_session', { slug: businessSlug });
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
      }

      // PIN validation
      if (pinMode === 'verify') {
        // Check PIN
        const { data, error } = await supabase
          .from('clients')
          .select('pin, name, id, user_id')
          .eq('phone', phone)
          .maybeSingle();
          
        if (error) {
          toast.error("Erro ao verificar PIN");
          setIsLoading(false);
          return;
        }
        
        if (!data || !data.pin) {
          toast.error("Conta não encontrada");
          setIsLoading(false);
          return;
        }
        
        // Compare PIN with stored hash
        const pinMatch = await bcrypt.compare(pin, data.pin);
        if (!pinMatch) {
          toast.error("PIN incorreto");
          setIsLoading(false);
          return;
        }
        
        // Se o cliente existe em outro estabelecimento, mas não neste, copiar para este estabelecimento
        if (businessUserId && data.user_id !== businessUserId) {
          const { data: existingLocalClient } = await supabase
            .from('clients')
            .select('id')
            .eq('phone', phone)
            .eq('user_id', businessUserId)
            .maybeSingle();
            
          if (!existingLocalClient) {
            // Clona o cliente para este estabelecimento
            await supabase
              .from('clients')
              .insert({
                name: data.name,
                phone: phone,
                pin: data.pin,  // Mantém o mesmo PIN
                user_id: businessUserId
              });
          }
        }
        
        // Se chegou aqui, o PIN está correto
        // Call login function with user data
        onLogin({ 
          name: data.name || "Usuário", 
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
        
        // Check if user exists in any business
        const { data: existingClient } = await supabase
          .from('clients')
          .select('id, name, user_id')
          .eq('phone', phone)
          .maybeSingle();
          
        if (existingClient) {
          // Update existing client with PIN
          await supabase
            .from('clients')
            .update({ 
              pin: hashedPin,
              name: name || existingClient.name || ''
            })
            .eq('id', existingClient.id);
            
          // Se o cliente existe em outro estabelecimento, mas não neste, copiar para este estabelecimento
          if (businessUserId && existingClient.user_id !== businessUserId) {
            const { data: existingLocalClient } = await supabase
              .from('clients')
              .select('id')
              .eq('phone', phone)
              .eq('user_id', businessUserId)
              .maybeSingle();
              
            if (!existingLocalClient) {
              // Clona o cliente para este estabelecimento
              await supabase
                .from('clients')
                .insert({
                  name: name || existingClient.name || '',
                  phone: phone,
                  pin: hashedPin,
                  user_id: businessUserId
                });
            }
          }
          
          // Call login function with user data
          onLogin({ 
            name: name || existingClient.name || "Usuário", 
            phone 
          });
        } else {
          // Create new client with PIN
          const { data: newClient, error } = await supabase
            .from('clients')
            .insert([
              { 
                name, 
                phone,
                pin: hashedPin,
                user_id: businessUserId || (await supabase.auth.getUser()).data.user?.id
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
