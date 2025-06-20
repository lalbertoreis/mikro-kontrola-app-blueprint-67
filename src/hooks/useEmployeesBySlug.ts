
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Employee } from "@/types/employee";

/**
 * Fetch employees for a specific business by slug
 */
async function fetchEmployeesBySlug(slug: string): Promise<Employee[]> {
  // Set slug context for RLS
  if (slug) {
    try {
      await supabase.rpc('set_slug_for_session', { slug });
    } catch (error) {
      console.error('Error setting slug for session:', error);
    }
  }

  const { data, error } = await supabase
    .from('employees')
    .select(`
      id,
      name,
      email,
      phone,
      role,
      user_id,
      created_at,
      updated_at,
      auth_user_id,
      employee_services!inner(service_id)
    `);

  if (error) {
    console.error("Error fetching employees by slug:", error);
    throw error;
  }

  // Transform the data to match Employee interface
  return (data || []).map(emp => ({
    id: emp.id,
    name: emp.name,
    email: emp.email || undefined,
    phone: emp.phone || undefined,
    role: emp.role,
    shifts: [], // Empty shifts array since we're not fetching shifts here
    services: emp.employee_services?.map(es => es.service_id) || [],
    createdAt: emp.created_at,
    updatedAt: emp.updated_at
  }));
}

export function useEmployeesBySlug(slug?: string) {
  return useQuery({
    queryKey: ["employees-by-slug", slug],
    queryFn: () => slug ? fetchEmployeesBySlug(slug) : Promise.resolve([]),
    enabled: !!slug,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
