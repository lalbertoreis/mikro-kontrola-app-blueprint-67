
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Search } from "lucide-react";
import { Service } from "@/types/service";

interface ServiceSearchPanelProps {
  services: Service[];
  selectedServices: string[];
  onServiceToggle: (serviceId: string) => void;
}

const ServiceSearchPanel = ({ services, selectedServices, onServiceToggle }: ServiceSearchPanelProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter services based on search term
  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-2">Serviços Disponíveis</h3>
      <div className="relative mb-2">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar serviços..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <ScrollArea className="h-96 border rounded-md">
        <div className="p-2 space-y-1">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              onClick={() => onServiceToggle(service.id)}
              className={`flex items-center justify-between p-2 cursor-pointer rounded-md ${
                selectedServices.includes(service.id)
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted"
              }`}
            >
              <div>
                <div>{service.name}</div>
                <div className="text-xs text-muted-foreground">
                  R$ {service.price.toFixed(2)} • {service.duration} min
                </div>
              </div>
              {selectedServices.includes(service.id) && (
                <Check className="h-4 w-4" />
              )}
            </div>
          ))}
          {filteredServices.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              Nenhum serviço encontrado.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ServiceSearchPanel;
