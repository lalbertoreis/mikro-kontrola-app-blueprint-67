
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
  // Only include packages with show_in_online_booking = true
  const availablePackageServices = useMemo(() => {
    if (!packages || !employees || !services) return [];

    console.log("ServicesList - Processing packages:", packages.length);
    console.log("ServicesList - Available employees:", employees.length);
    console.log("ServicesList - Available services:", services.length);

    // Filter packages that are active and enabled for online booking
    const onlineBookingPackages = packages.filter(pkg => {
      const isEligible = pkg.isActive && pkg.showInOnlineBooking;
      console.log(`Package ${pkg.name}: isActive=${pkg.isActive}, showInOnlineBooking=${pkg.showInOnlineBooking}, eligible=${isEligible}`);
      return isEligible;
    });

    console.log("Packages eligible for online booking:", onlineBookingPackages.length);
    
    return onlineBookingPackages.map(pkg => {
      // Check which employees can provide ALL services in this package
      const availableEmployees = employees.filter(emp => {
        if (!emp.services || !Array.isArray(emp.services)) {
          console.log(`Employee ${emp.name} has no services array`);
          return false;
        }
        
        // Employee must have ALL services in the package
        const hasAllServices = pkg.services.every(serviceId => {
          return emp.services.some(empService => {
            const empServiceId = typeof empService === 'object' ? (empService as any).id : empService;
            return empServiceId === serviceId;
          });
        });

        console.log(`Employee ${emp.name} can provide package ${pkg.name}: ${hasAllServices}`);
        return hasAllServices;
      });

      // Only include packages that have at least one employee who can provide them
      if (availableEmployees.length === 0) {
        console.log(`Package ${pkg.name} has no available employees - excluding`);
        return null;
      }

      console.log(`Package ${pkg.name} has ${availableEmployees.length} available employees`);

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
    console.log("ServicesList - Filtering regular services:", services.length);
    
    return services.filter(service => {
      const hasEmployees = employees.some(emp => {
        if (!emp.services || !Array.isArray(emp.services)) return false;
        return emp.services.some(empService => {
          const empServiceId = typeof empService === 'object' ? (empService as any).id : empService;
          return empServiceId === service.id;
        });
      });
      
      console.log(`Service ${service.name} has employees: ${hasEmployees}`);
      return hasEmployees;
    });
  }, [services, employees]);

  // Combine individual services and package services
  const allAvailableServices = [...availableServices, ...availablePackageServices];

  console.log("ServicesList - Final available services:", allAvailableServices.length);

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
          item={service}
          onClick={() => onSelectService(service)}
          color={themeColor}
        />
      ))}
    </div>
  );
};

export default ServicesList;
