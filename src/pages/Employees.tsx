
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EmployeeList from "@/components/employees/EmployeeList";
import { TooltipProvider } from "@/components/ui/tooltip";

const Employees = () => {
  return (
    <DashboardLayout>
      <TooltipProvider>
        <div className="space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">Funcionários</h1>
          <p className="text-muted-foreground">
            Gerencie sua equipe e informações de colaboradores.
          </p>
          
          <EmployeeList />
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
};

export default Employees;
