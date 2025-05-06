
import React from "react";
import { Service } from "@/types/service";
import ServiceCard from "@/components/booking/ServiceCard";
import { AlertCircle } from "lucide-react";

interface ServicesListProps {
  services: Service[];
  onServiceClick: (service: Service) => void;
}

const ServicesList: React.FC<ServicesListProps> = ({ services, onServiceClick }) => {
  if (services.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Serviços</h2>
        <p className="text-gray-500">Nenhum serviço disponível no momento.</p>
      </div>
    );
  }

  console.log(`ServicesList rendering ${services.length} services`, services);

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">Serviços ({services.length})</h2>
      <div className="space-y-3">
        {services.map((service) => {
          const hasEmployees = service.hasEmployees !== false; // Considerar undefined como true também
          
          return (
            <div key={service.id} className="relative">
              <ServiceCard 
                item={service}
                onClick={() => onServiceClick(service)}
                disabled={!hasEmployees}
              />
              
              {!hasEmployees && (
                <div className="absolute top-0 right-0 p-2">
                  <div className="flex items-center text-orange-500 text-sm bg-orange-50 p-1 rounded">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>Sem profissionais disponíveis</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ServicesList;
