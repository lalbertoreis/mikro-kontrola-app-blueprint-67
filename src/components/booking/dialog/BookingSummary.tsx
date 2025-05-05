
import React from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Service } from "@/types/service";
import { Employee } from "@/types/employee";

interface BookingSummaryProps {
  service: Service;
  selectedEmployee: Employee | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  onNextStep: () => void;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({
  service,
  selectedEmployee,
  selectedDate,
  selectedTime,
  onNextStep,
}) => {
  return (
    <div className="mt-8 space-y-2 border-t pt-4">
      <h3 className="font-semibold text-lg">Resumo do agendamento</h3>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <p className="text-sm text-gray-500">Serviço</p>
          <p className="font-medium">{service.name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Data</p>
          <p className="font-medium">
            {selectedDate
              ? format(selectedDate, "dd/MM/yyyy")
              : "-"}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Horário</p>
          <p className="font-medium">{selectedTime || "-"}</p>
        </div>
      </div>

      <Button
        className="w-full mt-4 bg-purple-500 hover:bg-purple-600"
        disabled={!selectedEmployee || !selectedDate || !selectedTime}
        onClick={onNextStep}
      >
        Continuar
      </Button>
    </div>
  );
};

export default BookingSummary;
