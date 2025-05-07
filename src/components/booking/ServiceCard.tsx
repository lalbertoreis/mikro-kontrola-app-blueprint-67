
import React from "react";
import { Service, ServicePackage } from "@/types/service";
import { cn } from "@/lib/utils";

type ServiceCardItem = Service | ServicePackage;

interface ServiceCardProps {
  item: ServiceCardItem;
  onClick: () => void;
  color?: string;
  disabled?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ 
  item, 
  onClick, 
  color = "#9b87f5",
  disabled = false 
}) => {
  // Determine if the item is a service or package
  const isService = 'duration' in item;
  
  // Format price to BRL
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(item.price);
  
  // Format duration for services
  const duration = isService ? `${item.duration} min` : '';
  
  return (
    <button
      className={cn(
        "w-full p-4 border rounded-lg text-left transition-all",
        "hover:shadow-md focus:outline-none focus:ring-2",
        disabled 
          ? "bg-gray-100 cursor-not-allowed opacity-70" 
          : "bg-white cursor-pointer"
      )}
      onClick={() => !disabled && onClick()}
      disabled={disabled}
      style={!disabled ? { borderColor: color } : undefined}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
        <div>
          <h3 className="font-semibold text-lg">{item.name}</h3>
          {isService && (
            <p className="text-sm text-gray-500">{duration}</p>
          )}
          {!isService && (
            <p className="text-sm text-gray-500">Pacote com {item.services?.length || 0} serviços</p>
          )}
        </div>
        
        <div 
          className="px-3 py-1 rounded-full text-white font-medium"
          style={{ backgroundColor: color }}
        >
          {formattedPrice}
        </div>
      </div>
    </button>
  );
};

export default ServiceCard;
