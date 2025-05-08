
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
  onClick: () => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, colorClass, onClick }) => {
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
      case 'blocked':
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Verificar se é um bloqueio e ajustar classe CSS
  const isBlocked = appointment.status === 'blocked';
  const cardColorClass = isBlocked ? "bg-red-100 border-red-600 text-red-800" : colorClass;

  // Access service, client and employee data safely
  const serviceName = appointment.service?.name ?? "Serviço não especificado";
  const clientName = appointment.client?.name ?? "Cliente não especificado";
  const employeeName = appointment.employee?.name ?? "Profissional não especificado";

  const isCanceled = appointment.status === 'canceled';

  // Handle card click with stopPropagation
  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent time slot click event from triggering
    onClick();
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "p-2 mb-1 rounded text-xs overflow-visible min-h-[60px] cursor-pointer border",
            cardColorClass,
            isCanceled && "opacity-60"
          )}
          onClick={handleCardClick}
        >
          <div className="font-medium line-clamp-2">
            {isBlocked ? "BLOQUEADO" : serviceName}
            {isCanceled && " (CANCELADO)"}
          </div>
          <div className="flex items-center mt-1 justify-between">
            <div className="flex items-center max-w-[60%]">
              <User className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">{isBlocked ? "Indisponível" : clientName}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
              <span>{startTime}</span>
            </div>
          </div>
          <div className={`h-1 w-full mt-1 rounded ${getStatusColor()}`}></div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-[300px]">
        <div className="space-y-1">
          <div className="font-bold">{isBlocked ? "HORÁRIO BLOQUEADO" : serviceName}</div>
          {!isBlocked && <div className="text-sm">Cliente: {clientName}</div>}
          <div className="text-sm">Profissional: {employeeName}</div>
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
