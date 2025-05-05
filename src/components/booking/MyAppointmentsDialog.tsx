import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User } from "lucide-react";

export interface BookingAppointment {
  id: string;
  serviceName: string;
  employeeName: string;
  date: string; // Changed from Date to string for consistency
  time: string;
  status: string;
}

interface MyAppointmentsDialogProps {
  open: boolean;
  onClose: () => void;
  appointments: BookingAppointment[];
  onCancelAppointment: (id: string) => void;
}

const MyAppointmentsDialog: React.FC<MyAppointmentsDialogProps> = ({
  open,
  onClose,
  appointments,
  onCancelAppointment,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Meus Agendamentos</DialogTitle>
          <DialogDescription>
            Veja seus agendamentos e gerencie-os.
          </DialogDescription>
        </DialogHeader>
        <div className="divide-y divide-gray-200">
          {appointments.length > 0 ? (
            appointments.map((appointment) => (
              <div key={appointment.id} className="py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{appointment.serviceName}</p>
                    <div className="flex items-center text-gray-500 space-x-2">
                      <User className="h-4 w-4" />
                      <span>{appointment.employeeName}</span>
                    </div>
                    <div className="flex items-center text-gray-500 space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{appointment.date}</span>
                    </div>
                    <div className="flex items-center text-gray-500 space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{appointment.time}</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Status: {appointment.status}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onCancelAppointment(appointment.id)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-4 text-center">
              <p className="text-gray-500">Nenhum agendamento encontrado.</p>
            </div>
          )}
        </div>
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
