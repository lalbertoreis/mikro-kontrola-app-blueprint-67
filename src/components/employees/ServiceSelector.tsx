
import React, { useState } from "react";
import { useServices } from "@/hooks/useServices";
import { useServicePackages } from "@/hooks/useServicePackages";
import { Service } from "@/types/service";
import { Input } from "@/components/ui/input";
import { Check, Search, Package } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ServiceSelectorProps {
  selectedServiceIds: string[];
  onChange: (selectedServiceIds: string[]) => void;
}

const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  selectedServiceIds,
  onChange,
}) => {
  const { services, isLoading: isLoadingServices } = useServices();
  const { packages, isLoading: isLoadingPackages } = useServicePackages();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter active packages that should show in online booking
  const activePackages = packages.filter(pkg => 
    pkg.isActive && pkg.showInOnlineBooking
  );

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPackages = activePackages.filter(
    (pkg) =>
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleServiceToggle = (serviceId: string) => {
    if (selectedServiceIds.includes(serviceId)) {
      onChange(selectedServiceIds.filter((id) => id !== serviceId));
    } else {
      onChange([...selectedServiceIds, serviceId]);
    }
  };

  const handlePackageToggle = (packageId: string) => {
    const packageKey = `package:${packageId}`;
    if (selectedServiceIds.includes(packageKey)) {
      onChange(selectedServiceIds.filter((id) => id !== packageKey));
    } else {
      onChange([...selectedServiceIds, packageKey]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar serviços e pacotes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <ScrollArea className="h-[300px] max-h-[300px] overflow-y-auto pr-4">
          <div className="p-1">
            {isLoadingServices || isLoadingPackages ? (
              <div className="flex justify-center items-center h-20">
                <p className="text-muted-foreground">Carregando...</p>
              </div>
            ) : (
              <>
                {/* Services Section */}
                {filteredServices.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2 px-3">Serviços</h4>
                    {filteredServices.map((service) => {
                      const isSelected = selectedServiceIds.includes(service.id);
                      return (
                        <div
                          key={service.id}
                          className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${
                            isSelected ? "bg-primary/10" : ""
                          }`}
                          onClick={() => handleServiceToggle(service.id)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{service.name}</h4>
                              <div className="text-sm text-muted-foreground">
                                {service.duration} min • R$ {service.price.toFixed(2).replace(".", ",")}
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Packages Section */}
                {filteredPackages.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2 px-3 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Pacotes
                    </h4>
                    {filteredPackages.map((pkg) => {
                      const packageKey = `package:${pkg.id}`;
                      const isSelected = selectedServiceIds.includes(packageKey);
                      return (
                        <div
                          key={pkg.id}
                          className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${
                            isSelected ? "bg-primary/10" : ""
                          }`}
                          onClick={() => handlePackageToggle(pkg.id)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                <h4 className="font-medium">{pkg.name}</h4>
                                <Badge variant="secondary" className="text-xs">
                                  {pkg.services.length} serviços
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {pkg.totalDuration} min • R$ {pkg.price.toFixed(2).replace(".", ",")}
                                <span className="text-green-600 ml-1">
                                  ({pkg.discount}% desconto)
                                </span>
                              </div>
                              {pkg.description && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {pkg.description}
                                </div>
                              )}
                            </div>
                            {isSelected && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {filteredServices.length === 0 && filteredPackages.length === 0 && (
                  <div className="flex justify-center items-center h-20">
                    <p className="text-muted-foreground">Nenhum serviço ou pacote encontrado</p>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default ServiceSelector;
