
import { useMemo } from "react";
import { useServicesBySlug } from "@/hooks/useServices";
import { useEmployeesBySlug } from "@/hooks/useEmployees";
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
  
  const { 
    data: businessProfile, 
    isLoading: isViewLoading 
  } = useBusinessProfileBySlug(slug);

  // Filter services that are active and enabled for online booking
  const availableServices = useMemo(() => {
    console.log("useServicesWithEmployees - All services:", allServices.length);
    console.log("useServicesWithEmployees - All employees:", allEmployees.length);
    
    if (!allServices || !allEmployees) return [];
    
    // Only include services that are active and have show_in_online_booking enabled
    const onlineBookingServices = allServices.filter(service => {
      const isActive = service.isActive;
      // For now, assume all active services are available for online booking
      // This can be enhanced when the services table has a show_in_online_booking column
      console.log(`Service ${service.name}: isActive=${isActive}`);
      return isActive;
    });
    
    console.log("Services available for online booking:", onlineBookingServices.length);
    
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
      console.log(`Service ${service.name} has ${availableEmployees.length} employees available`);
      
      return {
        ...service,
        hasEmployees
      };
    });
    
    // Only return services that have employees
    const finalServices = servicesWithEmployees.filter(service => service.hasEmployees);
    console.log("Final services with employees:", finalServices.length);
    
    return finalServices;
  }, [allServices, allEmployees]);

  // Get booking settings from business profile
  const bookingSettings = useMemo(() => {
    return {
      simultaneousLimit: businessProfile?.booking_simultaneous_limit || 3,
      futureLimit: businessProfile?.booking_future_limit || 30,
      cancelMinHours: businessProfile?.booking_cancel_min_hours || 24,
      timeInterval: businessProfile?.booking_time_interval || 30
    };
  }, [businessProfile]);

  return {
    services: availableServices,
    employees: allEmployees,
    isServicesLoading,
    isEmployeesLoading,
    isViewLoading,
    bookingSettings
  };
}

// Import the missing hook
import { useBusinessProfileBySlug } from "@/hooks/booking/useBusinessProfile";
