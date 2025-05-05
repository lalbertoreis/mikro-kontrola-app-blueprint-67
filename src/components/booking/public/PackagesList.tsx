
import React from "react";
import { ServicePackage } from "@/types/service";
import ServiceCard from "@/components/booking/ServiceCard";

interface PackagesListProps {
  packages: ServicePackage[];
  onPackageClick: (pkg: ServicePackage) => void;
}

const PackagesList: React.FC<PackagesListProps> = ({ packages, onPackageClick }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Pacotes</h2>
      {packages.map((pkg) => (
        <ServiceCard 
          key={pkg.id} 
          item={pkg} 
          isPackage={true} 
          onClick={() => onPackageClick(pkg)} 
        />
      ))}
    </div>
  );
};

export default PackagesList;
