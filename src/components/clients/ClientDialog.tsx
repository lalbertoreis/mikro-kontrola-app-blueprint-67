
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import ClientForm from "./ClientForm";
import { Client } from "@/types/client";
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

interface ClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
}

const ClientDialog: React.FC<ClientDialogProps> = ({
  open,
  onOpenChange,
  client,
}) => {
  const isEditing = Boolean(client?.id);
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
              {isEditing ? "Editar Cliente" : "Novo Cliente"}
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
          <ClientForm 
            defaultValues={client} 
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

export default ClientDialog;
