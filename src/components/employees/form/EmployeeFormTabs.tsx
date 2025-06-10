
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EmployeeFormTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

const EmployeeFormTabs: React.FC<EmployeeFormTabsProps> = ({
  activeTab,
  onTabChange,
  children,
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 h-auto">
        <TabsTrigger value="info" className="text-xs sm:text-sm py-2 px-2 sm:px-3">
          Informações
        </TabsTrigger>
        <TabsTrigger value="shifts" className="text-xs sm:text-sm py-2 px-2 sm:px-3">
          Turnos
        </TabsTrigger>
        <TabsTrigger value="services" className="text-xs sm:text-sm py-2 px-2 sm:px-3">
          Serviços
        </TabsTrigger>
        <TabsTrigger value="access" className="text-xs sm:text-sm py-2 px-2 sm:px-3">
          Acesso
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
};

export default EmployeeFormTabs;
