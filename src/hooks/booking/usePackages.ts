
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
    console.log("usePackages - Processing packages:", {
      packagesCount: packages?.length || 0,
      isPackagesLoading
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
    
    const filtered = packages.filter((pkg: ServicePackage) => {
      const isEligible = pkg.showInOnlineBooking && pkg.isActive;
      console.log(`Package ${pkg.name}: showInOnlineBooking=${pkg.showInOnlineBooking}, isActive=${pkg.isActive}, eligible=${isEligible}`);
      return isEligible;
    });

    console.log(`usePackages - Final result: ${filtered.length} active packages for online booking`);
    return filtered;
  }, [packages, isPackagesLoading]);

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
