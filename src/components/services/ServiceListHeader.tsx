
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ServiceListHeaderProps {
  onNewService: () => void;
}

const ServiceListHeader: React.FC<ServiceListHeaderProps> = ({ onNewService }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">Lista de Serviços</h2>
      <Button onClick={onNewService}>
        <Plus className="mr-2 h-4 w-4" />
        Novo Serviço
      </Button>
    </div>
  );
};

export default ServiceListHeader;
