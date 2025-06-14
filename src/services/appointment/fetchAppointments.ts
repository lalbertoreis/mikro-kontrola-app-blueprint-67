import { supabase } from "@/integrations/supabase/client";
import { Appointment, AppointmentStatus } from "@/types/calendar";

export async function fetchAppointments(): Promise<Appointment[]> {
  try {
    // Verify if user is authenticated
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.log("No authenticated user, returning empty appointments list");
      return [];
    }
    
    console.log("Fetching appointments for user:", userData.user.id);
    
    // Get appointments filtered by user_id - RLS will enforce this automatically
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        employee:employees(id, name),
        service:services(id, name, duration, price),
        client:clients(id, name, phone, email)
      `)
      .eq('user_id', userData.user.id)
      .order('start_time');
    
    if (error) {
      console.error("Error fetching appointments:", error);
      throw error;
    }
    
    console.log(`Fetched ${data?.length || 0} appointments for user ${userData.user.id}`);
    
    // Corrigir o mapeamento do employeeId:
    return data.map(item => ({
      id: item.id,
      title: item.service?.name || 'BLOQUEADO',
      start: new Date(item.start_time),
      end: new Date(item.end_time),
      employeeId: item.employee_id, // Corrigido para sempre vir do campo employee_id
      serviceId: item.service_id,
      clientId: item.client_id,
      status: item.status as AppointmentStatus,
      notes: item.notes || undefined,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      // Add the joined data with proper structure to match our types
      employee: item.employee ? {
        id: item.employee.id,
        name: item.employee.name,
        role: "", // Adding missing properties from Employee type
        shifts: [], 
        services: [],
        createdAt: "",
        updatedAt: ""
      } : undefined,
      service: item.service ? {
        id: item.service.id,
        name: item.service.name,
        price: item.service.price || 0,
        duration: item.service.duration || 0,
        multipleAttendees: false,
        isActive: true,
        createdAt: "",
        updatedAt: ""
      } : undefined,
      client: item.client ? {
        id: item.client.id,
        name: item.client.name,
        email: item.client.email || "",
        phone: item.client.phone || "",
        cep: "",
        address: "",
        createdAt: "",
        updatedAt: ""
      } : undefined,
    }));
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
}

export async function fetchAppointmentById(id: string): Promise<Appointment | null> {
  try {
    // Verify if user is authenticated
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.log("No authenticated user, cannot fetch appointment");
      return null;
    }

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        employee:employee_id(id, name),
        service:service_id(id, name, duration, price),
        client:client_id(id, name, phone, email)
      `)
      .eq('id', id)
      .eq('user_id', userData.user.id)
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    return {
      id: data.id,
      title: data.service?.name || 'BLOQUEADO',
      start: new Date(data.start_time),
      end: new Date(data.end_time),
      employeeId: data.employee_id, // Corrigido para sempre vir do campo employee_id
      serviceId: data.service_id,
      clientId: data.client_id,
      status: data.status as AppointmentStatus,
      notes: data.notes || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Error fetching appointment:', error);
    throw error;
  }
}
