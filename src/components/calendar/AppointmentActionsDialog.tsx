
import React, { useState } from "react";
import { AppointmentWithDetails } from "@/types/calendar";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, Edit, MessageSquare } from "lucide-react";
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
  
  const { service, client } = appointment;
  const isBlocked = appointment.status === 'blocked';
  const isCanceled = appointment.status === 'canceled';
  
  // Format date and time for WhatsApp message
  const formatDateForMessage = (date: Date) => {
    return format(date, "dd/MM/yyyy");
  };
  
  const formatTimeForMessage = (date: Date) => {
    return format(date, "HH:mm");
  };
  
  const handleSendWhatsApp = () => {
    if (!client || !client.phone) return;
    
    // Format phone number (remove non-digits)
    const phone = client.phone.replace(/\D/g, '');
    
    // Create message based on appointment status
    let message = '';
    
    if (isCanceled) {
      // Message for canceled appointments
      message = encodeURIComponent(
        `Olá ${client.name}! Notamos que você cancelou seu agendamento de ${service?.name} no dia ${formatDateForMessage(new Date(appointment.start))} às ${formatTimeForMessage(new Date(appointment.start))}. Gostaria de remarcar para outra data? Você pode agendar pelo link: [inserir link de agendamento]`
      );
    } else {
      // Message for regular appointments
      message = encodeURIComponent(
        `Olá ${client.name}! Confirmando seu agendamento para ${service?.name} no dia ${formatDateForMessage(new Date(appointment.start))} às ${formatTimeForMessage(new Date(appointment.start))}.`
      );
    }
    
    // Open WhatsApp with pre-filled message
    const whatsappUrl = `https://api.whatsapp.com/send/?phone=${phone}&text=${message}&type=phone_number&app_absent=0`;
    window.open(whatsappUrl, '_blank');
  };
  
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
            
            {client?.phone && (
              <div className="grid grid-cols-2">
                <p className="font-medium">Telefone:</p>
                <p>{client.phone}</p>
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
            
            {!isBlocked && client?.phone && (
              <Button
                variant="outline"
                onClick={handleSendWhatsApp}
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                {isCanceled ? "Perguntar sobre remarcação" : "Confirmar via WhatsApp"}
              </Button>
            )}
            
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
