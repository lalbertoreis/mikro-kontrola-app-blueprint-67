
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
}

const AppointmentChip: React.FC<AppointmentChipProps> = ({ appointment, colorClass }) => {
  // Format start time
  const startTime = format(new Date(appointment.start), "HH:mm");
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn("text-xs px-2 py-1 rounded-sm truncate cursor-pointer", colorClass)}>
          {startTime} - {appointment.service.name}
        </div>
      </TooltipTrigger>
      <TooltipContent side="right">
        <div className="space-y-1">
          <div className="font-bold">{appointment.service.name}</div>
          <div className="text-sm">Cliente: {appointment.client.name}</div>
          <div className="text-sm">Horário: {startTime}</div>
          <div className="text-sm">Profissional: {appointment.employee.name}</div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default AppointmentChip;
