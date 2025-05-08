
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
  onClick: (e: React.MouseEvent) => void;
}

const AppointmentChip: React.FC<AppointmentChipProps> = ({ appointment, colorClass, onClick }) => {
  // Format start time
  const startTime = format(new Date(appointment.start), "HH:mm");
  
  // Verificar se é um bloqueio e ajustar classe CSS
  const isBlocked = appointment.status === 'blocked';
  const isCanceled = appointment.status === 'canceled';
  
  // Base classes for all appointment chips
  const baseClasses = "text-xs px-2 py-1 rounded-md w-full border cursor-pointer overflow-visible min-h-[24px] shadow-sm hover:shadow-md transition-all duration-200";
  
  // Different styling based on appointment status
  const chipColorClass = isBlocked 
    ? "bg-red-200/80 text-red-800 border-red-300 backdrop-blur-sm" 
    : isCanceled
      ? `${colorClass.replace("bg-", "bg-opacity-50 bg-")} border-gray-300 line-through opacity-70`
      : `${colorClass} border-transparent backdrop-blur-sm`;
  
  // Access service, client and employee data safely
  const serviceName = appointment.service?.name ?? "Serviço não especificado";
  const clientName = appointment.client?.name ?? "Cliente não especificado";
  const employeeName = appointment.employee?.name ?? "Profissional não especificado";
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          className={cn(baseClasses, chipColorClass)}
          onClick={onClick}
        >
          <div className="flex items-center justify-between w-full">
            <span className="truncate max-w-[calc(100%-40px)] whitespace-normal font-medium">
              {isBlocked ? "BLOQUEADO" : serviceName}
              {isCanceled && " (C)"}
            </span>
            <span className="flex-shrink-0 ml-1 font-semibold">{startTime}</span>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-md">
        <div className="space-y-1">
          <div className="font-bold gradient-text">{isBlocked ? "HORÁRIO BLOQUEADO" : serviceName}</div>
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
