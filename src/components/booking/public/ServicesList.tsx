
import React from "react";
import { Service, ServicePackage } from "@/types/service";
import ServiceCard from "@/components/booking/ServiceCard";
import { AlertCircle, Package } from "lucide-react";

interface ServicesListProps {
  services: Service[];
  packages?: ServicePackage[];
  onServiceClick: (service: Service) => void;
  onPackageClick?: (pkg: ServicePackage) => void;
  isLoading?: boolean;
  bookingColor?: string;
}

const ServicesList: React.FC<ServicesListProps> = ({ 
  services, 
  packages = [],
  onServiceClick, 
  onPackageClick,
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
  
  const totalItems = services.length + packages.length;
  
  if (totalItems === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Serviços</h2>
        <p className="text-gray-500">Nenhum serviço disponível no momento.</p>
      </div>
    );
  }

  console.log(`ServicesList rendering ${services.length} services and ${packages.length} packages with availability details:`, 
    services.map(s => `${s.name}: ${s.hasEmployees ? 'Has employees' : 'No employees'}`));

  return (
    <div className="mb-8">
      <h2 
        className="text-xl font-bold mb-4"
        style={{ color: bookingColor }}
      >
        Serviços ({totalItems})
      </h2>
      <div className="space-y-3">
        {/* Render individual services */}
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

        {/* Render packages */}
        {packages.map((pkg) => (
          <div key={`package-${pkg.id}`} className="relative">
            <div 
              className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow bg-white"
              onClick={() => onPackageClick && onPackageClick(pkg)}
              style={{ borderColor: bookingColor + '20' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-5 w-5" style={{ color: bookingColor }} />
                    <h3 className="font-medium text-lg">{pkg.name}</h3>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      {pkg.discount}% OFF
                    </span>
                  </div>
                  
                  {pkg.description && (
                    <p className="text-gray-600 text-sm mb-2">{pkg.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{pkg.services.length} serviços inclusos</span>
                    <span>{pkg.totalDuration} min</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold" style={{ color: bookingColor }}>
                    R$ {pkg.price.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500 line-through">
                    R$ {((pkg.price * 100) / (100 - pkg.discount)).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesList;
