
import React from "react";
import { Button } from "@/components/ui/button";
import { Employee } from "@/types/employee";

interface EmployeeSelectorProps {
  employees: Employee[];
  selectedEmployee: Employee | null;
  onEmployeeSelect: (employee: Employee) => void;
}

const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({
  employees,
  selectedEmployee,
  onEmployeeSelect,
}) => {
  return (
    <div className="mb-6">
      <p className="text-sm text-gray-500 mb-2">Escolha o profissional:</p>
      <div className="flex overflow-x-auto space-x-2 pb-2">
        {employees.map((employee) => (
          <Button
            key={employee.id}
            variant={selectedEmployee?.id === employee.id ? "default" : "outline"}
            className={`whitespace-nowrap ${
              selectedEmployee?.id === employee.id ? "bg-purple-500 hover:bg-purple-600" : ""
            }`}
            onClick={() => onEmployeeSelect(employee)}
          >
            {employee.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default EmployeeSelector;
