
import React from "react";
import { Service } from "@/types/service";
import ServiceCard from "@/components/booking/ServiceCard";
import { AlertCircle } from "lucide-react";

interface ServicesListProps {
  services: Service[];
  onServiceClick: (service: Service) => void;
  isLoading?: boolean;
  bookingColor?: string;
}

const ServicesList: React.FC<ServicesListProps> = ({ 
  services, 
  onServiceClick, 
  isLoading = false,
  bookingColor = "#9b87f5"
}) => {
  if (isLoading) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Serviços</h2>
        <div className="flex items-center justify-center p-8">
          <div className="animate-pulse flex space-x-4">
            <div className="space-y-6 flex-1">
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (services.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Serviços</h2>
        <p className="text-gray-500">Nenhum serviço disponível no momento.</p>
      </div>
    );
  }

  console.log(`ServicesList rendering ${services.length} services with availability details:`, 
    services.map(s => `${s.name}: ${s.hasEmployees ? 'Has employees' : 'No employees'}`));

  return (
    <div className="mb-8">
      <h2 
        className="text-xl font-bold mb-4"
        style={{ color: bookingColor }}
      >
        Serviços ({services.length})
      </h2>
      <div className="space-y-3">
        {services.map((service) => {
          // Considerar undefined como false para compatibilidade com dados existentes
          const hasEmployees = service.hasEmployees === true;
          
          return (
            <div key={service.id} className="relative">
              <ServiceCard 
                item={service}
                onClick={() => onServiceClick(service)}
                disabled={!hasEmployees}
                color={bookingColor}
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
