
import React from "react";
import { Loader2 } from "lucide-react";
import {
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface ClientDeleteDialogProps {
  clientToDelete: { id: string; name: string } | null;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const ClientDeleteDialog: React.FC<ClientDeleteDialogProps> = ({
  clientToDelete,
  isDeleting,
  onCancel,
  onConfirm
}) => {
  if (!clientToDelete) return null;

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
        <AlertDialogDescription>
          Tem certeza que deseja excluir o cliente "{clientToDelete.name}"? Esta ação não pode ser desfeita.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onCancel}>
          Cancelar
        </AlertDialogCancel>
        <AlertDialogAction 
          onClick={onConfirm}
          className="bg-red-600 hover:bg-red-700"
          disabled={isDeleting}
        >
          {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Excluir
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
};

export default ClientDeleteDialog;
