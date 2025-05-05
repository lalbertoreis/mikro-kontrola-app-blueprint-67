
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EmployeeList from "@/components/employees/EmployeeList";
import { TooltipProvider } from "@/components/ui/tooltip";
import EmployeeDialog from "@/components/employees/EmployeeDialog";

const Employees = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>(undefined);

  const handleEditEmployee = (id: string) => {
    setSelectedEmployeeId(id);
    setDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <TooltipProvider>
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Funcionários</h1>
            <p className="text-muted-foreground">
              Gerencie sua equipe e informações de colaboradores.
            </p>
          </div>
          
          <EmployeeList onEdit={handleEditEmployee} />

          <EmployeeDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            employeeId={selectedEmployeeId}
          />
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
};

export default Employees;
