
import { supabase } from "@/integrations/supabase/client";
import { Client, ClientFormData } from "@/types/client";

export async function fetchClients(): Promise<Client[]> {
  try {
    console.log("Fetching clients for logged in user only");
    
    // Verify if user is authenticated
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.log("No authenticated user, returning empty clients list");
      return [];
    }
    
    console.log("Authenticated user ID:", userData.user.id);
    
    // Get clients filtered by RLS policies - only user's own clients will be returned
    const { data, error } = await supabase
      .from('clients')
      .select(`
        *,
        appointments:appointments(start_time)
      `)
      .order('name');
    
    if (error) {
      console.error("Error fetching clients:", error);
      throw error;
    }
    
    console.log(`Fetched ${data?.length || 0} clients for user ${userData.user.id}`);
    
    return data.map(item => {
      // Get the most recent appointment date if any
      const appointments = item.appointments as { start_time: string }[] | null;
      const lastAppointment = appointments && appointments.length > 0
        ? new Date(Math.max(...appointments.map(a => new Date(a.start_time).getTime()))).toISOString()
        : undefined;
        
      return {
        id: item.id,
        name: item.name,
        email: item.email || "",
        phone: item.phone || "",
        cep: item.cep || "",
        address: item.address || "",
        lastAppointment,
        notes: item.notes || "",
        createdAt: item.created_at,
        updatedAt: item.updated_at
      };
    });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    throw error;
  }
}

export async function fetchClientById(id: string): Promise<Client | null> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select(`
        *,
        appointments:appointments(start_time)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    // Get the most recent appointment date if any
    const appointments = data.appointments as { start_time: string }[] | null;
    const lastAppointment = appointments && appointments.length > 0
      ? new Date(Math.max(...appointments.map(a => new Date(a.start_time).getTime()))).toISOString()
      : undefined;
    
    return {
      id: data.id,
      name: data.name,
      email: data.email || "",
      phone: data.phone || "",
      cep: data.cep || "",
      address: data.address || "",
      lastAppointment,
      notes: data.notes || "",
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    throw error;
  }
}

export async function createClient(clientData: ClientFormData): Promise<Client> {
  try {
    const { name, email, phone, cep, address, notes } = clientData;
    
    // Garantir que o user_id é definido para o usuário atual
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error('User not authenticated');
    }
    
    console.log("Creating client for user:", user.data.user.id);
    
    const { data, error } = await supabase
      .from('clients')
      .insert({
        name,
        email,
        phone,
        cep,
        address,
        notes,
        user_id: user.data.user.id // Garantir que o cliente seja vinculado ao usuário atual
      })
      .select()
      .single();
    
    if (error) throw error;
    
    console.log("Client created successfully:", data.id);
    
    return {
      id: data.id,
      name: data.name,
      email: data.email || "",
      phone: data.phone || "",
      cep: data.cep || "",
      address: data.address || "",
      notes: data.notes || "",
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    throw error;
  }
}

export async function updateClient(id: string, clientData: ClientFormData): Promise<Client> {
  try {
    const { name, email, phone, cep, address, notes } = clientData;
    
    const { data, error } = await supabase
      .from('clients')
      .update({
        name,
        email,
        phone,
        cep,
        address,
        notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      email: data.email || "",
      phone: data.phone || "",
      cep: data.cep || "",
      address: data.address || "",
      notes: data.notes || "",
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    throw error;
  }
}

export async function deleteClient(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    throw error;
  }
}
