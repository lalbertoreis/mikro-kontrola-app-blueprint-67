
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
  themeColor?: string; // Add theme color prop
}

const BookingSummary: React.FC<BookingSummaryProps> = ({
  service,
  selectedEmployee,
  selectedDate,
  selectedTime,
  onNextStep,
  themeColor = "#9b87f5" // Default color
}) => {
  const handleContinue = () => {
    console.log("BookingSummary - Continue button clicked", {
      employee: selectedEmployee?.id,
      date: selectedDate,
      time: selectedTime
    });
    
    if (selectedEmployee && selectedDate && selectedTime) {
      onNextStep();
    } else {
      console.error("Missing required data for booking:", {
        hasEmployee: !!selectedEmployee,
        hasDate: !!selectedDate,
        hasTime: !!selectedTime
      });
    }
  };

  const isReadyToContinue = selectedEmployee && selectedDate && selectedTime;

  return (
    <div className="mt-8 space-y-2 border-t pt-4">
      <h3 className="font-semibold text-lg" style={{ color: themeColor }}>
        Resumo do agendamento
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-2 border rounded-md">
          <p className="text-sm text-gray-500">Serviço</p>
          <p className="font-medium truncate">{service.name}</p>
        </div>
        <div className="p-2 border rounded-md">
          <p className="text-sm text-gray-500">Data</p>
          <p className="font-medium">
            {selectedDate
              ? format(selectedDate, "dd/MM/yyyy")
              : "-"}
          </p>
        </div>
        <div className="p-2 border rounded-md">
          <p className="text-sm text-gray-500">Horário</p>
          <p className="font-medium">{selectedTime || "-"}</p>
        </div>
      </div>

      {selectedEmployee && (
        <div className="p-2 border rounded-md mt-3">
          <p className="text-sm text-gray-500">Profissional</p>
          <p className="font-medium">{selectedEmployee.name}</p>
        </div>
      )}

      <Button
        className="w-full mt-4 text-white hover:opacity-90"
        disabled={!isReadyToContinue}
        onClick={handleContinue}
        style={{ backgroundColor: themeColor }}
      >
        {isReadyToContinue ? "Continuar" : "Selecione todos os campos"}
      </Button>
      
      {!isReadyToContinue && (
        <p className="text-sm text-gray-500 text-center mt-2">
          {!selectedEmployee && "Selecione um profissional"}
          {!selectedDate && selectedEmployee && " • Selecione uma data"}
          {!selectedTime && selectedEmployee && selectedDate && " • Selecione um horário"}
        </p>
      )}
    </div>
  );
};

export default BookingSummary;
