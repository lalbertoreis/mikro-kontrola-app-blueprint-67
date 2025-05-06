
import { supabase } from "@/integrations/supabase/client";
import { Employee } from "@/types/employee";

// Função para verificar disponibilidade de um funcionário para um determinado serviço
export async function checkEmployeeAvailability(
  employeeId: string,
  serviceId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('employee_services')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('service_id', serviceId)
      .maybeSingle();
    
    if (error) throw error;
    
    return !!data; // Se existe uma relação, o funcionário está disponível para o serviço
  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error);
    return false;
  }
}

// Função para obter os horários de turno do funcionário
export async function getEmployeeShiftHours(employeeId: string, dayOfWeek: number, slug?: string): Promise<{ startTime: string, endTime: string } | null> {
  try {
    // Definir slug para a sessão se fornecido
    if (slug) {
      try {
        await supabase.rpc('set_slug_for_session', { slug });
      } catch (error) {
        console.error('Erro ao definir slug para a sessão:', error);
      }
    }
    
    // Consulta diretamente na view employees_shifts_view
    const { data, error } = await supabase
      .from('employees_shifts_view')
      .select('start_time, end_time')
      .eq('employee_id', employeeId)
      .eq('day_of_week', dayOfWeek)
      .maybeSingle();
    
    if (error) throw error;
    if (!data) return null;
    
    console.log(`Turno encontrado para funcionário ${employeeId} no dia ${dayOfWeek}:`, data);
    
    return {
      startTime: data.start_time,
      endTime: data.end_time
    };
  } catch (error) {
    console.error('Erro ao buscar horários de turno:', error);
    return null;
  }
}

// Função para obter os dias da semana disponíveis para um funcionário
export async function getEmployeeAvailableDays(employeeId: string, slug?: string): Promise<number[]> {
  try {
    // Definir slug para a sessão se fornecido
    if (slug) {
      try {
        await supabase.rpc('set_slug_for_session', { slug });
      } catch (error) {
        console.error('Erro ao definir slug para a sessão:', error);
      }
    }
    
    // Consulta diretamente na view employees_shifts_view
    const { data, error } = await supabase
      .from('employees_shifts_view')
      .select('day_of_week')
      .eq('employee_id', employeeId);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.log(`Nenhum dia disponível encontrado para o funcionário ${employeeId}`);
      return [];
    }
    
    // Extrair os dias da semana distintos
    const availableDays = [...new Set(data.map(item => item.day_of_week))];
    console.log(`Dias disponíveis para funcionário ${employeeId}:`, availableDays);
    
    return availableDays;
  } catch (error) {
    console.error('Erro ao buscar dias disponíveis:', error);
    return [];
  }
}

// Exportar outras funções relacionadas
export * from "./index";
