
import { useMemo } from "react";
import { useServicesBySlug } from "@/hooks/useServices";
import { useEmployeesBySlug } from "@/hooks/useEmployeesBySlug";
import { Service } from "@/types/service";
import { Employee } from "@/types/employee";

/**
 * Hook to get services with employee availability information
 * Returns unique services (no duplicates) that have employees available
 */
export function useServicesWithEmployees(slug?: string) {
  const { 
    data: allServices = [], 
    isLoading: isServicesLoading 
  } = useServicesBySlug(slug);
  
  const { 
    data: allEmployees = [], 
    isLoading: isEmployeesLoading 
  } = useEmployeesBySlug(slug);

  // Filter and deduplicate services that are active and have available employees
  const availableServices = useMemo(() => {
    console.log("useServicesWithEmployees - Processing services:", {
      servicesCount: allServices?.length || 0,
      employeesCount: allEmployees?.length || 0,
      isServicesLoading,
      isEmployeesLoading
    });

    // Don't filter if we're still loading
    if (isServicesLoading || isEmployeesLoading) {
      return [];
    }

    if (!allServices || !allEmployees) {
      console.log("useServicesWithEmployees - No services or employees data");
      return [];
    }
    
    // Create a Map to ensure unique services (deduplicate by service ID)
    const uniqueServicesMap = new Map<string, Service>();
    
    // Only include services that are active
    const activeServices = allServices.filter(service => {
      const isActive = service.isActive;
      console.log(`Service ${service.name}: isActive=${isActive}`);
      return isActive;
    });
    
    // For each active service, check if there are employees who can provide it
    activeServices.forEach(service => {
      const serviceId = typeof service.id === 'object' ? (service.id as any).id : service.id;
      
      const availableEmployees = allEmployees.filter(employee => {
        if (!employee.services || !Array.isArray(employee.services)) {
          return false;
        }
        
        // Check if employee provides this service
        const canProvideService = employee.services.some(empService => {
          const empServiceId = typeof empService === 'object' ? (empService as any).id : empService;
          return empServiceId === serviceId;
        });
        
        return canProvideService;
      });
      
      const hasEmployees = availableEmployees.length > 0;
      console.log(`Service ${service.name}: hasEmployees=${hasEmployees}, employeesCount=${availableEmployees.length}`);
      
      // Only add to map if service has employees (this ensures uniqueness and availability)
      if (hasEmployees) {
        uniqueServicesMap.set(serviceId, {
          ...service,
          hasEmployees
        });
      }
    });
    
    const result = Array.from(uniqueServicesMap.values());
    console.log(`useServicesWithEmployees - Final result: ${result.length} unique services with employees`);
    
    return result;
  }, [allServices, allEmployees, isServicesLoading, isEmployeesLoading]);

  // Get booking settings - using default values since we don't have businessProfile here
  const bookingSettings = useMemo(() => {
    return {
      simultaneousLimit: 3,
      futureLimit: 30,
      cancelMinHours: 24,
      timeInterval: 30
    };
  }, []);

  // Only show loading if we have no services and are actually loading
  const showServicesLoading = isServicesLoading && availableServices.length === 0;
  const showEmployeesLoading = isEmployeesLoading && allEmployees.length === 0;

  console.log("useServicesWithEmployees - Hook result:", {
    servicesCount: availableServices.length,
    employeesCount: allEmployees.length,
    showServicesLoading,
    showEmployeesLoading
  });

  return {
    services: availableServices,
    employees: allEmployees,
    isServicesLoading: showServicesLoading,
    isEmployeesLoading: showEmployeesLoading,
    isViewLoading: false,
    bookingSettings
  };
}
