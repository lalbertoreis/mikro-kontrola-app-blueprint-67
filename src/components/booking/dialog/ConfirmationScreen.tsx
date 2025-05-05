
import React from "react";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Check } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ConfirmationScreenProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  onClose: () => void;
}

const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({
  selectedDate,
  selectedTime,
  onClose,
}) => {
  return (
    <div className="p-6 flex flex-col items-center justify-center space-y-4">
      <div className="h-16 w-16 rounded-full bg-green-500 text-white flex items-center justify-center">
        <Check className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-bold text-green-500 text-center">RESERVA CONFIRMADA</h2>
      <p className="text-center font-semibold">
        {selectedDate && selectedTime && 
          format(selectedDate, "dd 'DE' MMM. 'DE' yyyy", { locale: ptBR }).toUpperCase() + ", " + selectedTime
        }
      </p>
      <p className="text-gray-500 text-center">Você não precisa fazer mais nada!</p>
      <div className="flex items-center justify-center mt-4">
        <CalendarIcon className="h-5 w-5 text-green-500 mr-2" />
        <span className="text-green-500">Adicionar lembrete</span>
      </div>
      <Button 
        className="w-full mt-4 bg-blue-500 hover:bg-blue-600" 
        onClick={onClose}
      >
        Ok, Entendi.
      </Button>
    </div>
  );
};

export default ConfirmationScreen;
