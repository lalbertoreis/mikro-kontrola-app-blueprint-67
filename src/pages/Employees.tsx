
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EmployeeList from "@/components/employees/EmployeeList";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";

const Employees = () => {
  return (
    <DashboardLayout>
      <TooltipProvider>
        <Card className="bg-white">
          <CardContent className="p-6 space-y-4">
            <h1 className="text-2xl font-bold tracking-tight">Funcionários</h1>
            <p className="text-muted-foreground">
              Gerencie sua equipe e configure permissões de acesso.
            </p>
            
            <EmployeeList />
          </CardContent>
        </Card>
      </TooltipProvider>
    </DashboardLayout>
  );
};

export default Employees;
