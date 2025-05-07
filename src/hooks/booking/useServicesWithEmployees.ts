
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
          .select('id, employee_id, booking_simultaneous_limit, booking_future_limit, booking_cancel_min_hours')
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
    enabled: !!slug,
    // Reduzir o cache e aumentar tentativas de reconexão
    staleTime: 1000 * 60, // 1 minuto
    retry: 3,
    refetchOnWindowFocus: true,
    retryDelay: attempt => Math.min(attempt > 1 ? 2 ** attempt * 1000 : 1000, 30 * 1000)
  });
  
  // Usar useQuery para buscar funcionários e seus turnos
  const { data: rawEmployees = [], isLoading: isEmployeesLoading } = useQuery({
    queryKey: ["employees-shifts-view", slug],
    queryFn: async () => {
      try {
        if (!slug) return [];
        
        console.log("Fetching employees for slug:", slug);
        
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
        if (data && data.length > 0) {
          console.log("Sample employee data:", data[0]);
        } else {
          console.log("No employees found for this business");
        }
        
        return data || [];
      } catch (error) {
        console.error("Error in employees query:", error);
        return [];
      }
    },
    enabled: !!slug,
    // Reduzir o cache e aumentar tentativas de reconexão
    staleTime: 1000 * 60, // 1 minuto
    retry: 3,
    refetchOnWindowFocus: true,
    retryDelay: attempt => Math.min(attempt > 1 ? 2 ** attempt * 1000 : 1000, 30 * 1000)
  });

  // Transformar os dados brutos dos funcionários no formato Employee[]
  const employees = useMemo(() => {
    if (!rawEmployees || rawEmployees.length === 0) {
      console.log("No employee data available to transform");
      return [];
    }
    
    // Criar um mapa para agrupar turnos por funcionário
    const employeeMap = new Map();
    
    // Processar cada registro da view
    rawEmployees.forEach(record => {
      const employeeId = record.employee_id;
      
      if (!employeeId) {
        console.warn("Found record without employee_id:", record);
        return;
      }
      
      if (!employeeMap.has(employeeId)) {
        // Inicializar o funcionário se não existir no mapa
        employeeMap.set(employeeId, {
          id: employeeId,
          name: record.employee_name || 'Sem nome',
          role: record.employee_role || 'Funcionário',
          shifts: [],
          services: [], // Will be populated later from serviceWithEmployeesMap
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
    const employeeList = Array.from(employeeMap.values()) as Employee[];
    console.log(`Transformed ${employeeList.length} employees from raw data`);
    return employeeList;
  }, [rawEmployees]);

  // Extrair configurações de agendamento para retornar
  const bookingSettings = useMemo(() => {
    if (serviceEmployees.length === 0) return {
      simultaneousLimit: 3,
      futureLimit: 3,
      cancelMinHours: 1
    };
    
    // Pegar o primeiro registro para obter as configurações
    const firstService = serviceEmployees[0];
    return {
      simultaneousLimit: firstService.booking_simultaneous_limit || 3,
      futureLimit: firstService.booking_future_limit || 3,
      cancelMinHours: firstService.booking_cancel_min_hours || 1
    };
  }, [serviceEmployees]);

  // Criar mapa de serviços para funcionários e de funcionários para serviços
  const { serviceWithEmployeesMap, employeeWithServicesMap } = useMemo(() => {
    const serviceMap = new Map<string, string[]>();
    const employeeMap = new Map<string, string[]>();
    
    if (!serviceEmployees || serviceEmployees.length === 0) {
      console.log("No service-employee relationships found");
      return { serviceWithEmployeesMap: serviceMap, employeeWithServicesMap: employeeMap };
    }
    
    serviceEmployees.forEach(relation => {
      if (relation.employee_id && relation.id) {
        // Map services to employees
        if (!serviceMap.has(relation.id)) {
          serviceMap.set(relation.id, []);
        }
        serviceMap.get(relation.id)?.push(relation.employee_id);
        
        // Map employees to services
        if (!employeeMap.has(relation.employee_id)) {
          employeeMap.set(relation.employee_id, []);
        }
        employeeMap.get(relation.employee_id)?.push(relation.id);
      }
    });
    
    // Debug do mapa serviço->funcionários
    console.log(`ServiceWithEmployeesMap size: ${serviceMap.size}`);
    serviceMap.forEach((employeeIds, serviceId) => {
      console.log(`Service ${serviceId} has ${employeeIds.length} employees`);
    });
    
    // Debug do mapa funcionário->serviços
    console.log(`EmployeeWithServicesMap size: ${employeeMap.size}`);
    employeeMap.forEach((serviceIds, employeeId) => {
      console.log(`Employee ${employeeId} provides ${serviceIds.length} services`);
    });
    
    return { serviceWithEmployeesMap: serviceMap, employeeWithServicesMap: employeeMap };
  }, [serviceEmployees]);

  // Update employees with their services
  const employeesWithServices = useMemo(() => {
    return employees.map(employee => {
      const serviceIds = employeeWithServicesMap.get(employee.id) || [];
      return {
        ...employee,
        services: serviceIds
      };
    });
  }, [employees, employeeWithServicesMap]);

  // Adicionar flag hasEmployees aos serviços
  const servicesWithEmployeeFlag = useMemo(() => {
    if (!services || services.length === 0) {
      console.log("No services available yet");
      return [];
    }
    
    return services.map(service => {
      const serviceId = typeof service.id === 'object' ? (service.id as any).id : service.id;
      const serviceEmployees = serviceWithEmployeesMap.get(serviceId) || [];
      const hasEmployees = serviceEmployees.length > 0;
      
      console.log(`Service ${service.name} (${serviceId}): hasEmployees=${hasEmployees}, employeesCount=${serviceEmployees.length}`);
      
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
    employees: employeesWithServices, // Use the employees with services
    serviceWithEmployeesMap,
    employeeWithServicesMap,
    isLoading,
    bookingSettings
  };
}
