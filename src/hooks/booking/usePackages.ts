
import { useMemo } from "react";
import { useServicePackages } from "@/hooks/useServicePackages";

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

    // Don't filter if we're still loading
    if (isPackagesLoading) {
      return [];
    }
    
    if (!packages) {
      console.log("usePackages - No packages data");
      return [];
    }
    
    const filtered = packages.filter((pkg) => {
      const isEligible = pkg.showInOnlineBooking && pkg.isActive;
      console.log(`Package ${pkg.name}: showInOnlineBooking=${pkg.showInOnlineBooking}, isActive=${pkg.isActive}, eligible=${isEligible}`);
      return isEligible;
    });

    console.log(`usePackages - Final result: ${filtered.length} active packages for online booking`);
    return filtered;
  }, [packages, isPackagesLoading]);

  // Only show loading if we have no packages and are actually loading
  const showPackagesLoading = isPackagesLoading && activePackages.length === 0;

  return {
    activePackages,
    isPackagesLoading: showPackagesLoading
  };
}
