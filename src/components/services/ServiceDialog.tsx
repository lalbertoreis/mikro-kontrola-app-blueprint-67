
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
    console.log('Service form success - calling onServiceCreated');
    // Primeiro notificar que o serviço foi criado/atualizado
    if (onServiceCreated) {
      onServiceCreated();
    }
    // Depois fechar o dialog
    onOpenChange(false);
  };

  const handleCancel = () => {
    console.log('Service form cancelled - closing dialog');
    onOpenChange(false);
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
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ServiceDialog;
