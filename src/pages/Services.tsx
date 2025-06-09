
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ServiceList from "@/components/services/ServiceList";
import ServicePackageList from "@/components/services/ServicePackageList";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ServiceDialog from "@/components/services/ServiceDialog";
import ServicePackageDialog from "@/components/services/ServicePackageDialog";
import { Card, CardContent } from "@/components/ui/card";
import { SimpleOnboarding } from "@/components/onboarding/SimpleOnboarding";

const Services = () => {
  const [activeTab, setActiveTab] = useState("services");
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [packageDialogOpen, setPackageDialogOpen] = useState(false);

  return (
    <DashboardLayout>
      <TooltipProvider>
        <SimpleOnboarding />
        <Card className="bg-white">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Serviços</h1>
                <p className="text-muted-foreground">
                  Gerencie os serviços e pacotes oferecidos pelo seu negócio.
                </p>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="services">Serviços</TabsTrigger>
                <TabsTrigger value="packages">Pacotes</TabsTrigger>
              </TabsList>
              
              <TabsContent value="services">
                <ServiceList onNewService={() => setServiceDialogOpen(true)} />
              </TabsContent>
              
              <TabsContent value="packages">
                <ServicePackageList onNewPackage={() => setPackageDialogOpen(true)} />
              </TabsContent>
            </Tabs>
            
            <ServiceDialog 
              open={serviceDialogOpen}
              onOpenChange={setServiceDialogOpen}
            />
            
            <ServicePackageDialog 
              open={packageDialogOpen}
              onOpenChange={setPackageDialogOpen}
            />
          </CardContent>
        </Card>
      </TooltipProvider>
    </DashboardLayout>
  );
};

export default Services;
