
import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import HolidayForm from "./HolidayForm";
import { Holiday } from "@/types/holiday";

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
  
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Feriado" : "Adicionar Feriado"}
          </DialogTitle>
        </DialogHeader>
        <HolidayForm defaultValues={holiday} onCancel={handleCancel} />
      </DialogContent>
    </Dialog>
  );
};
