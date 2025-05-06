
import { useMemo } from "react";
import { useServicesBySlug } from "@/hooks/useServices";
import { Service } from "@/types/service";
import { Employee } from "@/types/employee";
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
  const { data: rawEmployees = [], isLoading: isEmployeesLoading } = useQuery({
    queryKey: ["employees-shifts-view", slug],
    queryFn: async () => {
      try {
        if (!slug) return [];
        
        // Configurar o slug para a sessão
        await setSlugForSession(slug);
        
        // Buscar da view employees_shifts_view
        const { data, error } = await supabase
          .from('employees_shifts_view')
          .select('employee_id, employee_name, employee_role, day_of_week, start_time, end_time')
          .eq('business_slug', slug)
          .order('employee_name');
          
        if (error) {
          console.error("Error fetching from employees_shifts_view:", error);
          throw error;
        }
        
        console.log(`Retrieved ${data?.length || 0} employee shift records from view`);
        return data || [];
      } catch (error) {
        console.error("Error in employees query:", error);
        return [];
      }
    },
    enabled: !!slug
  });

  // Transformar os dados brutos dos funcionários no formato Employee[]
  const employees = useMemo(() => {
    if (!rawEmployees || rawEmployees.length === 0) return [];
    
    // Criar um mapa para agrupar turnos por funcionário
    const employeeMap = new Map();
    
    // Processar cada registro da view
    rawEmployees.forEach(record => {
      const employeeId = record.employee_id;
      
      if (!employeeMap.has(employeeId)) {
        // Inicializar o funcionário se não existir no mapa
        employeeMap.set(employeeId, {
          id: employeeId,
          name: record.employee_name,
          role: record.employee_role,
          shifts: [],
          services: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      // Adicionar o turno ao funcionário se tiver as informações necessárias
      if (record.day_of_week !== null && record.start_time && record.end_time) {
        const employee = employeeMap.get(employeeId);
        employee.shifts.push({
          dayOfWeek: record.day_of_week,
          startTime: record.start_time,
          endTime: record.end_time
        });
      }
    });
    
    // Converter o mapa para um array de funcionários
    return Array.from(employeeMap.values()) as Employee[];
  }, [rawEmployees]);

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
