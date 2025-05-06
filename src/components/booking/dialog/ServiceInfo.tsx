
import React from "react";
import { Service } from "@/types/service";
import { useProfileSettings } from "@/hooks/useProfileSettings";

interface ServiceInfoProps {
  service: Service;
}

const ServiceInfo: React.FC<ServiceInfoProps> = ({ service }) => {
  const { settings } = useProfileSettings();
  const bookingColor = settings?.bookingColor || '#9b87f5';

  return (
    <div className="mb-6 border-b pb-4">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-sm text-gray-500">Duração</p>
          <p className="font-medium">{service.duration} minutos</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Valor</p>
          <p className="font-medium" style={{ color: bookingColor }}>
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(service.price)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServiceInfo;
