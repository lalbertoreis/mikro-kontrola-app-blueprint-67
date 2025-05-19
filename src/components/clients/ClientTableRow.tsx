
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, CalendarIcon } from "lucide-react";
import { Client } from "@/types/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";

interface ClientTableRowProps {
  client: Client;
  onEdit: (id: string) => void;
  onDelete: (client: { id: string; name: string }) => void;
}

const ClientTableRow: React.FC<ClientTableRowProps> = ({ client, onEdit, onDelete }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Sem agendamentos";
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  return (
    <TableRow key={client.id}>
      <TableCell className="font-medium">{client.name}</TableCell>
      <TableCell>{client.email}</TableCell>
      <TableCell>{client.phone}</TableCell>
      <TableCell>
        {client.lastAppointment ? (
          <div className="flex items-center text-sm">
            <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
            {formatDate(client.lastAppointment)}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">Sem agendamentos</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex space-x-2 justify-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => onEdit(client.id)}>
                <Edit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Editar</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete({ id: client.id, name: client.name })}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </AlertDialogTrigger>
              </AlertDialog>
            </TooltipTrigger>
            <TooltipContent>Excluir</TooltipContent>
          </Tooltip>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ClientTableRow;
