
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ServiceForm from "./ServiceForm";
import { Service } from "@/types/service";
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
import { useServiceById } from "@/hooks/useServices";

interface ServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId?: string;
  service?: Service | null;
}

const ServiceDialog: React.FC<ServiceDialogProps> = ({
  open,
  onOpenChange,
  serviceId,
  service: externalService,
}) => {
  const { data: fetchedService, isLoading } = useServiceById(serviceId);
  const service = externalService || fetchedService;
  const isEditing = Boolean(service?.id);
  const [formDirty, setFormDirty] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingClose, setPendingClose] = useState(false);
  
  // Log for debugging
  useEffect(() => {
    if (serviceId) {
      console.log("ServiceDialog: Attempting to load service with ID:", serviceId);
    }
    
    if (fetchedService) {
      console.log("ServiceDialog: Service loaded:", fetchedService);
    }
  }, [serviceId, fetchedService]);
  
  useEffect(() => {
    if (open) setFormDirty(false);
  }, [open]);

  const handleFormChange = () => {
    setFormDirty(true);
  };

  const handleFormSuccess = () => {
    setFormDirty(false);
    onOpenChange(false);
  };

  const handleCloseAttempt = () => {
    if (formDirty) {
      setShowUnsavedDialog(true);
      setPendingClose(true);
    } else {
      onOpenChange(false);
    }
  };

  const handleDiscardChanges = () => {
    setShowUnsavedDialog(false);
    setFormDirty(false);
    if (pendingClose) {
      setPendingClose(false);
      onOpenChange(false);
    }
  };

  const handleContinueEditing = () => {
    setShowUnsavedDialog(false);
    setPendingClose(false);
  };
  
  return (
    <>
      <Dialog 
        open={open} 
        onOpenChange={(state) => {
          if (!state && formDirty) {
            setShowUnsavedDialog(true);
            setPendingClose(true);
          } else {
            onOpenChange(state);
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader className="flex items-center justify-between">
            <DialogTitle>
              {isEditing ? "Editar Serviço" : "Novo Serviço"}
            </DialogTitle>
          </DialogHeader>
          {isLoading ? (
            <div className="p-6 text-center">
              <p>Carregando informações do serviço...</p>
            </div>
          ) : (
            <ServiceForm 
              service={service} 
              onFormChange={handleFormChange}
              onClose={handleCloseAttempt}
              onSuccess={handleFormSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Unsaved changes dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alterações não salvas</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem alterações não salvas. Ao sair sem salvar, essas alterações serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleContinueEditing}>Continuar editando</AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscardChanges}>Descartar alterações</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ServiceDialog;
