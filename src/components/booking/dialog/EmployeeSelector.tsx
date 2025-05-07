
import React, { useEffect } from "react";
import { Employee } from "@/types/employee";

interface EmployeeSelectorProps {
  employees: Employee[];
  selectedEmployee: Employee | null;
  onSelectEmployee: (employee: Employee) => void;
  themeColor?: string; // Theme color prop
}

const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({ 
  employees, 
  selectedEmployee, 
  onSelectEmployee,
  themeColor = "#9b87f5" // Default color
}) => {
  // Add detailed logging for diagnostics
  useEffect(() => {
    console.log("EmployeeSelector - Employees received:", employees);
    console.log("EmployeeSelector - Selected employee:", selectedEmployee);
    
    // Check each employee's services
    employees.forEach(employee => {
      console.log(`Employee ${employee.name} (${employee.id}) has ${employee.services?.length || 0} services:`, employee.services);
    });
  }, [employees, selectedEmployee]);

  // If there are no employees, show a clear message
  if (!employees || employees.length === 0) {
    return (
      <div className="mb-4">
        <p className="text-sm text-red-500">
          Não há profissionais disponíveis para este serviço no momento.
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Por favor, tente novamente mais tarde ou entre em contato conosco.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <p className="text-sm text-gray-600 mb-2">Escolha o profissional:</p>
      <div className="flex flex-wrap gap-2">
        {employees.map((employee) => (
          <button
            key={employee.id}
            className={`py-2 px-4 rounded-md border transition-all ${
              selectedEmployee?.id === employee.id
                ? "text-white"
                : "text-gray-700 hover:bg-gray-50"
            }`}
            style={{ 
              backgroundColor: selectedEmployee?.id === employee.id ? themeColor : "transparent",
              borderColor: selectedEmployee?.id === employee.id ? themeColor : "#e5e7eb"
            }}
            onClick={() => onSelectEmployee(employee)}
          >
            {employee.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmployeeSelector;
