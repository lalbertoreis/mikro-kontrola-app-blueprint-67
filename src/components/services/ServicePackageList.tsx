
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Package, Plus } from "lucide-react";
import { ServicePackage } from "@/types/service";
import ServicePackageDialog from "./ServicePackageDialog";

// Dados de exemplo para pacotes
const mockPackages: ServicePackage[] = [
  {
    id: "1",
    name: "Pacote Beleza Completa",
    description: "Inclui corte, manicure e pedicure",
    services: ["1", "2", "3"],
    price: 120.00,
    discount: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Pacote Dia da Noiva",
    description: "Tratamento completo para noivas",
    services: ["4", "5", "2", "3"],
    price: 300.00,
    discount: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const ServicePackageList = () => {
  const [open, setOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string | undefined>(undefined);
  const [packages] = useState<ServicePackage[]>(mockPackages);

  const handleNewPackage = () => {
    setSelectedPackageId(undefined);
    setOpen(true);
  };

  const handleEditPackage = (id: string) => {
    setSelectedPackageId(id);
    setOpen(true);
  };

  const calculateTotalWithoutDiscount = (pkg: ServicePackage): number => {
    const total = pkg.price / (1 - pkg.discount / 100);
    return Number(total.toFixed(2));
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Pacotes de Serviços</h2>
        <Button onClick={handleNewPackage}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Pacote
        </Button>
      </div>

      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">Serviços Incluídos</TableHead>
                <TableHead>Desconto</TableHead>
                <TableHead>Preço Original</TableHead>
                <TableHead>Preço com Desconto</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.length > 0 ? (
                packages.map((pkg) => {
                  const totalWithoutDiscount = calculateTotalWithoutDiscount(pkg);
                  return (
                    <TableRow key={pkg.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          <div>
                            <div>{pkg.name}</div>
                            <div className="text-xs text-muted-foreground">{pkg.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{pkg.services.length} serviços</TableCell>
                      <TableCell>{pkg.discount}%</TableCell>
                      <TableCell>R$ {totalWithoutDiscount.toFixed(2)}</TableCell>
                      <TableCell>R$ {pkg.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleEditPackage(pkg.id)}>
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhum pacote cadastrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <ServicePackageDialog
        open={open}
        onOpenChange={setOpen}
        packageId={selectedPackageId}
      />
    </>
  );
};

export default ServicePackageList;
