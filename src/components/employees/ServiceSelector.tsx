
import React, { useState } from "react";
import { useServices } from "@/hooks/useServices";
import { Input } from "@/components/ui/input";
import { Check, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ServiceSelectorProps {
  selectedServiceIds: string[];
  onChange: (selectedServiceIds: string[]) => void;
}

const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  selectedServiceIds,
  onChange,
}) => {
  const { services, isLoading: isLoadingServices } = useServices();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleServiceToggle = (serviceId: string) => {
    if (selectedServiceIds.includes(serviceId)) {
      onChange(selectedServiceIds.filter((id) => id !== serviceId));
    } else {
      onChange([...selectedServiceIds, serviceId]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar serviços..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <ScrollArea className="h-[300px] max-h-[300px] overflow-y-auto pr-4">
          <div className="p-1">
            {isLoadingServices ? (
              <div className="flex justify-center items-center h-20">
                <p className="text-muted-foreground">Carregando...</p>
              </div>
            ) : (
              <>
                {filteredServices.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2 px-3">Serviços</h4>
                    {filteredServices.map((service) => {
                      const isSelected = selectedServiceIds.includes(service.id);
                      return (
                        <div
                          key={service.id}
                          className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${
                            isSelected ? "bg-primary/10" : ""
                          }`}
                          onClick={() => handleServiceToggle(service.id)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{service.name}</h4>
                              <div className="text-sm text-muted-foreground">
                                {service.duration} min • R$ {service.price.toFixed(2).replace(".", ",")}
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {filteredServices.length === 0 && (
                  <div className="flex justify-center items-center h-20">
                    <p className="text-muted-foreground">Nenhum serviço encontrado</p>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="text-xs text-muted-foreground p-2 bg-blue-50 rounded-md">
        <strong>Dica:</strong> Se você selecionar todos os serviços de um pacote, 
        o pacote aparecerá automaticamente como opção de agendamento para os clientes.
      </div>
    </div>
  );
};

export default ServiceSelector;
