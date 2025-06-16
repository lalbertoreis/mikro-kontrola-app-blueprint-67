
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ServicePackage } from "@/types/service";

/**
 * Fetch service packages for a specific business by slug using the new database function
 */
async function fetchServicePackagesBySlug(slug: string): Promise<ServicePackage[]> {
  console.log("Fetching service packages by slug:", slug);
  
  const { data, error } = await supabase
    .rpc('get_packages_by_slug', { slug_param: slug });

  if (error) {
    console.error("Error fetching service packages by slug:", error);
    throw error;
  }

  console.log(`Found ${data?.length || 0} service packages for business slug: ${slug}`);

  return (data || []).map(item => ({
    id: item.id,
    name: item.name,
    description: item.description || undefined,
    services: Array.isArray(item.services) ? item.services.map(String) : [],
    price: Number(item.price),
    discount: Number(item.discount),
    isActive: item.is_active,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    showInOnlineBooking: item.show_in_online_booking,
    totalDuration: item.total_duration || undefined
  }));
}

export function useServicePackagesBySlug(slug?: string) {
  return useQuery({
    queryKey: ["service-packages-by-slug", slug],
    queryFn: () => slug ? fetchServicePackagesBySlug(slug) : Promise.resolve([]),
    enabled: !!slug,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
