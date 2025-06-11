
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  
  // Force refetch when modal opens
  const { data: fetchedPackage, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["servicePackage", packageId],
    queryFn: () => packageId ? fetchServicePackageById(packageId) : null,
    enabled: !!packageId && open,
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache the data
  });
  
  const servicePackage = externalPackage || fetchedPackage;
  const isEditing = Boolean(packageId);
  const [formDirty, setFormDirty] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingClose, setPendingClose] = useState(false);
  const [formInitialized, setFormInitialized] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Force data refresh when modal opens with packageId
  useEffect(() => {
    if (open && packageId) {
      console.log('Modal opened with packageId:', packageId);
      setDataLoaded(false);
      // Invalidate and refetch the data
      queryClient.invalidateQueries({ queryKey: ["servicePackage", packageId] });
      refetch();
    }
  }, [open, packageId, queryClient, refetch]);
  
  // Mark data as loaded when we have servicePackage data
  useEffect(() => {
    if (isEditing && servicePackage && !isLoading && !isFetching) {
      console.log('Package data loaded:', servicePackage);
      setDataLoaded(true);
    } else if (!isEditing) {
      // For create mode, mark as loaded immediately
      setDataLoaded(true);
    }
  }, [isEditing, servicePackage, isLoading, isFetching]);
  
  // Reset state when dialog opens/closes or when switching between edit/create
  useEffect(() => {
    if (open) {
      setFormDirty(false);
      setFormInitialized(false);
      setShowUnsavedDialog(false);
      setPendingClose(false);
      if (!isEditing) {
        setDataLoaded(true);
      }
    } else {
      // Reset all state when modal closes
      setDataLoaded(false);
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
    console.log('Form initialized');
    setFormInitialized(true);
  };

  const handleFormSuccess = () => {
    console.log('Package form success - resetting dirty state and closing');
    // Invalidate all package queries to ensure fresh data
    queryClient.invalidateQueries({ queryKey: ["servicePackages"] });
    queryClient.invalidateQueries({ queryKey: ["servicePackage"] });
    setFormDirty(false);
    setDataLoaded(false);
    onOpenChange(false);
  };

  const handleCloseAttempt = () => {
    // Only show unsaved dialog if we're editing AND form is dirty
    if (isEditing && formDirty) {
      setShowUnsavedDialog(true);
      setPendingClose(true);
    } else {
      setDataLoaded(false);
      onOpenChange(false);
    }
  };

  const handleDiscardChanges = () => {
    setShowUnsavedDialog(false);
    setFormDirty(false);
    setDataLoaded(false);
    if (pendingClose) {
      setPendingClose(false);
      onOpenChange(false);
    }
  };

  const handleContinueEditing = () => {
    setShowUnsavedDialog(false);
    setPendingClose(false);
  };

  // Show form when:
  // 1. Create mode (not editing) - show immediately
  // 2. Edit mode with data loaded and not loading
  const shouldShowForm = !isEditing || (dataLoaded && !isLoading && !isFetching);
  
  console.log('Modal state:', {
    isEditing,
    dataLoaded,
    isLoading,
    isFetching,
    shouldShowForm,
    servicePackage: !!servicePackage,
    open
  });
  
  return (
    <>
      <Dialog 
        key={packageId || 'new-package'} // Force new instance for each package
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
