
import { useMemo } from "react";
import { useServicePackages } from "@/hooks/useServicePackages";
import { ServicePackage } from "@/types/service";

/**
 * Hook to get active service packages with improved loading
 */
export function usePackages() {
  const { packages, isLoading: isPackagesLoading } = useServicePackages();

  // Filter active packages that should be shown in online booking
  const activePackages = useMemo(() => {
    if (isPackagesLoading || !packages) {
      return [];
    }
    
    return packages.filter((pkg) => {
      return pkg.showInOnlineBooking && pkg.isActive;
    });
  }, [packages, isPackagesLoading]);

  return {
    activePackages,
    isPackagesLoading
  };
}
