
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppointmentWithDetails } from "@/types/calendar";
import { Clock, User } from "lucide-react";

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
        return 'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-600';
      case 'confirmed':
        return 'bg-green-500 hover:bg-green-600 text-white border-green-600';
      case 'completed':
        return 'bg-blue-500 hover:bg-blue-600 text-white border-blue-600';
      case 'canceled':
        return 'bg-red-500 hover:bg-red-600 text-white border-red-600';
      case 'no-show':
        return 'bg-orange-500 hover:bg-orange-600 text-white border-orange-600';
      case 'blocked':
        return 'bg-gray-500 hover:bg-gray-600 text-white border-gray-600';
      default:
        return 'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-600';
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
          rounded-lg border cursor-pointer 
          hover:shadow-md transition-all duration-200 
          p-2 text-xs font-medium
          transform hover:scale-[1.02] active:scale-[0.98]
        `}
        onClick={onClick}
      >
        {showTime && (
          <div className="flex items-center gap-1 mb-1 opacity-90">
            <Clock className="w-3 h-3" />
            <span>{format(startTime, "HH:mm", { locale: ptBR })}</span>
          </div>
        )}
        
        <div className="font-semibold text-sm mb-1 leading-tight">
          {appointment.service?.name || appointment.title}
        </div>
        
        <div className="flex items-center gap-1 opacity-90 text-xs">
          <User className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{appointment.client?.name || 'Cliente'}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        ${statusColor} 
        rounded-lg border cursor-pointer 
        hover:shadow-lg transition-all duration-200 
        p-3 font-medium
        transform hover:scale-[1.01] active:scale-[0.99]
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
      </div>
      
      <div className="font-semibold text-lg mb-2">
        {appointment.service?.name || appointment.title}
      </div>
      
      <div className="flex items-center gap-2 text-sm">
        <User className="w-4 h-4" />
        <span>{appointment.client?.name || 'Cliente'}</span>
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
