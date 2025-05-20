
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ClientForm from "./ClientForm";
import { Client } from "@/types/client";
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
import { useClientById } from "@/hooks/useClients";

interface ClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId?: string;
  client?: Client | null;
}

const ClientDialog: React.FC<ClientDialogProps> = ({
  open,
  onOpenChange,
  clientId,
  client: externalClient,
}) => {
  const { data: fetchedClient, isLoading } = useClientById(clientId);
  const client = externalClient || fetchedClient;
  const isEditing = Boolean(client?.id);
  const [formDirty, setFormDirty] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingClose, setPendingClose] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (open) {
      setFormDirty(false);
      setIsSubmitting(false);
    }
  }, [open]);

  const handleFormChange = () => {
    if (!isSubmitting) {
      setFormDirty(true);
    }
  };

  const handleCloseAttempt = () => {
    if (formDirty && !isSubmitting) {
      setShowUnsavedDialog(true);
      setPendingClose(true);
    } else {
      onOpenChange(false);
    }
  };

  const handleFormSubmit = () => {
    setIsSubmitting(true);
    setFormDirty(false);
    // Don't close the dialog immediately - it will be closed after successful submission by the form component
  };

  const handleFormSubmitSuccess = () => {
    setFormDirty(false);
    setIsSubmitting(false);
    onOpenChange(false);
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
          if (!state && formDirty && !isSubmitting) {
            setShowUnsavedDialog(true);
            setPendingClose(true);
          } else if (!state) {
            onOpenChange(false);
          } else {
            onOpenChange(true);
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader className="flex items-center justify-between">
            <DialogTitle>
              {isEditing ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
          </DialogHeader>
          <ClientForm 
            client={client} 
            onFormChange={handleFormChange}
            onClose={handleCloseAttempt}
            onSubmit={handleFormSubmit}
            onSubmitSuccess={handleFormSubmitSuccess}
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

export default ClientDialog;
