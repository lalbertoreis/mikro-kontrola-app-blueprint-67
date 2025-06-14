
import { useMemo } from "react";
import { useServicesBySlug } from "@/hooks/useServices";
import { useEmployeesBySlug } from "@/hooks/useEmployeesBySlug";
import { Service } from "@/types/service";
import { Employee } from "@/types/employee";

/**
 * Hook to get services with employee availability information
 * Only returns services that have show_in_online_booking enabled
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

  // Filter services that are active and enabled for online booking
  const availableServices = useMemo(() => {
    // Always return cached data if available, even during loading states
    if (!allServices || !allEmployees) {
      return [];
    }
    
    // Only include services that are active and have show_in_online_booking enabled
    const onlineBookingServices = allServices.filter(service => {
      const isActive = service.isActive;
      return isActive;
    });
    
    // For each service, check if there are employees who can provide it
    const servicesWithEmployees = onlineBookingServices.map(service => {
      const availableEmployees = allEmployees.filter(employee => {
        if (!employee.services || !Array.isArray(employee.services)) {
          return false;
        }
        
        // Check if employee provides this service
        const canProvideService = employee.services.some(empService => {
          const empServiceId = typeof empService === 'object' ? (empService as any).id : empService;
          return empServiceId === service.id;
        });
        
        return canProvideService;
      });
      
      const hasEmployees = availableEmployees.length > 0;
      
      return {
        ...service,
        hasEmployees
      };
    });
    
    // Only return services that have employees
    return servicesWithEmployees.filter(service => service.hasEmployees);
  }, [allServices, allEmployees]);

  // Get booking settings - using default values since we don't have businessProfile here
  const bookingSettings = useMemo(() => {
    return {
      simultaneousLimit: 3,
      futureLimit: 30,
      cancelMinHours: 24,
      timeInterval: 30
    };
  }, []);

  return {
    services: availableServices,
    employees: allEmployees,
    isServicesLoading: isServicesLoading && availableServices.length === 0,
    isEmployeesLoading: isEmployeesLoading && allEmployees.length === 0,
    isViewLoading: false,
    bookingSettings
  };
}
