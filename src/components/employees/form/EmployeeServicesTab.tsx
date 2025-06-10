
import React from "react";
import { Button } from "@/components/ui/button";
import ServiceSelector from "../ServiceSelector";
import { useToast } from "@/components/ui/use-toast";

interface EmployeeServicesTabProps {
  selectedServices: string[];
  onChange: (services: string[]) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const EmployeeServicesTab: React.FC<EmployeeServicesTabProps> = ({
  selectedServices,
  onChange,
  onNext,
  onPrevious,
}) => {
  const { toast } = useToast();

  const handleNext = () => {
    if (selectedServices.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um serviço que o funcionário realiza.",
        variant: "destructive",
      });
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-4">
      <ServiceSelector
        selectedServiceIds={selectedServices}
        onChange={onChange}
      />
      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
        <Button variant="outline" type="button" onClick={onPrevious} className="w-full sm:w-auto">
          Voltar
        </Button>
        <Button type="button" onClick={handleNext} className="w-full sm:w-auto">
          Próximo
        </Button>
      </div>
    </div>
  );
};

export default EmployeeServicesTab;
