
import { supabase } from "@/integrations/supabase/client";
import { Service, ServiceFormData } from "@/types/service";

export async function fetchServices(businessUserId?: string): Promise<Service[]> {
  try {
    console.info("Services data fetching with businessUserId:", businessUserId);
    
    let query = supabase
      .from('services')
      .select('*')
      .order('name');
    
    // If a business user ID is provided, filter by that user ID
    if (businessUserId) {
      query = query.eq('user_id', businessUserId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    console.info("Services data returned:", data);
    console.info("Number of services found:", data?.length || 0);
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || undefined,
      price: Number(item.price),
      duration: Number(item.duration),
      isActive: item.is_active,
      multipleAttendees: false, // This field might not exist in the database, adjust accordingly
      maxAttendees: undefined, // This field might not exist in the database, adjust accordingly
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    throw error;
  }
}

export async function fetchServiceById(id: string): Promise<Service | null> {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || undefined,
      price: Number(data.price),
      duration: Number(data.duration),
      isActive: data.is_active,
      multipleAttendees: false, // This field might not exist in the database, adjust accordingly
      maxAttendees: undefined, // This field might not exist in the database, adjust accordingly
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Erro ao buscar serviço:', error);
    throw error;
  }
}

export async function createService(serviceData: ServiceFormData): Promise<Service> {
  try {
    const { name, description, price, duration, isActive } = serviceData;
    
    const { data, error } = await supabase
      .from('services')
      .insert({
        name,
        description,
        price,
        duration,
        is_active: isActive,
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || undefined,
      price: Number(data.price),
      duration: Number(data.duration),
      isActive: data.is_active,
      multipleAttendees: false,
      maxAttendees: undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    throw error;
  }
}

export async function updateService(id: string, serviceData: ServiceFormData): Promise<Service> {
  try {
    const { name, description, price, duration, isActive } = serviceData;
    
    const { data, error } = await supabase
      .from('services')
      .update({
        name,
        description,
        price,
        duration,
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || undefined,
      price: Number(data.price),
      duration: Number(data.duration),
      isActive: data.is_active,
      multipleAttendees: false,
      maxAttendees: undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    throw error;
  }
}

export async function deleteService(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao excluir serviço:', error);
    throw error;
  }
}
