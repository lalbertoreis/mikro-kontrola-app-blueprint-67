
import React from "react";
import { Service } from "@/types/service";
import ServiceCard from "@/components/booking/ServiceCard";

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
        {services.map((service) => (
          <ServiceCard 
            key={service.id} 
            item={service} 
            onClick={() => onServiceClick(service)} 
          />
        ))}
      </div>
    </div>
  );
};

export default ServicesList;
