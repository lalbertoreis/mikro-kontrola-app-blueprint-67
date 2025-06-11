
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
  const { data: fetchedPackage, isLoading } = useQuery({
    queryKey: ["servicePackage", packageId],
    queryFn: () => packageId ? fetchServicePackageById(packageId) : null,
    enabled: !!packageId && open,
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
    // Only mark as dirty if we're editing an existing package AND form is initialized
    if (isEditing && formInitialized) {
      setFormDirty(true);
    }
  };

  const handleFormInitialized = () => {
    setFormInitialized(true);
  };

  const handleFormSuccess = () => {
    console.log('Package form success - resetting dirty state and closing');
    setFormDirty(false);
    onOpenChange(false);
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

  // Don't render the form until data is loaded for editing mode
  const shouldShowForm = !isEditing || !isLoading;
  
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
          
          {shouldShowForm ? (
            <ServicePackageForm 
              servicePackage={servicePackage} 
              onFormChange={handleFormChange}
              onFormInitialized={handleFormInitialized}
              onClose={handleCloseAttempt}
              onSuccess={handleFormSuccess}
            />
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Carregando dados do pacote...</p>
              </div>
            </div>
          )}
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
