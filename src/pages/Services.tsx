
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ServiceList from "@/components/services/ServiceList";
import ServicePackageList from "@/components/services/ServicePackageList";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const Services = () => {
  const [activeTab, setActiveTab] = useState("services");

  return (
    <DashboardLayout>
      <TooltipProvider>
        <div className="space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">Serviços</h1>
          <p className="text-muted-foreground">
            Gerencie os serviços e pacotes oferecidos pelo seu negócio.
          </p>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="services">Serviços</TabsTrigger>
              <TabsTrigger value="packages">Pacotes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="services">
              <ServiceList />
            </TabsContent>
            
            <TabsContent value="packages">
              <ServicePackageList />
            </TabsContent>
          </Tabs>
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
};

export default Services;
