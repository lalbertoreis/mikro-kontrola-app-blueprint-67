
import React from "react";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Service } from "@/types/service";
import ServiceTableRow from "./ServiceTableRow";

interface ServiceListTableProps {
  services: Service[];
  onNewService: () => void;
  onEditService: (service: Service) => void;
  onDeleteService: (service: Service) => void;
}

const ServiceListTable: React.FC<ServiceListTableProps> = ({
  services,
  onNewService,
  onEditService,
  onDeleteService
}) => {
  return (
    <Card>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Nome</TableHead>
              <TableHead className="hidden md:table-cell">Duração</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead className="hidden md:table-cell">Múltiplos</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.length > 0 ? (
              services.map((service) => (
                <ServiceTableRow
                  key={service.id}
                  service={service}
                  onEdit={onEditService}
                  onDelete={onDeleteService}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <p className="mb-2">Nenhum serviço cadastrado.</p>
                    <Button
                      variant="link" 
                      onClick={onNewService}
                    >
                      Adicionar serviço
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default ServiceListTable;
