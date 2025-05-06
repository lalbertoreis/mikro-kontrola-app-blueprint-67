
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
            onChange={(e) => formatPhoneNumber(e)}
            className="w-full p-2 border rounded-md"
            placeholder="(00) 00000-0000"
            required
          />
          <p className="text-xs text-muted-foreground">
            Este número será usado para enviar confirmações e lembretes do agendamento.
          </p>
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
