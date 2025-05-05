
import React from "react";
import { Service } from "@/types/service";
import ServiceCard from "@/components/booking/ServiceCard";

interface ServicesListProps {
  services: Service[];
  onServiceClick: (service: Service) => void;
}

const ServicesList: React.FC<ServicesListProps> = ({ services, onServiceClick }) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">Serviços</h2>
      {services.map((service) => (
        <ServiceCard 
          key={service.id} 
          item={service} 
          onClick={() => onServiceClick(service)} 
        />
      ))}
    </div>
  );
};

export default ServicesList;
