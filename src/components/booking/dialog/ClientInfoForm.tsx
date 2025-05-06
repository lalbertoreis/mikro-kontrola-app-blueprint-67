
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import bcrypt from "bcryptjs-react";

interface ClientInfoFormProps {
  clientInfo: { name: string; phone: string; pin?: string };
  onClientInfoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPreviousStep: () => void;
  onNextStep: () => void;
  businessSlug?: string;
}

const ClientInfoForm: React.FC<ClientInfoFormProps> = ({
  clientInfo,
  onClientInfoChange,
  onPreviousStep,
  onNextStep,
  businessSlug
}) => {
  const [pinMode, setPinMode] = useState<'verify' | 'create' | null>(null);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [existingUserData, setExistingUserData] = useState<{ name?: string, hasPin: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Add phone input formatting
  const formatPhoneNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    let formattedValue = '';
    
    if (value.length <= 2) {
      formattedValue = value;
    } else if (value.length <= 7) {
      formattedValue = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length <= 11) {
      formattedValue = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else {
      formattedValue = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`;
    }
    
    // Create a synthetic event to pass to the parent handler
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: 'phone',
        value: formattedValue
      }
    };
    
    onClientInfoChange(syntheticEvent);
  };

  // Check if user exists when phone number is complete
  useEffect(() => {
    const checkUserExists = async () => {
      if (clientInfo.phone && clientInfo.phone.replace(/\D/g, '').length === 11) {
        try {
          setIsLoading(true);
          
          // Set slug context if available
          if (businessSlug) {
            await supabase.rpc('set_slug_for_session', { slug: businessSlug });
          }
          
          // Get the business user ID if slug is provided
          let businessUserId = null;
          if (businessSlug) {
            const { data: business } = await supabase
              .from('profiles')
              .select('id')
              .eq('slug', businessSlug)
              .maybeSingle();
            
            businessUserId = business?.id;
          }
          
          // First check if client exists in this business
          const { data: localClient, error: localClientError } = await supabase
            .from('clients')
            .select('id, name, pin')
            .eq('phone', clientInfo.phone)
            .eq('user_id', businessUserId || (await supabase.auth.getUser()).data.user?.id)
            .maybeSingle();
          
          if (localClient) {
            // Client exists in this business
            // Create synthetic event to update name from database
            if (localClient.name) {
              const syntheticNameEvent = {
                target: {
                  name: 'name',
                  value: localClient.name
                }
              } as React.ChangeEvent<HTMLInputElement>;
              
              onClientInfoChange(syntheticNameEvent);
            }
            
            // Check if user has a PIN
            setExistingUserData({ 
              name: localClient.name,
              hasPin: !!localClient.pin 
            });
            
            if (localClient.pin) {
              setPinMode('verify');
            } else {
              setPinMode('create');
            }
            
            setIsLoading(false);
            return;
          }
          
          // If client doesn't exist in this business, check other businesses
          const { data: anyClient } = await supabase
            .from('clients')
            .select('name, pin')
            .eq('phone', clientInfo.phone)
            .maybeSingle();
            
          if (anyClient) {
            // Client exists in another business
            // Create synthetic event to update name from database
            if (anyClient.name) {
              const syntheticNameEvent = {
                target: {
                  name: 'name',
                  value: anyClient.name
                }
              } as React.ChangeEvent<HTMLInputElement>;
              
              onClientInfoChange(syntheticNameEvent);
            }
            
            // Set existing user data
            setExistingUserData({ 
              name: anyClient.name,
              hasPin: !!anyClient.pin 
            });
            
            // If client has PIN in another business, use it
            if (anyClient.pin) {
              setPinMode('verify');
            } else {
              setPinMode('create');
            }
          } else {
            // Completely new client
            setExistingUserData(null);
            setPinMode('create');
          }
        } catch (err) {
          console.error('Error in checkUserExists:', err);
          toast.error("Erro ao verificar cadastro");
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    checkUserExists();
  }, [clientInfo.phone, onClientInfoChange, businessSlug]);

  const handlePinChange = (value: string) => {
    setPin(value);
  };

  const handleSubmit = async () => {
    // Validate PIN
    if (pinMode === 'create') {
      if (pin.length !== 4) {
        toast.error("O PIN deve ter 4 dígitos");
        return;
      }
      
      if (pin !== confirmPin) {
        toast.error("Os PINs não conferem");
        return;
      }

      // Create synthetic event for PIN
      const syntheticPinEvent = {
        target: {
          name: 'pin',
          value: pin
        }
      } as React.ChangeEvent<HTMLInputElement>;
      
      onClientInfoChange(syntheticPinEvent);
      onNextStep();
      
    } else if (pinMode === 'verify') {
      if (pin.length !== 4) {
        toast.error("O PIN deve ter 4 dígitos");
        return;
      }
      
      // Verificar PIN
      try {
        setIsLoading(true);
        
        // Set slug context if available
        if (businessSlug) {
          await supabase.rpc('set_slug_for_session', { slug: businessSlug });
        }
        
        // Buscar usuário em qualquer estabelecimento
        const { data, error } = await supabase
          .from('clients')
          .select('pin')
          .eq('phone', clientInfo.phone)
          .maybeSingle();
          
        if (error || !data || !data.pin) {
          console.error("Error verifying PIN:", error);
          toast.error("Erro ao verificar PIN");
          setIsLoading(false);
          return;
        }
        
        const match = await bcrypt.compare(pin, data.pin);
        
        if (!match) {
          toast.error("PIN incorreto");
          setIsLoading(false);
          return;
        }
        
        // PIN correto, prosseguir
        const syntheticPinEvent = {
          target: {
            name: 'pin',
            value: pin
          }
        } as React.ChangeEvent<HTMLInputElement>;
        
        onClientInfoChange(syntheticPinEvent);
        onNextStep();
      } catch (err) {
        console.error('Error verifying PIN:', err);
        toast.error("Erro ao verificar PIN");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPreviousStep}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-semibold text-lg">Seus dados</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">
            Telefone (WhatsApp)
          </label>
          <input
            id="phone"
            name="phone"
            value={clientInfo.phone}
            onChange={(e) => formatPhoneNumber(e)}
            className="w-full p-2 border rounded-md"
            placeholder="(00) 00000-0000"
            required
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            Este número será usado para enviar confirmações e lembretes do agendamento.
          </p>
        </div>

        {(existingUserData === null || !existingUserData.name) && (
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nome completo
            </label>
            <input
              id="name"
              name="name"
              value={clientInfo.name}
              onChange={onClientInfoChange}
              className="w-full p-2 border rounded-md"
              placeholder="Seu nome completo"
              required
              disabled={isLoading || (existingUserData?.name ? true : false)}
            />
          </div>
        )}

        {pinMode === 'verify' && (
          <div className="space-y-2">
            <label htmlFor="pin" className="text-sm font-medium">
              Digite seu PIN de acesso (4 dígitos)
            </label>
            <div className="flex justify-center my-2">
              <InputOTP 
                maxLength={4} 
                value={pin} 
                onChange={handlePinChange}
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
            <p className="text-xs text-muted-foreground text-center">
              Digite o PIN de 4 dígitos que você criou anteriormente.
            </p>
          </div>
        )}

        {pinMode === 'create' && (
          <>
            <div className="space-y-2">
              <label htmlFor="pin" className="text-sm font-medium">
                Crie um PIN de acesso (4 dígitos)
              </label>
              <div className="flex justify-center my-2">
                <InputOTP 
                  maxLength={4} 
                  value={pin} 
                  onChange={handlePinChange}
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
            
            <div className="space-y-2">
              <label htmlFor="confirmPin" className="text-sm font-medium">
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
              <p className="text-xs text-muted-foreground text-center">
                Esse PIN será usado para acessar e gerenciar seus agendamentos futuramente.
              </p>
            </div>
          </>
        )}

        <Button
          className="w-full mt-4 bg-purple-500 hover:bg-purple-600"
          onClick={handleSubmit}
          disabled={
            isLoading ||
            !clientInfo.phone || 
            !clientInfo.name ||
            (pinMode === 'verify' && pin.length !== 4) ||
            (pinMode === 'create' && (pin.length !== 4 || pin !== confirmPin))
          }
        >
          {isLoading ? "Processando..." : "Confirmar Agendamento"}
        </Button>
      </div>
    </div>
  );
};

export default ClientInfoForm;
