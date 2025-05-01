
import React from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";

// Dados de exemplo para pacotes
const mockPackages = [
  {
    id: "1",
    name: "Pacote Beleza Completa",
    description: "Inclui corte, manicure e pedicure",
    services: ["Corte de Cabelo", "Manicure", "Pedicure"],
    price: 120.00,
    discount: 15,
    totalWithoutDiscount: 140.00,
  },
  {
    id: "2",
    name: "Pacote Dia da Noiva",
    description: "Tratamento completo para noivas",
    services: ["Penteado", "Maquiagem", "Manicure", "Pedicure"],
    price: 300.00,
    discount: 10,
    totalWithoutDiscount: 330.00,
  }
];

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

        <Card>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Serviços Incluídos</TableHead>
                  <TableHead>Desconto</TableHead>
                  <TableHead>Preço Original</TableHead>
                  <TableHead>Preço com Desconto</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPackages.length > 0 ? (
                  mockPackages.map((pkg) => (
                    <TableRow key={pkg.id}>
                      <TableCell className="font-medium">
                        <div>{pkg.name}</div>
                        <div className="text-xs text-muted-foreground">{pkg.description}</div>
                      </TableCell>
                      <TableCell>{pkg.services.join(", ")}</TableCell>
                      <TableCell>{pkg.discount}%</TableCell>
                      <TableCell>R$ {pkg.totalWithoutDiscount.toFixed(2)}</TableCell>
                      <TableCell>R$ {pkg.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/dashboard/services/package/${pkg.id}`}>
                            Editar
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
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
      </div>
    </DashboardLayout>
  );
};

export default ServicePackages;
