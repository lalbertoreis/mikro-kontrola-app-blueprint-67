
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ServiceList from "@/components/services/ServiceList";

const Services = () => {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Serviços</h1>
        <p className="text-muted-foreground">
          Gerencie os serviços oferecidos pelo seu negócio.
        </p>
        
        <ServiceList />
      </div>
    </DashboardLayout>
  );
};

export default Services;
