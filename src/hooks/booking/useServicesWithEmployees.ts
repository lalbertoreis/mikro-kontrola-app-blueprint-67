
import { useMemo } from "react";
import { useServicesBySlug } from "@/hooks/useServices";
import { useEmployees } from "@/hooks/useEmployees";
import { Service } from "@/types/service";

/**
 * Hook to get services with employee availability flags
 */
export function useServicesWithEmployees(slug: string | undefined) {
  const { data: services = [], isLoading: isServicesLoading } = useServicesBySlug(slug);
  const { employees, isLoading: isEmployeesLoading } = useEmployees();

  // Map services to employees
  const serviceWithEmployeesMap = useMemo(() => {
    console.log("Building serviceWithEmployeesMap with employees:", employees.length);
    const map = new Map<string, string[]>();
    
    employees.forEach(employee => {
      if (!employee.services) {
        console.log(`Employee ${employee.name} has no services defined`);
        return;
      }
      
      employee.services.forEach(serviceId => {
        console.log(`Employee ${employee.name} has service ${serviceId}`);
        if (!map.has(serviceId)) {
          map.set(serviceId, []);
        }
        map.get(serviceId)?.push(employee.id);
      });
    });
    
    // Debug what's in the map
    console.log("ServiceWithEmployeesMap final size:", map.size);
    map.forEach((employeeIds, serviceId) => {
      console.log(`Service ${serviceId} has ${employeeIds.length} employees`);
    });
    
    return map;
  }, [employees]);

  // Add hasEmployees property to services
  const servicesWithEmployeeFlag = useMemo(() => {
    console.log("Calculating servicesWithEmployeeFlag");
    if (!services || services.length === 0) {
      console.log("No services available yet");
      return [];
    }
    
    return services.map(service => {
      const serviceEmployees = serviceWithEmployeesMap.get(service.id) || [];
      const hasEmployees = serviceEmployees.length > 0;
      
      console.log(`Service ${service.name} (${service.id}): hasEmployees=${hasEmployees}, employeesCount=${serviceEmployees.length}`);
      
      return {
        ...service,
        hasEmployees
      };
    });
  }, [services, serviceWithEmployeesMap]);

  // Wait for both services and employees to load before returning data
  const isLoading = isServicesLoading || isEmployeesLoading;
  
  return {
    services: isLoading ? [] : servicesWithEmployeeFlag,
    isServicesLoading,
    isEmployeesLoading,
    employees,
    serviceWithEmployeesMap,
    isLoading
  };
}
