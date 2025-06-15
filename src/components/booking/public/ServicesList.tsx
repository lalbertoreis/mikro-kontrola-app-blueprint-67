
import React from "react";
import { Service, ServicePackage } from "@/types/service";
import { Employee } from "@/types/employee";
import ServiceCard from "../ServiceCard";

interface ServicesListProps {
  services: Service[];
  packages: ServicePackage[];
  employees: Employee[];
  onSelectService: (service: Service) => void;
  themeColor?: string;
}

const ServicesList: React.FC<ServicesListProps> = ({
  services,
  packages,
  employees,
  onSelectService,
  themeColor
}) => {
  console.log("ServicesList - Render props:", {
    servicesCount: services?.length || 0,
    packagesCount: packages?.length || 0,
    employeesCount: employees?.length || 0
  });

  // Create package services that can be offered by available employees
  const availablePackageServices = React.useMemo(() => {
    if (!packages || !employees || !services) {
      return [];
    }

    const packageServices = packages.map(pkg => {
      // Check which employees can provide ALL services in this package
      const availableEmployees = employees.filter(emp => {
        if (!emp.services || !Array.isArray(emp.services)) {
          return false;
        }
        
        // Employee must have ALL services in the package
        const hasAllServices = pkg.services.every(serviceId => {
          return emp.services.some(empService => {
            const empServiceId = typeof empService === 'object' ? (empService as any).id : empService;
            return empServiceId === serviceId;
          });
        });

        return hasAllServices;
      });

      // Only include packages that have at least one employee who can provide them
      if (availableEmployees.length === 0) {
        console.log(`Package ${pkg.name}: No employees can provide all services`);
        return null;
      }

      console.log(`Package ${pkg.name}: ${availableEmployees.length} employees can provide all services`);

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

    console.log(`ServicesList - Package services result: ${packageServices.length} packages available`);
    return packageServices;
  }, [packages, employees, services]);

  // Check if we have any content to show
  const hasServices = services && services.length > 0;
  const hasPackages = availablePackageServices.length > 0;

  console.log("ServicesList - Final content check:", {
    hasServices,
    hasPackages,
    totalContent: hasServices || hasPackages
  });

  if (!hasServices && !hasPackages) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          Nenhum serviço disponível no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Individual Services Section */}
      {hasServices && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Serviços</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                item={service}
                onClick={() => onSelectService(service)}
                color={themeColor}
              />
            ))}
          </div>
        </div>
      )}

      {/* Packages Section */}
      {hasPackages && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Pacotes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availablePackageServices.map((service) => (
              <ServiceCard
                key={service.id}
                item={service}
                onClick={() => onSelectService(service)}
                color={themeColor}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesList;
