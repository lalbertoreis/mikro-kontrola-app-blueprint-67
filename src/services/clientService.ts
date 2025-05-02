
import { supabase } from "@/integrations/supabase/client";
import { Client, ClientFormData } from "@/types/client";

export async function fetchClients(): Promise<Client[]> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      email: item.email || "",
      phone: item.phone || "",
      notes: item.notes || "",
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    throw error;
  }
}

export async function fetchClientById(id: string): Promise<Client | null> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    return {
      id: data.id,
      name: data.name,
      email: data.email || "",
      phone: data.phone || "",
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
    const { name, email, phone, notes } = clientData;
    
    const { data, error } = await supabase
      .from('clients')
      .insert({
        name,
        email,
        phone,
        notes,
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      email: data.email || "",
      phone: data.phone || "",
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
    const { name, email, phone, notes } = clientData;
    
    const { data, error } = await supabase
      .from('clients')
      .update({
        name,
        email,
        phone,
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
