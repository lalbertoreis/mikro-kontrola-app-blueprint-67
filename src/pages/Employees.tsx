
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EmployeeList from "@/components/employees/EmployeeList";
import EmployeeDialog from "@/components/employees/EmployeeDialog";
import { Card, CardContent } from "@/components/ui/card";
import { OnboardingPageBanner } from "@/components/onboarding/OnboardingPageBanner";

const Employees = () => {
  const [open, setOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>(undefined);

  const handleNewEmployee = () => {
    setSelectedEmployeeId(undefined);
    setOpen(true);
  };

  const handleEditEmployee = (id: string) => {
    setSelectedEmployeeId(id);
    setOpen(true);
  };

  return (
    <DashboardLayout>
      <OnboardingPageBanner />
      <Card className="bg-white">
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Funcionários</h1>
              <p className="text-muted-foreground">
                Gerencie os funcionários do seu negócio e seus horários de trabalho.
              </p>
            </div>
          </div>
          
          <EmployeeList 
            onNewEmployee={handleNewEmployee}
            onEditEmployee={handleEditEmployee}
          />
          
          <EmployeeDialog 
            open={open}
            onOpenChange={setOpen}
            employeeId={selectedEmployeeId}
          />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Employees;
