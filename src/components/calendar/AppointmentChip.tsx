
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppointmentWithDetails } from "@/types/calendar";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Scissors } from "lucide-react";

interface AppointmentChipProps {
  appointment: AppointmentWithDetails;
  onClick: (event: React.MouseEvent) => void;
  showTime?: boolean;
  compact?: boolean;
}

const AppointmentChip: React.FC<AppointmentChipProps> = ({
  appointment,
  onClick,
  showTime = false,
  compact = true,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800';
      case 'canceled':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
      case 'no-show':
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
      case 'blocked':
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/30 dark:text-slate-300 dark:border-slate-800';
    }
  };

  const statusColor = getStatusColor(appointment.status);
  const startTime = typeof appointment.start === 'string' ? new Date(appointment.start) : appointment.start;
  const endTime = typeof appointment.end === 'string' ? new Date(appointment.end) : appointment.end;

  if (compact) {
    return (
      <div
        className={`
          ${statusColor} 
          rounded-lg border p-2 cursor-pointer 
          hover:shadow-md transition-all duration-200 
          hover:scale-[1.02] active:scale-[0.98]
          text-xs min-h-[60px] w-full
        `}
        onClick={onClick}
      >
        {showTime && (
          <div className="flex items-center gap-1 mb-1 font-medium">
            <Clock className="w-3 h-3" />
            <span>{format(startTime, "HH:mm", { locale: ptBR })}</span>
          </div>
        )}
        
        <div className="font-semibold text-sm truncate mb-1">
          {appointment.service?.name || appointment.title}
        </div>
        
        <div className="flex items-center gap-1 text-xs opacity-80 truncate">
          <User className="w-3 h-3 flex-shrink-0" />
          <span>{appointment.client?.name || 'Cliente'}</span>
        </div>
        
        {appointment.employee?.name && (
          <div className="flex items-center gap-1 text-xs opacity-70 truncate mt-1">
            <Scissors className="w-3 h-3 flex-shrink-0" />
            <span>{appointment.employee.name}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`
        ${statusColor} 
        rounded-lg border p-3 cursor-pointer 
        hover:shadow-lg transition-all duration-200 
        hover:scale-[1.01] active:scale-[0.99]
        w-full
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span className="font-medium">
            {format(startTime, "HH:mm", { locale: ptBR })} - {format(endTime, "HH:mm", { locale: ptBR })}
          </span>
        </div>
        <Badge variant="outline" className="text-xs">
          {appointment.status}
        </Badge>
      </div>
      
      <div className="font-semibold text-lg mb-2">
        {appointment.service?.name || appointment.title}
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4" />
          <span>{appointment.client?.name || 'Cliente'}</span>
        </div>
        
        {appointment.employee?.name && (
          <div className="flex items-center gap-2 text-sm">
            <Scissors className="w-4 h-4" />
            <span>{appointment.employee.name}</span>
          </div>
        )}
      </div>
      
      {appointment.notes && (
        <div className="mt-2 text-sm opacity-80 italic">
          {appointment.notes}
        </div>
      )}
    </div>
  );
};

export default AppointmentChip;
