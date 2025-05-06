
import { useMemo } from "react";
import { useServicePackages } from "@/hooks/useServicePackages";
import { ServicePackage } from "@/types/service";

/**
 * Hook to get active service packages
 */
export function usePackages() {
  const { packages, isLoading: isPackagesLoading } = useServicePackages();

  // Filter active packages
  const activePackages = useMemo(() => 
    packages.filter((pkg) => pkg.showInOnlineBooking && pkg.isActive), 
    [packages]
  );

  return {
    activePackages,
    isPackagesLoading
  };
}
