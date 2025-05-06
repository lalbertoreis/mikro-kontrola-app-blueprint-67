
import React from "react";
import { Service, ServicePackage } from "@/types/service";
import { formatCurrency } from "@/lib/utils";

interface ServiceCardProps {
  item: Service | ServicePackage;
  isPackage?: boolean;
  onClick: () => void;
  disabled?: boolean; // Nova propriedade
}

const ServiceCard: React.FC<ServiceCardProps> = ({ item, isPackage = false, onClick, disabled = false }) => {
  const isService = !isPackage && "duration" in item;
  const duration = isService ? item.duration : item.totalDuration;
  
  return (
    <div 
      className={`p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer ${
        disabled ? 'opacity-70' : ''
      }`}
      onClick={disabled ? undefined : onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
          {item.description && (
            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
          )}
          <div className="flex items-center mt-2">
            <span className="text-sm text-gray-500">
              {duration} min
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-purple-600">
            {formatCurrency(item.price)}
          </span>
          {isPackage && "discount" in item && item.discount > 0 && (
            <div className="text-xs text-green-600 mt-1">
              {item.discount}% de desconto
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
