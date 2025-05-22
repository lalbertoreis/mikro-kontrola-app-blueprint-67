
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EmployeeList from "@/components/employees/EmployeeList";
import { TooltipProvider } from "@/components/ui/tooltip";
import EmployeeDialog from "@/components/employees/EmployeeDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Employees = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

  const handleEditEmployee = (id: string) => {
    setSelectedEmployeeId(id);
    setDialogOpen(true);
  };

  const handleAddEmployee = () => {
    setSelectedEmployeeId(undefined);
    setDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <TooltipProvider>
        <Card className="bg-white">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Funcionários</h1>
                <p className="text-muted-foreground">
                  Gerencie sua equipe e informações de colaboradores.
                </p>
              </div>
              <Button onClick={handleAddEmployee} className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Novo Funcionário
              </Button>
            </div>
            
            <EmployeeList onEdit={handleEditEmployee} />

            <EmployeeDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              employeeId={selectedEmployeeId}
            />
          </CardContent>
        </Card>
      </TooltipProvider>
    </DashboardLayout>
  );
};

export default Employees;
