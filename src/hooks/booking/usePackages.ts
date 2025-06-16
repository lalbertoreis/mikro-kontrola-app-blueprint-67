
import { useMemo } from "react";
import { useServicePackagesBySlug } from "@/hooks/useServicePackagesBySlug";
import { ServicePackage } from "@/types/service";

/**
 * Hook to get active service packages for a specific business slug
 */
export function usePackages(slug?: string) {
  const { data: packages = [], isLoading: isPackagesLoading } = useServicePackagesBySlug(slug);

  // Since we're now using the database function that already filters for active packages
  // with available employees, we can use the data directly
  const activePackages = useMemo(() => {
    console.log("usePackages - Processing packages:", {
      packagesCount: packages?.length || 0,
      isPackagesLoading,
      slug
    });

    // Return empty array while loading to prevent flash of empty state
    if (isPackagesLoading) {
      console.log("usePackages - Still loading packages, returning empty array");
      return [];
    }
    
    if (!packages || packages.length === 0) {
      console.log("usePackages - No packages data available");
      return [];
    }
    
    // The database function already filters for:
    // - showInOnlineBooking = true
    // - isActive = true
    // - All services in package have available employees
    // So we can use the data directly
    console.log(`usePackages - Final result: ${packages.length} active packages for online booking`);
    return packages;
  }, [packages, isPackagesLoading, slug]);

  console.log("usePackages - Hook result:", {
    packagesCount: activePackages.length,
    isLoading: isPackagesLoading,
    packagesData: packages?.length || 0
  });

  return {
    activePackages,
    isPackagesLoading
  };
}
