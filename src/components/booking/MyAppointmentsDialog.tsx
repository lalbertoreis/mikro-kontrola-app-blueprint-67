
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";

export interface BookingAppointment {
  id: string;
  serviceName: string;
  employeeName: string;
  date: string;  // Changed from Date to string to match how it's actually used
  time: string;
  status?: string; // Make status optional
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
  // Updated to handle string dates instead of Date objects
  const formatAppointmentDate = (date: string) => {
    try {
      // Try to parse the date string (in case it's a formatted date already)
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        // If it's not a valid date, just return the string as is
        return date;
      }
      return format(dateObj, "dd 'de' MMMM", { locale: ptBR });
    } catch (error) {
      // If there's an error formatting, just return the original string
      return date;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-2">
          <div className="flex justify-between items-center">
            <DialogTitle>Meus Agendamentos</DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
          <p className="text-sm text-muted-foreground">
            Veja todos os seus agendamentos futuros.
          </p>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">Você não possui agendamentos.</p>
            </div>
          ) : (
            appointments.map((appointment) => (
              <Card key={appointment.id} className="p-4">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">{appointment.serviceName}</h3>
                    <p className="text-sm text-gray-500">com {appointment.employeeName}</p>
                    <p className="text-sm mt-1">
                      {formatAppointmentDate(appointment.date)} • {appointment.time}
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
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MyAppointmentsDialog;
