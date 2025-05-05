
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import ServicePackageForm from "./ServicePackageForm";
import { ServicePackage } from "@/types/service";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
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
  
  useEffect(() => {
    if (open) setFormDirty(false);
  }, [open]);

  const handleFormChange = () => {
    setFormDirty(true);
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
              {isEditing ? "Editar Pacote" : "Novo Pacote"}
            </DialogTitle>
            <DialogClose asChild onClick={(e) => {
              e.preventDefault();
              handleCloseAttempt();
            }}>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </DialogHeader>
          <ServicePackageForm 
            servicePackage={servicePackage} 
            onFormChange={handleFormChange}
            onClose={handleCloseAttempt}
          />
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

export default ServicePackageDialog;
