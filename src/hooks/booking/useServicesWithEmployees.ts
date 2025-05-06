
import { useMemo } from "react";
import { useServicesBySlug } from "@/hooks/useServices";
import { Service } from "@/types/service";
import { supabase } from "@/integrations/supabase/client";
import { setSlugForSession } from "./utils/businessUtils";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook to get services with employee availability directly from the views
 */
export function useServicesWithEmployees(slug: string | undefined) {
  // Buscar serviços pela slug
  const { data: services = [], isLoading: isServicesLoading } = useServicesBySlug(slug);
  
  // Usar useQuery para buscar diretamente da view business_services_view
  const { data: serviceEmployees = [], isLoading: isViewLoading } = useQuery({
    queryKey: ["business-services-view", slug],
    queryFn: async () => {
      try {
        if (!slug) return [];
        
        // Configurar o slug para a sessão
        await setSlugForSession(slug);
        
        // Buscar da view business_services_view
        const { data, error } = await supabase
          .from('business_services_view')
          .select('id, employee_id')
          .eq('business_slug', slug);
          
        if (error) {
          console.error("Error fetching from business_services_view:", error);
          throw error;
        }
        
        console.log(`Retrieved ${data?.length || 0} service-employee relationships from view`);
        return data || [];
      } catch (error) {
        console.error("Error in serviceEmployees query:", error);
        return [];
      }
    },
    enabled: !!slug
  });
  
  // Usar useQuery para buscar funcionários e seus turnos
  const { data: employees = [], isLoading: isEmployeesLoading } = useQuery({
    queryKey: ["employees-shifts-view", slug],
    queryFn: async () => {
      try {
        if (!slug) return [];
        
        // Configurar o slug para a sessão
        await setSlugForSession(slug);
        
        // Buscar da view employees_shifts_view
        const { data, error } = await supabase
          .from('employees_shifts_view')
          .select('employee_id, employee_name, employee_role')
          .eq('business_slug', slug)
          .order('employee_name');
          
        if (error) {
          console.error("Error fetching from employees_shifts_view:", error);
          throw error;
        }
        
        // Remover duplicatas (um funcionário pode ter múltiplos turnos)
        const uniqueEmployees = Array.from(
          new Map(data.map(item => [item.employee_id, item])).values()
        );
        
        console.log(`Retrieved ${uniqueEmployees?.length || 0} employees from view`);
        return uniqueEmployees;
      } catch (error) {
        console.error("Error in employees query:", error);
        return [];
      }
    },
    enabled: !!slug
  });

  // Criar mapa de serviços para funcionários
  const serviceWithEmployeesMap = useMemo(() => {
    const map = new Map<string, string[]>();
    
    if (!serviceEmployees || serviceEmployees.length === 0) {
      console.log("No service-employee relationships found");
      return map;
    }
    
    serviceEmployees.forEach(relation => {
      if (relation.employee_id && relation.id) {
        if (!map.has(relation.id)) {
          map.set(relation.id, []);
        }
        map.get(relation.id)?.push(relation.employee_id);
      }
    });
    
    // Debug do mapa
    console.log(`ServiceWithEmployeesMap size: ${map.size}`);
    map.forEach((employeeIds, serviceId) => {
      console.log(`Service ${serviceId} has ${employeeIds.length} employees`);
    });
    
    return map;
  }, [serviceEmployees]);

  // Adicionar flag hasEmployees aos serviços
  const servicesWithEmployeeFlag = useMemo(() => {
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

  // Esperar que todos os dados sejam carregados antes de retornar
  const isLoading = isServicesLoading || isViewLoading || isEmployeesLoading;
  
  return {
    services: servicesWithEmployeeFlag,
    isServicesLoading,
    isViewLoading,
    isEmployeesLoading,
    employees,
    serviceWithEmployeesMap,
    isLoading
  };
}
