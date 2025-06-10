
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
import { CreditCard, Edit, MessageSquare, Ban, Phone } from "lucide-react";
import { useAppointments } from "@/hooks/useAppointments";
import PaymentDialog from "./PaymentDialog";
import { toast } from "sonner";

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
  const { cancelAppointment, isLoading } = useAppointments();
  
  if (!appointment) {
    return null;
  }
  
  const { service, client, employee } = appointment;
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
    if (!client || !client.phone) {
      toast.error("Cliente não possui telefone cadastrado");
      return;
    }
    
    // Clean phone number (remove non-digits and ensure it starts with country code)
    let phone = client.phone.replace(/\D/g, '');
    
    // Add Brazil country code if phone doesn't start with it
    if (!phone.startsWith('55')) {
      phone = '55' + phone;
    }
    
    // Create confirmation message
    const appointmentDate = formatDateForMessage(new Date(appointment.start));
    const appointmentTime = formatTimeForMessage(new Date(appointment.start));
    const serviceName = service?.name || 'Serviço';
    const employeeName = employee?.name || 'Profissional';
    
    let message = '';
    
    if (isCanceled) {
      message = `Olá ${client.name}! Notamos que você cancelou seu agendamento de *${serviceName}* com ${employeeName} no dia ${appointmentDate} às ${appointmentTime}. Gostaria de remarcar para outra data? Entre em contato conosco!`;
    } else {
      message = `Olá ${client.name}! Confirmando seu agendamento para *${serviceName}* com ${employeeName} no dia ${appointmentDate} às ${appointmentTime}. Aguardamos você! 😊`;
    }
    
    const encodedMessage = encodeURIComponent(message);
    
    // Open WhatsApp with pre-filled message
    const whatsappUrl = `https://web.whatsapp.com/send/?phone=${phone}&text=${encodedMessage}&type=phone_number&app_absent=0`;
    window.open(whatsappUrl, '_blank');
  };
  
  const handleCancelAppointment = async () => {
    if (!appointment.id) {
      toast.error("ID do agendamento não encontrado");
      return;
    }

    try {
      await cancelAppointment(appointment.id);
      onOpenChange(false);
      toast.success("Agendamento cancelado com sucesso!");
    } catch (error: any) {
      console.error("Error canceling appointment:", error);
      toast.error(error.message || "Erro ao cancelar agendamento. Tente novamente.");
    }
  };
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg backdrop-blur-sm">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl text-center bg-gradient-to-r from-blue-600 to-purple-500 text-transparent bg-clip-text font-bold">
              {appointment.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="grid gap-3">
              <div className="grid grid-cols-[1fr_auto] gap-4">
                <p className="font-medium text-slate-700 dark:text-slate-300">Cliente:</p>
                <p className="text-slate-900 dark:text-white text-right">{client?.name}</p>
              </div>
              
              <div className="grid grid-cols-[1fr_auto] gap-4">
                <p className="font-medium text-slate-700 dark:text-slate-300">Profissional:</p>
                <p className="text-slate-900 dark:text-white text-right">{employee?.name}</p>
              </div>
              
              <div className="grid grid-cols-[1fr_auto] gap-4">
                <p className="font-medium text-slate-700 dark:text-slate-300">Data:</p>
                <p className="text-slate-900 dark:text-white text-right">{new Date(appointment.start).toLocaleDateString()}</p>
              </div>
              
              <div className="grid grid-cols-[1fr_auto] gap-4">
                <p className="font-medium text-slate-700 dark:text-slate-300">Horário:</p>
                <p className="text-slate-900 dark:text-white text-right">
                  {new Date(appointment.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                  {new Date(appointment.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              
              <div className="grid grid-cols-[1fr_auto] gap-4">
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
                <div className="grid grid-cols-[1fr_auto] gap-4">
                  <p className="font-medium text-slate-700 dark:text-slate-300">Observações:</p>
                  <p className="text-slate-900 dark:text-white text-right">{appointment.notes}</p>
                </div>
              )}
              
              {!isBlocked && service?.price && (
                <div className="grid grid-cols-[1fr_auto] gap-4">
                  <p className="font-medium text-slate-700 dark:text-slate-300">Valor:</p>
                  <p className="font-semibold text-green-600 dark:text-green-400 text-right">R$ {service.price.toFixed(2)}</p>
                </div>
              )}
              
              {client?.phone && (
                <div className="grid grid-cols-[1fr_auto] gap-4">
                  <p className="font-medium text-slate-700 dark:text-slate-300">Telefone:</p>
                  <p className="text-slate-900 dark:text-white text-right flex items-center justify-end gap-1">
                    <Phone className="h-3 w-3" />
                    {client.phone}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="pt-6 border-t border-slate-200 dark:border-slate-800">
            {/* Action buttons grid - 2 columns for main actions */}
            <div className="w-full space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onEdit}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </Button>
                
                {!isBlocked && client?.phone && !isCompleted && !isCanceled && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSendWhatsApp}
                    className="w-full flex items-center justify-center gap-2 border-green-600 text-green-600 dark:border-green-500 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-950/40"
                  >
                    <MessageSquare className="h-4 w-4" />
                    WhatsApp
                  </Button>
                )}
              </div>
              
              {/* Payment button - full width if available */}
              {!isBlocked && service?.price && !isCompleted && !isCanceled && (
                <Button 
                  onClick={() => {
                    setShowPaymentDialog(true);
                    onOpenChange(false);
                  }}
                  size="sm"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <CreditCard className="h-4 w-4" />
                  Registrar Pagamento
                </Button>
              )}
              
              {/* Bottom row - Cancel and Close */}
              <div className="grid grid-cols-2 gap-3">
                <DialogClose asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    Fechar
                  </Button>
                </DialogClose>
                
                {!isBlocked && !isCompleted && !isCanceled && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                        disabled={isLoading}
                      >
                        <Ban className="h-4 w-4 mr-1" />
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
                          disabled={isLoading}
                        >
                          {isLoading ? "Cancelando..." : "Sim, cancelar"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
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
