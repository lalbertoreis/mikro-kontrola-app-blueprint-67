
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export interface BookingAppointment {
  id: string;
  serviceName: string;
  employeeName: string;
  date: string;
  time: string;
  status: string;
  businessSlug?: string;
}

interface MyAppointmentsDialogProps {
  open: boolean;
  onClose: () => void;
  appointments: BookingAppointment[];
  onCancelAppointment: (id: string, businessSlug?: string) => void;
  isLoading?: boolean;
  themeColor?: string; // Add theme color prop
}

const MyAppointmentsDialog: React.FC<MyAppointmentsDialogProps> = ({
  open,
  onClose,
  appointments,
  onCancelAppointment,
  isLoading = false,
  themeColor = "#9b87f5" // Default color
}) => {
  // Group appointments by date
  const appointmentsByDate = appointments.reduce((acc, appointment) => {
    if (!acc[appointment.date]) {
      acc[appointment.date] = [];
    }
    acc[appointment.date].push(appointment);
    return acc;
  }, {} as Record<string, BookingAppointment[]>);

  // Sort dates
  const sortedDates = Object.keys(appointmentsByDate).sort((a, b) => {
    const dateA = new Date(a.split('/').reverse().join('-'));
    const dateB = new Date(b.split('/').reverse().join('-'));
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle style={{ color: themeColor }}>Meus Agendamentos</DialogTitle>
          <DialogDescription>
            Veja seus agendamentos e gerencie-os.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">Carregando seus agendamentos...</p>
          </div>
        ) : appointments.length > 0 ? (
          <div className="space-y-6">
            {sortedDates.map(date => (
              <div key={date} className="space-y-4">
                <div className="flex items-center gap-2 font-semibold">
                  <Calendar className="h-4 w-4" />
                  <h3>{date}</h3>
                </div>
                
                {appointmentsByDate[date].map((appointment) => (
                  <div key={appointment.id} className="rounded-lg border p-4 space-y-3">
                    <div>
                      <p className="font-semibold">{appointment.serviceName}</p>
                      <div className="flex items-center text-gray-500 space-x-2 mt-1">
                        <User className="h-4 w-4" />
                        <span className="text-sm">{appointment.employeeName}</span>
                      </div>
                      <div className="flex items-center text-gray-500 space-x-2 mt-1">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{appointment.time}</span>
                      </div>
                      
                      {appointment.businessSlug && (
                        <div className="flex items-center text-gray-500 space-x-2 mt-1">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{appointment.businessSlug}</span>
                        </div>
                      )}
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-400 capitalize">
                        Status: {appointment.status === 'scheduled' ? 'Agendado' : appointment.status}
                      </p>
                      {appointment.status === 'scheduled' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onCancelAppointment(appointment.id, appointment.businessSlug)}
                          style={{ backgroundColor: themeColor }}
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500">Nenhum agendamento encontrado.</p>
          </div>
        )}
        <div className="mt-4">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MyAppointmentsDialog;
