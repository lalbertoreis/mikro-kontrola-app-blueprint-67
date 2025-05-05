
import React from "react";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FixedCostDialogFooterProps {
  isEditing: boolean;
  isLoading: boolean;
  onCancel: () => void;
}

export const FixedCostDialogFooter: React.FC<FixedCostDialogFooterProps> = ({
  isEditing,
  isLoading,
  onCancel,
}) => {
  return (
    <DialogFooter>
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
      >
        Cancelar
      </Button>
      <Button 
        type="submit" 
        disabled={isLoading}
        className="bg-kontrola-600 hover:bg-kontrola-700"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEditing ? "Atualizar" : "Salvar"}
      </Button>
    </DialogFooter>
  );
};
