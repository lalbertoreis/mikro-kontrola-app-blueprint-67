
import React from "react";
import { Button } from "@/components/ui/button";
import { useProfileSettings } from "@/hooks/useProfileSettings";
import { Service, ServicePackage } from "@/types/service";

interface ServiceCardProps {
  name?: string;
  duration?: number;
  price?: number;
  onClick: () => void;
  item?: Service | ServicePackage;
  disabled?: boolean;
  isPackage?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  name,
  duration,
  price,
  onClick,
  item,
  disabled = false,
  isPackage = false,
}) => {
  const { settings } = useProfileSettings();
  const bookingColor = settings?.bookingColor || '#9b87f5';
  
  // Use item properties if available, otherwise use the direct props
  const displayName = item ? item.name : name;
  
  // Handle duration differently based on whether it's a package or service
  let displayDuration: number | undefined;
  if (item) {
    if (isPackage) {
      // Handle ServicePackage with totalDuration
      const packageItem = item as ServicePackage;
      displayDuration = packageItem.totalDuration;
    } else {
      // Handle Service with duration
      const serviceItem = item as Service;
      displayDuration = serviceItem.duration;
    }
  } else {
    displayDuration = duration;
  }
  
  const displayPrice = item ? item.price : price;

  return (
    <Button
      variant="outline"
      className={`flex justify-between items-center w-full p-4 h-auto text-left ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <div className="space-y-1">
        <div className="font-medium">{displayName}</div>
        {displayDuration && (
          <div className="text-sm text-muted-foreground">{displayDuration} min</div>
        )}
      </div>
      {displayPrice !== undefined && (
        <div className="font-medium text-lg" style={{ color: bookingColor }}>
          R$ {displayPrice.toFixed(2).replace('.', ',')}
        </div>
      )}
    </Button>
  );
};

export default ServiceCard;
