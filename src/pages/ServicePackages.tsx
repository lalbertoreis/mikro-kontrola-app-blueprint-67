
import React from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useServicePackages } from "@/hooks/useServicePackages";
import ServicePackageList from "@/components/services/ServicePackageList";

const ServicePackages = () => {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pacotes de Serviços</h1>
            <p className="text-muted-foreground">
              Gerencie pacotes de serviços com preços especiais.
            </p>
          </div>
          <Button asChild>
            <Link to="/dashboard/services/new?tab=package">
              <Plus className="mr-2 h-4 w-4" />
              Novo Pacote
            </Link>
          </Button>
        </div>

        <ServicePackageList />
      </div>
    </DashboardLayout>
  );
};

export default ServicePackages;
