
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface ClientInfoFormProps {
  clientInfo: { name: string; phone: string; pin?: string };
  onClientInfoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPreviousStep: () => void;
  onNextStep: () => void;
}

const ClientInfoForm: React.FC<ClientInfoFormProps> = ({
  clientInfo,
  onClientInfoChange,
  onPreviousStep,
  onNextStep,
}) => {
  const [pinMode, setPinMode] = useState<'verify' | 'create' | null>(null);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [existingUserData, setExistingUserData] = useState<{ name?: string, hasPin: boolean } | null>(null);

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
          // Fetch from Supabase if user exists by phone
          const { supabase } = await import("@/integrations/supabase/client");
          const { data, error } = await supabase
            .from('clients')
            .select('name, pin')
            .eq('phone', clientInfo.phone)
            .maybeSingle();
          
          if (error) {
            console.error('Error checking user:', error);
            return;
          }
          
          // If user exists
          if (data) {
            // Create synthetic event to update name from database
            if (data.name) {
              const syntheticNameEvent = {
                target: {
                  name: 'name',
                  value: data.name
                }
              } as React.ChangeEvent<HTMLInputElement>;
              
              onClientInfoChange(syntheticNameEvent);
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
        }
      }
    };
    
    checkUserExists();
  }, [clientInfo.phone, onClientInfoChange]);

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits and limit to 4 characters
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(value);
  };

  const handleConfirmPinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits and limit to 4 characters
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setConfirmPin(value);
  };

  const handleSubmit = () => {
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
            />
          </div>
        )}

        {pinMode === 'verify' && (
          <div className="space-y-2">
            <label htmlFor="pin" className="text-sm font-medium">
              Digite seu PIN de acesso (4 dígitos)
            </label>
            <input
              id="pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={pin}
              onChange={handlePinChange}
              className="w-full p-2 border rounded-md text-center text-lg tracking-widest"
              placeholder="••••"
              required
            />
            <p className="text-xs text-muted-foreground">
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
              <input
                id="pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pin}
                onChange={handlePinChange}
                className="w-full p-2 border rounded-md text-center text-lg tracking-widest"
                placeholder="••••"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmPin" className="text-sm font-medium">
                Confirme o PIN
              </label>
              <input
                id="confirmPin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={confirmPin}
                onChange={handleConfirmPinChange}
                className="w-full p-2 border rounded-md text-center text-lg tracking-widest"
                placeholder="••••"
                required
              />
              <p className="text-xs text-muted-foreground">
                Esse PIN será usado para acessar e gerenciar seus agendamentos futuramente.
              </p>
            </div>
          </>
        )}

        <Button
          className="w-full mt-4 bg-purple-500 hover:bg-purple-600"
          onClick={handleSubmit}
          disabled={
            !clientInfo.phone || 
            !clientInfo.name ||
            (pinMode === 'verify' && pin.length !== 4) ||
            (pinMode === 'create' && (pin.length !== 4 || pin !== confirmPin))
          }
        >
          Confirmar Agendamento
        </Button>
      </div>
    </div>
  );
};

export default ClientInfoForm;
