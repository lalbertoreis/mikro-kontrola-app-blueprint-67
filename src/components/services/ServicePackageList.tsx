
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Package, Plus, Trash, Clock, Loader2, Check, X } from "lucide-react";
import { ServicePackage } from "@/types/service";
import ServicePackageDialog from "./ServicePackageDialog";
import { useServicePackages } from "@/hooks/useServicePackages";
import { useServices } from "@/hooks/useServices";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ServicePackageListProps {
  onNewPackage?: () => void;
}

const ServicePackageList: React.FC<ServicePackageListProps> = ({ onNewPackage }) => {
  const [open, setOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string | undefined>(undefined);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<ServicePackage | null>(null);
  
  const { packages, isLoading, deletePackage, isDeleting } = useServicePackages();
  const { services } = useServices();

  const handleNewPackage = () => {
    if (onNewPackage) {
      onNewPackage();
    } else {
      setSelectedPackageId(undefined);
      setOpen(true);
    }
  };

  const handleEditPackage = (id: string) => {
    setSelectedPackageId(id);
    setOpen(true);
  };

  const handleDeleteClick = (pkg: ServicePackage) => {
    setPackageToDelete(pkg);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (packageToDelete) {
      deletePackage(packageToDelete.id, {
        onSuccess: () => {
          setDeleteConfirmOpen(false);
          setPackageToDelete(null);
        }
      });
    }
  };

  const calculateTotalWithoutDiscount = (pkg: ServicePackage): number => {
    // Use the selected services to calculate the total price
    const servicesPrice = pkg.services.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.price || 0);
    }, 0);
    
    // If no services or old calculation method needed
    if (servicesPrice === 0) {
      return pkg.price / (1 - pkg.discount / 100);
    }
    
    return servicesPrice;
  };

  // Format duration as hours and minutes
  const formatDuration = (minutes: number | undefined): string => {
    if (!minutes) return "-";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 
      ? `${hours}h${mins > 0 ? ` ${mins}min` : ''}`
      : `${mins}min`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

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
        <ScrollArea className="h-[500px] w-full">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">Serviços Incluídos</TableHead>
                  <TableHead>Desconto</TableHead>
                  <TableHead>Preço Original</TableHead>
                  <TableHead>Preço com Desconto</TableHead>
                  <TableHead className="hidden md:table-cell">Duração</TableHead>
                  <TableHead className="hidden md:table-cell">Agenda Online</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.length > 0 ? (
                  packages.map((pkg) => {
                    const totalWithoutDiscount = calculateTotalWithoutDiscount(pkg);
                    const serviceCount = pkg.services.length;
                    
                    // Get service names for display
                    const serviceNames = pkg.services
                      .map(id => services.find(s => s.id === id)?.name || "")
                      .filter(name => name !== "")
                      .join(", ");
                    
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
                        <TableCell className="hidden md:table-cell">
                          {serviceCount > 0 ? (
                            <Tooltip>
                              <TooltipTrigger>
                                <span>{serviceCount} serviços</span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-80">
                                <p className="text-sm">{serviceNames}</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-muted-foreground text-xs">Sem serviços</span>
                          )}
                        </TableCell>
                        <TableCell>{pkg.discount.toFixed(2)}%</TableCell>
                        <TableCell>R$ {totalWithoutDiscount.toFixed(2)}</TableCell>
                        <TableCell>R$ {pkg.price.toFixed(2)}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{formatDuration(pkg.totalDuration)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Tooltip>
                            <TooltipTrigger>
                              {pkg.showInOnlineBooking !== false ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <X className="h-4 w-4 text-destructive" />
                              )}
                            </TooltipTrigger>
                            <TooltipContent>
                              {pkg.showInOnlineBooking !== false ? 
                                "Visível na agenda online" : 
                                "Não visível na agenda online"}
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEditPackage(pkg.id)}>
                              Editar
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive hover:text-destructive" 
                              onClick={() => handleDeleteClick(pkg)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Package className="h-8 w-8 mb-2" />
                        <p>Nenhum pacote cadastrado.</p>
                        <Button
                          variant="link" 
                          className="mt-2"
                          onClick={handleNewPackage}
                        >
                          Adicionar pacote
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </Card>

      <ServicePackageDialog
        open={open}
        onOpenChange={setOpen}
        packageId={selectedPackageId}
      />
      
      <AlertDialog 
        open={deleteConfirmOpen} 
        onOpenChange={setDeleteConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Pacote</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o pacote "{packageToDelete?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ServicePackageList;
