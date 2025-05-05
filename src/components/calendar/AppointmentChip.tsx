
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
  
  // Safely access service name, client name, and employee name
  const serviceName = appointment.service?.name || "Serviço não especificado";
  const clientName = appointment.client?.name || "Cliente não especificado";
  const employeeName = appointment.employee?.name || "Profissional não especificado";
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          className={cn("text-xs px-2 py-1 rounded-sm truncate cursor-pointer", colorClass)}
          onClick={onClick}
        >
          {startTime} - {serviceName}
        </div>
      </TooltipTrigger>
      <TooltipContent side="right">
        <div className="space-y-1">
          <div className="font-bold">{serviceName}</div>
          <div className="text-sm">Cliente: {clientName}</div>
          <div className="text-sm">Horário: {startTime}</div>
          <div className="text-sm">Profissional: {employeeName}</div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default AppointmentChip;
