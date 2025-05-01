
import React from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Employee } from "@/types/employee";

interface EmployeeFilterProps {
  employees: Employee[];
  selectedEmployeeId?: string;
  onChange: (employeeId?: string) => void;
}

const EmployeeFilter: React.FC<EmployeeFilterProps> = ({ employees, selectedEmployeeId, onChange }) => {
  const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center">
          <Filter className="mr-2 h-4 w-4" />
          {selectedEmployee ? selectedEmployee.name : "Todos Funcionários"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuItem
            className={!selectedEmployeeId ? "bg-accent" : ""}
            onClick={() => onChange(undefined)}
          >
            Todos Funcionários
          </DropdownMenuItem>
          
          {employees.map((employee) => (
            <DropdownMenuItem
              key={employee.id}
              className={selectedEmployeeId === employee.id ? "bg-accent" : ""}
              onClick={() => onChange(employee.id)}
            >
              {employee.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EmployeeFilter;
