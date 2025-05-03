
import React, { useState } from "react";
import { Service } from "@/types/service";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// Dados de exemplo para serviços
const mockServices: Service[] = [
  {
    id: "1",
    name: "Corte de Cabelo",
    description: "Corte tradicional masculino",
    price: 50.00,
    duration: 30,
    multipleAttendees: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Manicure",
    description: "Manicure completa com esmaltação",
    price: 45.00,
    duration: 60,
    multipleAttendees: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

interface ServiceSelectorProps {
  selectedServiceIds: string[];
  onChange: (serviceIds: string[]) => void;
}

const ServiceSelector: React.FC<ServiceSelectorProps> = ({ selectedServiceIds, onChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [services] = useState<Service[]>(mockServices);
  
  // Filtrar serviços com base no termo de pesquisa
  const filteredServices = services.filter((service) => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleService = (serviceId: string) => {
    const isSelected = selectedServiceIds.includes(serviceId);
    if (isSelected) {
      onChange(selectedServiceIds.filter(id => id !== serviceId));
    } else {
      onChange([...selectedServiceIds, serviceId]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar serviços..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          {filteredServices.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              Nenhum serviço encontrado.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {filteredServices.map((service) => (
                <div key={service.id} className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded-md">
                  <Checkbox
                    id={`service-${service.id}`}
                    checked={selectedServiceIds.includes(service.id)}
                    onCheckedChange={() => toggleService(service.id)}
                  />
                  <Label htmlFor={`service-${service.id}`} className="flex-1 cursor-pointer">
                    <div>{service.name}</div>
                    <div className="text-xs text-muted-foreground">{service.duration} min • R$ {service.price.toFixed(2)}</div>
                  </Label>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceSelector;
