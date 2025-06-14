
import { useMemo } from "react";
import { useServicePackages } from "@/hooks/useServicePackages";
import { ServicePackage } from "@/types/service";

/**
 * Hook to get active service packages with improved loading and persistence
 */
export function usePackages() {
  const { packages, isLoading: isPackagesLoading } = useServicePackages();

  // Filter active packages that should be shown in online booking
  const activePackages = useMemo(() => {
    // Always return cached data if available, don't show loading if we have data
    if (!packages) {
      return [];
    }
    
    return packages.filter((pkg) => {
      return pkg.showInOnlineBooking && pkg.isActive;
    });
  }, [packages]);

  return {
    activePackages,
    isPackagesLoading: isPackagesLoading && activePackages.length === 0
  };
}
