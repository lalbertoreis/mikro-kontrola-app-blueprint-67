
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppointmentWithDetails } from "@/types/calendar";
import { User, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AppointmentCardProps {
  appointment: AppointmentWithDetails;
  colorClass: string;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, colorClass }) => {
  // Format start and end time
  const startTime = format(new Date(appointment.start), "HH:mm", { locale: ptBR });
  const endTime = format(new Date(appointment.end), "HH:mm", { locale: ptBR });
  
  // Status colors
  const getStatusColor = () => {
    switch (appointment.status) {
      case 'confirmed':
        return "bg-green-500";
      case 'canceled':
        return "bg-red-500";
      case 'no-show':
        return "bg-amber-500";
      case 'completed':
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "p-2 mb-1 rounded text-xs overflow-hidden cursor-pointer",
            colorClass
          )}
        >
          <div className="font-medium truncate">{appointment.service.name}</div>
          <div className="flex items-center mt-1 justify-between">
            <div className="flex items-center">
              <User className="h-3 w-3 mr-1" />
              <span className="truncate">{appointment.client.name}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>{startTime}</span>
            </div>
          </div>
          <div className={`h-1 w-full mt-1 rounded ${getStatusColor()}`}></div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="right">
        <div className="space-y-1">
          <div className="font-bold">{appointment.service.name}</div>
          <div className="text-sm">Cliente: {appointment.client.name}</div>
          <div className="text-sm">Profissional: {appointment.employee.name}</div>
          <div className="text-sm">Horário: {startTime} - {endTime}</div>
          <div className="text-sm capitalize">Status: {appointment.status.replace('-', ' ')}</div>
          {appointment.notes && (
            <div className="text-sm">Observações: {appointment.notes}</div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default AppointmentCard;
