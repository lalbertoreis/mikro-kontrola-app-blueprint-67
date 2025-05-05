
import React from "react";
import { Service, ServicePackage } from "@/types/service";
import { Card } from "@/components/ui/card";

interface ServiceCardProps {
  item: Service | ServicePackage;
  isPackage?: boolean;
  onClick: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ item, isPackage = false, onClick }) => {
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(item.price);

  return (
    <Card 
      className="p-4 cursor-pointer hover:shadow-md transition-shadow flex justify-between items-center mb-4"
      onClick={onClick}
    >
      <div>
        <h3 className="font-medium">{item.name}</h3>
        {item.description && (
          <p className="text-sm text-muted-foreground">{item.description}</p>
        )}
      </div>
      <div className="text-lg font-semibold text-purple-500">
        {formattedPrice}
      </div>
    </Card>
  );
};

export default ServiceCard;
