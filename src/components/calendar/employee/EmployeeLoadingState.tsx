
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { CalendarIcon } from "lucide-react";

const EmployeeLoadingState: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <CalendarIcon className="h-8 w-8 animate-pulse mx-auto mb-2" />
          <p>Carregando sua agenda...</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeLoadingState;
