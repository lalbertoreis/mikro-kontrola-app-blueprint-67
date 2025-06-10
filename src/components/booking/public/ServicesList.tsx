
import React, { useMemo } from "react";
import { Service } from "@/types/service";
import { Employee } from "@/types/employee";
import ServiceCard from "../ServiceCard";
import { useServicePackages } from "@/hooks/useServicePackages";

interface ServicesListProps {
  services: Service[];
  employees: Employee[];
  onSelectService: (service: Service) => void;
  themeColor?: string;
}

const ServicesList: React.FC<ServicesListProps> = ({
  services,
  employees,
  onSelectService,
  themeColor
}) => {
  const { packages } = useServicePackages();

  // Create package services that can be offered by available employees
  const availablePackageServices = useMemo(() => {
    if (!packages || !employees || !services) return [];

    const activePackages = packages.filter(pkg => pkg.isActive && pkg.showInOnlineBooking);
    
    return activePackages.map(pkg => {
      // Check which employees can provide ALL services in this package
      const availableEmployees = employees.filter(emp => {
        if (!emp.services || !Array.isArray(emp.services)) return false;
        
        // Employee must have ALL services in the package
        return pkg.services.every(serviceId => {
          return emp.services.some(empService => {
            const empServiceId = typeof empService === 'object' ? (empService as any).id : empService;
            return empServiceId === serviceId;
          });
        });
      });

      // Only include packages that have at least one employee who can provide them
      if (availableEmployees.length === 0) return null;

      // Create a Service object for the package
      const packageService: Service = {
        id: `package:${pkg.id}`,
        name: pkg.name,
        description: pkg.description,
        price: pkg.price,
        duration: pkg.totalDuration || 0,
        multipleAttendees: false,
        isActive: pkg.isActive,
        createdAt: pkg.createdAt,
        updatedAt: pkg.updatedAt,
        hasEmployees: true
      };

      return packageService;
    }).filter(Boolean) as Service[];
  }, [packages, employees, services]);

  // Filter regular services to only show those with available employees
  const availableServices = useMemo(() => {
    return services.filter(service => {
      const hasEmployees = employees.some(emp => {
        if (!emp.services || !Array.isArray(emp.services)) return false;
        return emp.services.some(empService => {
          const empServiceId = typeof empService === 'object' ? (empService as any).id : empService;
          return empServiceId === service.id;
        });
      });
      return hasEmployees;
    });
  }, [services, employees]);

  // Combine individual services and package services
  const allAvailableServices = [...availableServices, ...availablePackageServices];

  if (allAvailableServices.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          Nenhum serviço disponível no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {allAvailableServices.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          onSelect={() => onSelectService(service)}
          themeColor={themeColor}
        />
      ))}
    </div>
  );
};

export default ServicesList;
