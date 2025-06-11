
import React from "react";
import { Employee } from "@/types/employee";
import { Button } from "@/components/ui/button";
import EmployeeSelector from "../EmployeeSelector";

interface MobileEmployeeStepProps {
  employees: Employee[];
  selectedEmployee: Employee | null;
  onSelectEmployee: (employee: Employee) => void;
  onNext: () => void;
  themeColor?: string;
}

const MobileEmployeeStep: React.FC<MobileEmployeeStepProps> = ({
  employees,
  selectedEmployee,
  onSelectEmployee,
  onNext,
  themeColor = "#9b87f5"
}) => {
  return (
    <div className="space-y-6">
      <EmployeeSelector
        employees={employees}
        selectedEmployee={selectedEmployee}
        onSelectEmployee={onSelectEmployee}
        themeColor={themeColor}
      />

      <div className="pt-4">
        <Button
          className="w-full text-white"
          disabled={!selectedEmployee}
          onClick={onNext}
          style={{ backgroundColor: themeColor }}
        >
          Próximo
        </Button>
      </div>
    </div>
  );
};

export default MobileEmployeeStep;
