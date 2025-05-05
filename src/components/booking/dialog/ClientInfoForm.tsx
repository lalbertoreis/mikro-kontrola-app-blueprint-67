
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-semibold">Suas informações</h2>
      <div className="space-y-4">
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
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t flex justify-between">
        <Button 
          variant="outline" 
          onClick={onPreviousStep}
        >
          Voltar
        </Button>
        <Button 
          onClick={onNextStep}
          disabled={!clientInfo.name || !clientInfo.phone}
        >
          Confirmar Agendamento
        </Button>
      </div>
    </div>
  );
};

export default ClientInfoForm;
