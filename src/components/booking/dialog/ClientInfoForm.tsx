
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [showNameField, setShowNameField] = useState(false);
  const [existingClient, setExistingClient] = useState<any>(null);

  // Check if phone already exists when phone is entered
  useEffect(() => {
    const checkExistingClient = async () => {
      if (clientInfo.phone && clientInfo.phone.length >= 8) {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('phone', clientInfo.phone)
            .maybeSingle();
          
          if (error) throw error;
          
          if (data) {
            // Client exists, auto-populate name
            setExistingClient(data);
            const event = {
              target: {
                name: 'name',
                value: data.name
              }
            } as React.ChangeEvent<HTMLInputElement>;
            onClientInfoChange(event);
            setShowNameField(false);
          } else {
            // New client, show name field
            setExistingClient(null);
            setShowNameField(true);
          }
        } catch (err) {
          console.error('Error checking client:', err);
          setShowNameField(true);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    const timer = setTimeout(checkExistingClient, 500);
    return () => clearTimeout(timer);
  }, [clientInfo.phone, onClientInfoChange]);

  const handleSubmit = () => {
    if (!clientInfo.phone) {
      toast.error("Por favor, insira seu número de telefone");
      return;
    }
    
    if (showNameField && !clientInfo.name) {
      toast.error("Por favor, insira seu nome");
      return;
    }
    
    onNextStep();
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-semibold">Suas informações</h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            name="phone"
            value={clientInfo.phone}
            onChange={onClientInfoChange}
            placeholder="(00) 00000-0000"
            required
          />
          {existingClient && (
            <p className="text-sm text-green-600">Cliente encontrado: {existingClient.name}</p>
          )}
        </div>
        
        {showNameField && (
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              value={clientInfo.name}
              onChange={onClientInfoChange}
              placeholder="Nome completo"
              required
            />
          </div>
        )}
      </div>
      
      <div className="mt-6 pt-4 border-t flex justify-between">
        <Button 
          variant="outline" 
          onClick={onPreviousStep}
        >
          Voltar
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={isLoading || (!clientInfo.phone) || (showNameField && !clientInfo.name)}
        >
          {isLoading ? "Verificando..." : "Confirmar Agendamento"}
        </Button>
      </div>
    </div>
  );
};

export default ClientInfoForm;
