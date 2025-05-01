
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ServiceList from "@/components/services/ServiceList";
import { TooltipProvider } from "@/components/ui/tooltip";

const Services = () => {
  return (
    <DashboardLayout>
      <TooltipProvider>
        <div className="space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">Serviços</h1>
          <p className="text-muted-foreground">
            Gerencie os serviços oferecidos pelo seu negócio.
          </p>
          
          <ServiceList />
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
};

export default Services;
