
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Service } from "@/types/service";

interface SelectedServicesListProps {
  selectedServices: string[];
  services: Service[];
  totalPrice: number;
  discountedPrice: number | string;
}

const SelectedServicesList = ({ 
  selectedServices, 
  services, 
  totalPrice,
  discountedPrice 
}: SelectedServicesListProps) => {
  // Ensure discountedPrice is a number before using toFixed()
  const formattedDiscountedPrice = typeof discountedPrice === 'number' 
    ? discountedPrice.toFixed(2)
    : String(discountedPrice);

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Serviços Selecionados</h3>
      {selectedServices.length === 0 ? (
        <div className="text-muted-foreground p-2 text-center border rounded-md">
          Nenhum serviço selecionado
        </div>
      ) : (
        <div className="space-y-2">
          {selectedServices.map((serviceId) => {
            const service = services.find((s) => s.id === serviceId);
            return (
              <Badge key={serviceId} variant="secondary" className="mr-1 py-1.5">
                {service?.name} (R$ {service?.price.toFixed(2)})
              </Badge>
            );
          })}
          <div className="text-sm font-medium pt-2">
            Valor total: R$ {totalPrice.toFixed(2)}
          </div>
          <div className="text-sm font-medium text-primary">
            Valor com desconto: R$ {formattedDiscountedPrice}
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectedServicesList;
