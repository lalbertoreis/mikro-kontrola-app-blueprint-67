
import React from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface HolidayFormActionsProps {
  onCancel: () => void;
  isSubmitting: boolean;
  isEditing: boolean;
}

export const HolidayFormActions: React.FC<HolidayFormActionsProps> = ({
  onCancel,
  isSubmitting,
  isEditing,
}) => {
  return (
    <DialogFooter>
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="bg-kontrola-600 hover:bg-kontrola-700"
      >
        {isEditing ? "Atualizar" : "Criar"}
      </Button>
    </DialogFooter>
  );
};
