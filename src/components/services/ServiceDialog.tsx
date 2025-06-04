
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ServiceForm from "./ServiceForm";
import type { Service } from "@/types/service";

interface ServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: Service | null;
  onServiceCreated?: () => void;
}

const ServiceDialog: React.FC<ServiceDialogProps> = ({ 
  open, 
  onOpenChange, 
  service = null,
  onServiceCreated 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  const handleSuccess = () => {
    console.log('Service form success - calling onServiceCreated and closing dialog');
    // Primeiro notificar que o serviço foi criado
    onServiceCreated?.();
    // Depois fechar o dialog
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {service ? "Editar Serviço" : "Novo Serviço"}
          </DialogTitle>
        </DialogHeader>
        <ServiceForm 
          service={service}
          onSuccess={handleSuccess}
          onSubmittingChange={setIsSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ServiceDialog;
