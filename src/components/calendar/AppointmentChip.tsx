
import React from "react";
import { format } from "date-fns";
import { AppointmentWithDetails } from "@/types/calendar";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AppointmentChipProps {
  appointment: AppointmentWithDetails;
  colorClass: string;
  onClick: () => void;
}

const AppointmentChip: React.FC<AppointmentChipProps> = ({ appointment, colorClass, onClick }) => {
  // Format start time
  const startTime = format(new Date(appointment.start), "HH:mm");
  
  // Verificar se é um bloqueio e ajustar classe CSS
  const isBlocked = appointment.status === 'blocked';
  const isCanceled = appointment.status === 'canceled';
  const chipColorClass = isBlocked 
    ? "bg-red-200 text-red-800 border-red-400" 
    : isCanceled
      ? `${colorClass.replace("bg-", "bg-opacity-50 bg-")} border-gray-300`
      : `${colorClass} border-transparent`;
  
  // Access service, client and employee data safely
  const serviceName = appointment.service?.name ?? "Serviço não especificado";
  const clientName = appointment.client?.name ?? "Cliente não especificado";
  const employeeName = appointment.employee?.name ?? "Profissional não especificado";
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          className={cn("text-xs px-2 py-1 rounded-sm w-full border cursor-pointer", chipColorClass)}
          onClick={onClick}
        >
          <div className="flex items-center justify-between w-full">
            <span className="truncate max-w-[calc(100%-40px)]">
              {isBlocked ? "BLOQUEADO" : serviceName}
              {isCanceled && " (C)"}
            </span>
            <span className="flex-shrink-0">{startTime}</span>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="right">
        <div className="space-y-1">
          <div className="font-bold">{isBlocked ? "HORÁRIO BLOQUEADO" : serviceName}</div>
          {isCanceled && <div className="text-sm font-semibold text-red-500">CANCELADO</div>}
          {!isBlocked && <div className="text-sm">Cliente: {clientName}</div>}
          <div className="text-sm">Horário: {startTime}</div>
          <div className="text-sm">Profissional: {employeeName}</div>
          {appointment.notes && (
            <div className="text-sm">Motivo: {appointment.notes}</div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default AppointmentChip;
