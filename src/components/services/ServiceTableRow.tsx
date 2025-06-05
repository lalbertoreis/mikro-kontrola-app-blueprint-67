
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Clock, Edit, Trash, Users, CheckCircle, XCircle } from "lucide-react";
import { Service } from "@/types/service";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ServiceTableRowProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
}

const ServiceTableRow: React.FC<ServiceTableRowProps> = ({ service, onEdit, onDelete }) => {
  return (
    <TableRow>
      <TableCell className="font-medium">
        <div>
          <div>{service.name}</div>
          <div className="text-xs text-muted-foreground">{service.description}</div>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="flex items-center space-x-1">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{service.duration} min</span>
        </div>
      </TableCell>
      <TableCell>R$ {service.price.toFixed(2)}</TableCell>
      <TableCell className="hidden md:table-cell">
        {service.multipleAttendees ? (
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>Máx: {service.maxAttendees || 1}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {service.isActive ? (
          <div className="flex items-center space-x-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Ativo</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1">
            <XCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm">Inativo</span>
          </div>
        )}
      </TableCell>
      <TableCell>
        <div className="flex space-x-1 justify-end">
          <Button variant="ghost" size="icon" onClick={() => onEdit(service)}>
            <Tooltip>
              <TooltipTrigger>
                <Edit className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>Editar</TooltipContent>
            </Tooltip>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onDelete(service)}
          >
            <Tooltip>
              <TooltipTrigger>
                <Trash className="h-4 w-4 text-destructive" />
              </TooltipTrigger>
              <TooltipContent>Excluir</TooltipContent>
            </Tooltip>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ServiceTableRow;
