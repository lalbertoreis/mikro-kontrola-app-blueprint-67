
import React, { useState } from "react";
import { useServices } from "@/hooks/useServices";
import { Search, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ServiceSelectorProps {
  selectedServiceIds: string[];
  onChange: (serviceIds: string[]) => void;
}

const ServiceSelector: React.FC<ServiceSelectorProps> = ({ selectedServiceIds, onChange }) => {
  const { services, isLoading } = useServices();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredServices = services
    .filter((service) => service.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleToggleService = (serviceId: string) => {
    const isSelected = selectedServiceIds.includes(serviceId);
    if (isSelected) {
      onChange(selectedServiceIds.filter((id) => id !== serviceId));
    } else {
      onChange([...selectedServiceIds, serviceId]);
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Carregando serviços...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Serviços Oferecidos</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Selecione os serviços que este funcionário pode realizar.
        </p>

        <div className="relative mb-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar serviços..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <ScrollArea className="h-64 border rounded-md">
          <div className="p-2">
            {filteredServices.length > 0 ? (
              filteredServices.map((service) => {
                const isSelected = selectedServiceIds.includes(service.id);
                return (
                  <div
                    key={service.id}
                    className={`flex items-center justify-between p-3 rounded-md cursor-pointer mb-1 ${
                      isSelected 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-muted"
                    }`}
                    onClick={() => handleToggleService(service.id)}
                  >
                    <div>
                      <div className="font-medium">{service.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {service.duration} min • R$ {service.price.toFixed(2)}
                      </div>
                    </div>
                    {isSelected && <Check className="h-4 w-4" />}
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                {searchTerm ? "Nenhum serviço encontrado." : "Nenhum serviço disponível."}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div>
        <h4 className="font-medium mb-2">Serviços Selecionados</h4>
        {selectedServiceIds.length === 0 ? (
          <div className="text-muted-foreground p-4 text-center border rounded-md">
            Nenhum serviço selecionado
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 p-3 border rounded-md">
            {selectedServiceIds.map((serviceId) => {
              const service = services.find((s) => s.id === serviceId);
              return service ? (
                <Badge 
                  key={serviceId} 
                  variant="secondary"
                  className="py-1.5"
                >
                  {service.name}
                  <button
                    className="ml-1 text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleService(serviceId);
                    }}
                  >
                    ×
                  </button>
                </Badge>
              ) : null;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceSelector;
