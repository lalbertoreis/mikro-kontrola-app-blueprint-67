
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">
            Telefone (WhatsApp)
          </label>
          <input
            id="phone"
            name="phone"
            value={clientInfo.phone}
            onChange={onClientInfoChange}
            className="w-full p-2 border rounded-md"
            placeholder="(00) 00000-0000"
            required
          />
        </div>

        <Button
          className="w-full mt-4 bg-purple-500 hover:bg-purple-600"
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
