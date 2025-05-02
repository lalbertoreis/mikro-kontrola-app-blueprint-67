
import { supabase } from "@/integrations/supabase/client";
import { Holiday, HolidayFormData, HolidayType } from "@/types/holiday";

export async function fetchHolidays(): Promise<Holiday[]> {
  try {
    const { data, error } = await supabase
      .from('holidays')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) throw error;
    
    // Transform do formato Supabase para o formato da aplicação
    return data.map(item => ({
      id: item.id,
      date: item.date,
      name: item.name,
      type: item.type as HolidayType,
      description: item.description || undefined,
      isActive: item.is_active,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  } catch (error) {
    console.error('Erro ao buscar feriados:', error);
    throw error;
  }
}

export async function fetchHolidayById(id: string): Promise<Holiday | null> {
  try {
    const { data, error } = await supabase
      .from('holidays')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    return {
      id: data.id,
      date: data.date,
      name: data.name,
      type: data.type as HolidayType,
      description: data.description || undefined,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Erro ao buscar feriado:', error);
    throw error;
  }
}

export async function createHoliday(holidayData: HolidayFormData): Promise<Holiday> {
  try {
    const { date, name, type, description, isActive } = holidayData;
    
    const { data, error } = await supabase
      .from('holidays')
      .insert({
        date: date.toISOString().split('T')[0], // Formata como YYYY-MM-DD
        name,
        type,
        description,
        is_active: isActive,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      date: data.date,
      name: data.name,
      type: data.type as HolidayType,
      description: data.description || undefined,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Erro ao criar feriado:', error);
    throw error;
  }
}

export async function updateHoliday(id: string, holidayData: HolidayFormData): Promise<Holiday> {
  try {
    const { date, name, type, description, isActive } = holidayData;
    
    const { data, error } = await supabase
      .from('holidays')
      .update({
        date: date.toISOString().split('T')[0], // Formata como YYYY-MM-DD
        name,
        type,
        description,
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      date: data.date,
      name: data.name,
      type: data.type as HolidayType,
      description: data.description || undefined,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Erro ao atualizar feriado:', error);
    throw error;
  }
}

export async function deleteHoliday(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('holidays')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao excluir feriado:', error);
    throw error;
  }
}
