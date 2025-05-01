
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ClientList from "@/components/clients/ClientList";
import { TooltipProvider } from "@/components/ui/tooltip";

const Clients = () => {
  return (
    <DashboardLayout>
      <TooltipProvider>
        <div className="space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie seus clientes e informações de contato.
          </p>
          
          <ClientList />
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
};

export default Clients;
