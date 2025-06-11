
import React from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Service } from "@/types/service";
import { Employee } from "@/types/employee";

interface MobileSummaryStepProps {
  service: Service;
  selectedEmployee: Employee;
  selectedDate: Date;
  selectedTime: string;
  onBack: () => void;
  onContinue: () => void;
  themeColor?: string;
}

const MobileSummaryStep: React.FC<MobileSummaryStepProps> = ({
  service,
  selectedEmployee,
  selectedDate,
  selectedTime,
  onBack,
  onContinue,
  themeColor = "#9b87f5"
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="font-semibold text-gray-700 mb-2">Serviço</h3>
          <p className="font-medium">{service.name}</p>
          {service.duration && (
            <p className="text-sm text-gray-500">{service.duration} minutos</p>
          )}
          {service.price && (
            <p className="text-sm font-medium" style={{ color: themeColor }}>
              R$ {service.price.toFixed(2)}
            </p>
          )}
        </div>

        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="font-semibold text-gray-700 mb-2">Profissional</h3>
          <p className="font-medium">{selectedEmployee.name}</p>
        </div>

        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="font-semibold text-gray-700 mb-2">Data e Horário</h3>
          <p className="font-medium">{format(selectedDate, "dd/MM/yyyy")}</p>
          <p className="text-sm text-gray-600">{selectedTime}</p>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onBack}
        >
          Voltar
        </Button>
        <Button
          className="flex-1 text-white"
          onClick={onContinue}
          style={{ backgroundColor: themeColor }}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default MobileSummaryStep;
