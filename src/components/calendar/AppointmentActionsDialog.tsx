
import React, { useState } from "react";
import { AppointmentWithDetails } from "@/types/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, Edit } from "lucide-react";
import PaymentDialog from "./PaymentDialog";

interface AppointmentActionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: AppointmentWithDetails | null;
  onEdit: () => void;
}

export default function AppointmentActionsDialog({
  open,
  onOpenChange,
  appointment,
  onEdit
}: AppointmentActionsDialogProps) {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  
  if (!appointment) {
    return null;
  }
  
  const { service } = appointment;
  const isBlocked = appointment.status === 'blocked';
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{appointment.title}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2">
              <p className="font-medium">Cliente:</p>
              <p>{appointment.client?.name}</p>
            </div>
            
            <div className="grid grid-cols-2">
              <p className="font-medium">Profissional:</p>
              <p>{appointment.employee?.name}</p>
            </div>
            
            <div className="grid grid-cols-2">
              <p className="font-medium">Data:</p>
              <p>{new Date(appointment.start).toLocaleDateString()}</p>
            </div>
            
            <div className="grid grid-cols-2">
              <p className="font-medium">Horário:</p>
              <p>
                {new Date(appointment.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                {new Date(appointment.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            
            {appointment.notes && (
              <div className="grid grid-cols-2">
                <p className="font-medium">Observações:</p>
                <p>{appointment.notes}</p>
              </div>
            )}
            
            {!isBlocked && service?.price && (
              <div className="grid grid-cols-2">
                <p className="font-medium">Valor:</p>
                <p>R$ {service.price.toFixed(2)}</p>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <DialogClose asChild>
              <Button variant="outline">Fechar</Button>
            </DialogClose>
            
            <Button 
              variant="outline" 
              onClick={onEdit}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Editar
            </Button>
            
            {!isBlocked && service?.price && (
              <Button 
                onClick={() => {
                  setShowPaymentDialog(true);
                  onOpenChange(false);
                }}
                className="flex items-center gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Registrar Pagamento
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {appointment && service?.price && (
        <PaymentDialog
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          appointmentId={appointment.id}
          serviceName={service.name}
          servicePrice={service.price}
        />
      )}
    </>
  );
}
