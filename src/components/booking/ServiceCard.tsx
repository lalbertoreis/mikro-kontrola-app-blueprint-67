
import React from "react";
import { Button } from "@/components/ui/button";
import { useProfileSettings } from "@/hooks/useProfileSettings";

interface ServiceCardProps {
  name: string;
  duration: number;
  price: number;
  onClick: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  name,
  duration,
  price,
  onClick,
}) => {
  const { settings } = useProfileSettings();
  const bookingColor = settings?.bookingColor || '#9b87f5';

  return (
    <Button
      variant="outline"
      className="flex justify-between items-center w-full p-4 h-auto text-left"
      onClick={onClick}
    >
      <div className="space-y-1">
        <div className="font-medium">{name}</div>
        <div className="text-sm text-muted-foreground">{duration} min</div>
      </div>
      <div className="font-medium text-lg" style={{ color: bookingColor }}>
        R$ {price.toFixed(2).replace('.', ',')}
      </div>
    </Button>
  );
};

export default ServiceCard;
