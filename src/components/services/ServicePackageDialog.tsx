
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ServicePackageForm from "./ServicePackageForm";
import { ServicePackage } from "@/types/service";
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
import { useQuery } from "@tanstack/react-query";
import { fetchServicePackageById } from "@/services/packageService";

interface ServicePackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageId?: string;
  servicePackage?: ServicePackage | null;
}

const ServicePackageDialog: React.FC<ServicePackageDialogProps> = ({
  open,
  onOpenChange,
  packageId,
  servicePackage: externalPackage,
}) => {
  const { data: fetchedPackage } = useQuery({
    queryKey: ["servicePackage", packageId],
    queryFn: () => packageId ? fetchServicePackageById(packageId) : null,
    enabled: !!packageId,
  });
  
  const servicePackage = externalPackage || fetchedPackage;
  const isEditing = Boolean(servicePackage?.id);
  const [formDirty, setFormDirty] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingClose, setPendingClose] = useState(false);
  const [formInitialized, setFormInitialized] = useState(false);
  
  // Reset state when dialog opens/closes or when switching between edit/create
  useEffect(() => {
    if (open) {
      setFormDirty(false);
      setFormInitialized(false);
      setShowUnsavedDialog(false);
      setPendingClose(false);
    }
  }, [open, isEditing]);

  const handleFormChange = () => {
    // Only mark as dirty if:
    // 1. We're editing an existing package, AND
    // 2. The form has been properly initialized
    if (isEditing && formInitialized) {
      setFormDirty(true);
    }
  };

  const handleFormInitialized = () => {
    setFormInitialized(true);
  };

  const handleCloseAttempt = () => {
    // Only show unsaved dialog if we're editing AND form is dirty
    if (isEditing && formDirty) {
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
          if (!state) {
            handleCloseAttempt();
          } else {
            onOpenChange(state);
          }
        }}
      >
        <DialogContent className="sm:max-w-[850px] h-auto max-h-[92vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Pacote" : "Novo Pacote"}
            </DialogTitle>
          </DialogHeader>
          <ServicePackageForm 
            servicePackage={servicePackage} 
            onFormChange={handleFormChange}
            onFormInitialized={handleFormInitialized}
            onClose={handleCloseAttempt}
          />
        </DialogContent>
      </Dialog>

      {/* Unsaved changes dialog - only for editing existing packages */}
      {isEditing && (
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
      )}
    </>
  );
};

export default ServicePackageDialog;
