
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Holiday } from "@/types/holiday";
import { useHolidays } from "@/hooks/useHolidays";
import { SimplifiedHolidayForm } from "./SimplifiedHolidayForm";

interface HolidayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holiday?: Holiday | null;
}

export const HolidayDialog: React.FC<HolidayDialogProps> = ({
  open,
  onOpenChange,
  holiday,
}) => {
  const isEditing = Boolean(holiday?.id);
  const [formDirty, setFormDirty] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingClose, setPendingClose] = useState(false);
  const [userInitiatedClose, setUserInitiatedClose] = useState(false);
  
  useEffect(() => {
    if (open) {
      setFormDirty(false);
      setUserInitiatedClose(false);
    }
  }, [open]);

  const handleFormChange = () => {
    setFormDirty(true);
  };

  const handleCloseAttempt = () => {
    setUserInitiatedClose(true);
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
  
  const handleFormSuccess = () => {
    setFormDirty(false); // Reset the form dirty state after successful submission
    onOpenChange(false); // Close the dialog after successful save
  };
  
  return (
    <>
      <Dialog 
        open={open} 
        onOpenChange={(state) => {
          if (!state && formDirty && userInitiatedClose) {
            // Only show the dialog if the user initiated the close
            // and there are unsaved changes
            setShowUnsavedDialog(true);
            setPendingClose(true);
          } else if (!state) {
            // Just close the dialog if there are no changes or
            // it's being programmatically closed
            onOpenChange(state);
          } else {
            // Opening the dialog
            onOpenChange(state);
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px] w-[92vw]">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-lg">
              {isEditing ? "Editar feriado" : "Novo feriado"}
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 rounded-full"
              onClick={handleCloseAttempt}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <SimplifiedHolidayForm 
            defaultValues={holiday} 
            onCancel={handleCloseAttempt}
            onFormChange={handleFormChange}
            onSuccess={handleFormSuccess} // Add this prop to handle successful form submission
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
