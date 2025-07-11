
import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { Service } from "@/types/service";
import ServiceDialog from "./ServiceDialog";
import ServiceListHeader from "./ServiceListHeader";
import ServiceListTable from "./ServiceListTable";
import ServiceDeleteDialog from "./ServiceDeleteDialog";
import { useServices } from "@/hooks/useServices";
import { toast } from "sonner";

interface ServiceListProps {
  onNewService?: () => void;
}

const ServiceList: React.FC<ServiceListProps> = ({ onNewService }) => {
  const [open, setOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  
  const { services, isLoading, deleteService, isDeleting } = useServices();

  const handleNewService = () => {
    if (onNewService) {
      onNewService();
    } else {
      setSelectedService(null);
      setOpen(true);
    }
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setOpen(true);
  };

  const handleDeleteClick = (service: Service) => {
    setServiceToDelete(service);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (serviceToDelete) {
      deleteService(serviceToDelete.id, {
        onSuccess: () => {
          setDeleteConfirmOpen(false);
          setServiceToDelete(null);
          toast.success("Serviço excluído com sucesso");
        }
      });
    }
  };

  // Filter out services with price = 0
  const filteredServices = services.filter(service => service.price > 0);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <ServiceListHeader onNewService={handleNewService} />
      
      <ServiceListTable
        services={filteredServices}
        onNewService={handleNewService}
        onEditService={handleEditService}
        onDeleteService={handleDeleteClick}
      />
      
      <ServiceDialog
        open={open}
        onOpenChange={setOpen}
        service={selectedService}
      />
      
      <ServiceDeleteDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        service={serviceToDelete}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default ServiceList;
