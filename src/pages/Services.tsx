
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ServiceList from "@/components/services/ServiceList";
import ServicePackageList from "@/components/services/ServicePackageList";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ServiceDialog from "@/components/services/ServiceDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ServicePackageDialog from "@/components/services/ServicePackageDialog";

const Services = () => {
  const [activeTab, setActiveTab] = useState("services");
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [packageDialogOpen, setPackageDialogOpen] = useState(false);

  return (
    <DashboardLayout>
      <TooltipProvider>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Serviços</h1>
            {activeTab === "services" ? (
              <Button onClick={() => setServiceDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Serviço
              </Button>
            ) : (
              <Button onClick={() => setPackageDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Pacote
              </Button>
            )}
          </div>
          
          <p className="text-muted-foreground">
            Gerencie os serviços e pacotes oferecidos pelo seu negócio.
          </p>
          
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
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
};

export default Services;
