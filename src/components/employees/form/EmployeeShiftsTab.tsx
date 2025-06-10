
import React from "react";
import { Button } from "@/components/ui/button";
import { Shift } from "@/types/employee";
import ShiftSelector from "../ShiftSelector";
import { useToast } from "@/components/ui/use-toast";

interface EmployeeShiftsTabProps {
  shifts: Shift[];
  onChange: (shifts: Shift[]) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const EmployeeShiftsTab: React.FC<EmployeeShiftsTabProps> = ({
  shifts,
  onChange,
  onNext,
  onPrevious,
}) => {
  const { toast } = useToast();

  const handleNext = () => {
    if (shifts.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um turno para o funcionário.",
        variant: "destructive",
      });
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-4">
      <ShiftSelector shifts={shifts} onChange={onChange} />
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

export default EmployeeShiftsTab;
