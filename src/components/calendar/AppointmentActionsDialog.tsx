
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CreditCard, Edit, MessageSquare, Ban } from "lucide-react";
import { useAppointments } from "@/hooks/useAppointments";
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
  const { cancelAppointment, isCanceling } = useAppointments();
  
  if (!appointment) {
    return null;
  }
  
  const { service, client } = appointment;
  const isBlocked = appointment.status === 'blocked';
  const isCanceled = appointment.status === 'canceled';
  const isCompleted = appointment.status === 'completed';
  
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
  
  const handleCancelAppointment = async () => {
    try {
      await cancelAppointment(appointment.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Error canceling appointment:", error);
    }
  };
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border-slate-200 dark:border-slate-800 shadow-lg backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-xl text-center bg-gradient-to-r from-blue-600 to-purple-500 text-transparent bg-clip-text font-bold">
              {appointment.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4 overflow-y-auto">
            <div className="grid grid-cols-2">
              <p className="font-medium text-slate-700 dark:text-slate-300">Cliente:</p>
              <p className="text-slate-900 dark:text-white text-right">{appointment.client?.name}</p>
            </div>
            
            <div className="grid grid-cols-2">
              <p className="font-medium text-slate-700 dark:text-slate-300">Profissional:</p>
              <p className="text-slate-900 dark:text-white text-right">{appointment.employee?.name}</p>
            </div>
            
            <div className="grid grid-cols-2">
              <p className="font-medium text-slate-700 dark:text-slate-300">Data:</p>
              <p className="text-slate-900 dark:text-white text-right">{new Date(appointment.start).toLocaleDateString()}</p>
            </div>
            
            <div className="grid grid-cols-2">
              <p className="font-medium text-slate-700 dark:text-slate-300">Horário:</p>
              <p className="text-slate-900 dark:text-white text-right">
                {new Date(appointment.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                {new Date(appointment.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            
            <div className="grid grid-cols-2">
              <p className="font-medium text-slate-700 dark:text-slate-300">Status:</p>
              <p className={`font-semibold text-right ${
                isCompleted ? "text-green-600" : 
                isCanceled ? "text-red-600" : 
                "text-blue-600"
              }`}>
                {isCompleted ? "Concluído" : 
                 isCanceled ? "Cancelado" : 
                 isBlocked ? "Bloqueado" : 
                 "Agendado"}
              </p>
            </div>
            
            {appointment.notes && (
              <div className="grid grid-cols-2">
                <p className="font-medium text-slate-700 dark:text-slate-300">Observações:</p>
                <p className="text-slate-900 dark:text-white text-right">{appointment.notes}</p>
              </div>
            )}
            
            {!isBlocked && service?.price && (
              <div className="grid grid-cols-2">
                <p className="font-medium text-slate-700 dark:text-slate-300">Valor:</p>
                <p className="font-semibold text-green-600 dark:text-green-400 text-right">R$ {service.price.toFixed(2)}</p>
              </div>
            )}
            
            {client?.phone && (
              <div className="grid grid-cols-2">
                <p className="font-medium text-slate-700 dark:text-slate-300">Telefone:</p>
                <p className="text-slate-900 dark:text-white text-right">{client.phone}</p>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <DialogClose asChild>
              <Button variant="outline" className="border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Fechar</Button>
            </DialogClose>
            
            <Button 
              variant="outline" 
              onClick={onEdit}
              className="flex items-center gap-2 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Edit className="h-4 w-4" />
              Editar
            </Button>
            
            {!isBlocked && !isCompleted && !isCanceled && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 border-red-600 text-red-600 hover:bg-red-50"
                    disabled={isCanceling}
                  >
                    <Ban className="h-4 w-4" />
                    Cancelar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar cancelamento</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Não, manter</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleCancelAppointment}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Sim, cancelar agendamento
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            
            {!isBlocked && client?.phone && !isCompleted && !isCanceled && (
              <Button
                variant="outline"
                onClick={handleSendWhatsApp}
                className="flex items-center gap-2 border-green-600 text-green-600 dark:border-green-500 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-950/40"
              >
                <MessageSquare className="h-4 w-4" />
                {isCanceled ? "Perguntar sobre remarcação" : "Confirmar via WhatsApp"}
              </Button>
            )}
            
            {!isBlocked && service?.price && !isCompleted && !isCanceled && (
              <Button 
                onClick={() => {
                  setShowPaymentDialog(true);
                  onOpenChange(false);
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
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
