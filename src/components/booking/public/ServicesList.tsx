
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
  const { packages, isLoading: isPackagesLoading } = useServicePackages();

  // Create package services that can be offered by available employees
  // Only include packages with show_in_online_booking = true
  const availablePackageServices = useMemo(() => {
    console.log("ServicesList - Processing packages:", {
      packagesCount: packages?.length || 0,
      isPackagesLoading,
      employeesCount: employees?.length || 0,
      servicesCount: services?.length || 0
    });

    if (isPackagesLoading || !packages || !employees || !services) {
      return [];
    }

    // Filter packages that are active and enabled for online booking
    const onlineBookingPackages = packages.filter(pkg => {
      const isEligible = pkg.isActive && pkg.showInOnlineBooking;
      console.log(`Package ${pkg.name}: isActive=${pkg.isActive}, showInOnlineBooking=${pkg.showInOnlineBooking}, eligible=${isEligible}`);
      return isEligible;
    });
    
    const packageServices = onlineBookingPackages.map(pkg => {
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
  }, [packages, employees, services, isPackagesLoading]);

  // Services are already filtered and deduplicated in the parent hook
  const availableServices = useMemo(() => {
    console.log("ServicesList - Processing individual services:", {
      servicesCount: services?.length || 0,
      employeesCount: employees?.length || 0
    });

    if (!services || !employees) {
      return [];
    }
    
    // Services are already filtered to only include those with available employees
    console.log(`ServicesList - Individual services result: ${services.length} services available`);
    return services;
  }, [services, employees]);

  // Loading state
  if (isPackagesLoading) {
    console.log("ServicesList - Still loading packages, showing skeleton");
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  // Check if we have any content to show
  const hasServices = availableServices.length > 0;
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
            {availableServices.map((service) => (
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
