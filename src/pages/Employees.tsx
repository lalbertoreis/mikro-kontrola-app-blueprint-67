
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EmployeeList from "@/components/employees/EmployeeList";
import EmployeeDialog from "@/components/employees/EmployeeDialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";

const Employees = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>();

  const handleNewEmployee = () => {
    setSelectedEmployeeId(undefined);
    setIsDialogOpen(true);
  };

  const handleEditEmployee = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedEmployeeId(undefined);
  };

  const handleEmployeeCreated = () => {
    // O EmployeeDialog já fecha automaticamente após sucesso
    // Não precisamos fazer nada aqui pois a lista será atualizada automaticamente
  };

  return (
    <DashboardLayout>
      <TooltipProvider>
        <Card>
          <CardContent className="p-6 space-y-4">
            <h1 className="text-2xl font-bold tracking-tight">Funcionários</h1>
            <p className="text-muted-foreground">
              Gerencie sua equipe e configure permissões de acesso.
            </p>
            
            <EmployeeList 
              onNewEmployee={handleNewEmployee}
              onEditEmployee={handleEditEmployee}
            />
          </CardContent>
        </Card>

        <EmployeeDialog
          open={isDialogOpen}
          onOpenChange={handleDialogClose}
          employeeId={selectedEmployeeId}
          onEmployeeCreated={handleEmployeeCreated}
        />
      </TooltipProvider>
    </DashboardLayout>
  );
};

export default Employees;
