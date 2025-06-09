
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ClientList from "@/components/clients/ClientList";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { ConditionalOnboardingBanner } from "@/components/onboarding/ConditionalOnboardingBanner";

const Clients = () => {
  return (
    <DashboardLayout>
      <TooltipProvider>
        <ConditionalOnboardingBanner />
        <Card className="bg-white">
          <CardContent className="p-6 space-y-4">
            <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
            <p className="text-muted-foreground">
              Gerencie seus clientes e informações de contato.
            </p>
            
            <ClientList />
          </CardContent>
        </Card>
      </TooltipProvider>
    </DashboardLayout>
  );
};

export default Clients;
