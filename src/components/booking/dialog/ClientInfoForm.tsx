import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ClientInfoFormProps {
  clientInfo: { name: string; phone: string };
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
  const [isLoading, setIsLoading] = useState(false);
  const [existingClient, setExistingClient] = useState<{ name: string } | null>(null);
  const [phoneInputTimeout, setPhoneInputTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isValid, setIsValid] = useState(false);

  // Check if form is valid
  useEffect(() => {
    if (existingClient) {
      // If we found an existing client, phone is all we need
      setIsValid(clientInfo.phone.length >= 10);
    } else {
      // Otherwise, we need both name and phone
      setIsValid(clientInfo.name.length >= 3 && clientInfo.phone.length >= 10);
    }
  }, [clientInfo, existingClient]);

  // Look up client by phone number with debounce
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // First, update the phone field normally
    onClientInfoChange(e);
    
    // Clear any existing timeout
    if (phoneInputTimeout) {
      clearTimeout(phoneInputTimeout);
    }
    
    // Set new timeout to search for client after typing stops
    const timeout = setTimeout(async () => {
      const phone = e.target.value;
      if (phone.length >= 10) {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('clients')
            .select('name')
            .eq('phone', phone)
            .maybeSingle();
            
          if (error) throw error;
          
          if (data) {
            setExistingClient(data);
            // Auto-fill name if client exists
            const nameChangeEvent = {
              target: {
                name: 'name',
                value: data.name
              }
            } as React.ChangeEvent<HTMLInputElement>;
            onClientInfoChange(nameChangeEvent);
          } else {
            setExistingClient(null);
          }
        } catch (error) {
          console.error('Error looking up client:', error);
          setExistingClient(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        setExistingClient(null);
      }
    }, 500); // 500ms debounce
    
    setPhoneInputTimeout(timeout);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPreviousStep}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
        <h2 className="text-lg font-semibold">Informações para contato</h2>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="phone">Telefone*</Label>
          <Input
            id="phone"
            name="phone"
            value={clientInfo.phone}
            onChange={handlePhoneChange}
            placeholder="(00) 00000-0000"
            className="w-full"
            required
          />
          {isLoading && <p className="text-xs text-gray-500 mt-1">Buscando...</p>}
          {existingClient && (
            <p className="text-xs text-green-500 mt-1">
              Cliente encontrado! Basta confirmar para agendar.
            </p>
          )}
        </div>

        {!existingClient && (
          <div>
            <Label htmlFor="name">Nome completo*</Label>
            <Input
              id="name"
              name="name"
              value={clientInfo.name}
              onChange={onClientInfoChange}
              placeholder="Digite seu nome completo"
              className="w-full"
              required
            />
          </div>
        )}

        <Button
          onClick={onNextStep}
          className="w-full mt-4 bg-purple-500 hover:bg-purple-600"
          disabled={!isValid}
        >
          Confirmar Agendamento
        </Button>
      </div>
    </div>
  );
};

export default ClientInfoForm;
