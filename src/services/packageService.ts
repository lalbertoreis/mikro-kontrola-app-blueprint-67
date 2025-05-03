
import { supabase } from "@/integrations/supabase/client";
import { ServicePackage, ServicePackageFormData } from "@/types/service";

export async function fetchServicePackages(): Promise<ServicePackage[]> {
  try {
    const { data, error } = await supabase
      .from('service_packages')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    // Transform the JSONB services array to string array
    return data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || undefined,
      services: Array.isArray(item.services) ? item.services.map(String) : [],
      price: Number(item.price),
      discount: Number(item.discount),
      isActive: item.is_active,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  } catch (error) {
    console.error('Error fetching service packages:', error);
    throw error;
  }
}

export async function fetchServicePackageById(id: string): Promise<ServicePackage | null> {
  try {
    const { data, error } = await supabase
      .from('service_packages')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || undefined,
      services: Array.isArray(data.services) ? data.services.map(String) : [],
      price: Number(data.price),
      discount: Number(data.discount),
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Error fetching service package:', error);
    throw error;
  }
}

export async function createServicePackage(packageData: ServicePackageFormData): Promise<ServicePackage> {
  try {
    const { name, description, services, price, discount } = packageData;
    
    const { data, error } = await supabase
      .from('service_packages')
      .insert({
        name,
        description,
        services,
        price,
        discount,
        is_active: true,
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || undefined,
      services: Array.isArray(data.services) ? data.services.map(String) : [],
      price: Number(data.price),
      discount: Number(data.discount),
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Error creating service package:', error);
    throw error;
  }
}

export async function updateServicePackage(id: string, packageData: ServicePackageFormData): Promise<ServicePackage> {
  try {
    const { name, description, services, price, discount } = packageData;
    
    const { data, error } = await supabase
      .from('service_packages')
      .update({
        name,
        description,
        services,
        price,
        discount,
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
      services: Array.isArray(data.services) ? data.services.map(String) : [],
      price: Number(data.price),
      discount: Number(data.discount),
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Error updating service package:', error);
    throw error;
  }
}

export async function deleteServicePackage(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('service_packages')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting service package:', error);
    throw error;
  }
}
