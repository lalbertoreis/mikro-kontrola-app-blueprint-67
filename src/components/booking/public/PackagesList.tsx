
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
        <div key={pkg.id} className="mb-4">
          <div 
            className="p-4 border rounded-lg hover:shadow-md cursor-pointer transition-all"
            onClick={() => onPackageClick(pkg)}
          >
            <h3 className="font-semibold text-lg">{pkg.name}</h3>
            {pkg.description && <p className="text-gray-600 text-sm">{pkg.description}</p>}
            <div className="mt-2 flex justify-between items-center">
              <p className="font-medium">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pkg.price)}
              </p>
              <span className="text-sm text-gray-500">
                {pkg.totalDuration ? `${pkg.totalDuration} min` : ''}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PackagesList;
