
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Calendar, User, FileText, CreditCard, Phone } from "lucide-react";
import { AppointmentWithDetails, AppointmentStatus } from "@/types/calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface AppointmentActionsDialogProps {
  appointment: AppointmentWithDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onCancel: () => void;
  onPayment: () => void;
  isProcessing: boolean;
}

const statusLabels: Record<AppointmentStatus, { label: string; variant: "default" | "outline" | "secondary" | "destructive" | null }> = {
  scheduled: { label: "Agendado", variant: "default" },
  confirmed: { label: "Confirmado", variant: "secondary" },
  completed: { label: "Concluído", variant: "outline" },
  canceled: { label: "Cancelado", variant: "destructive" },
  "no-show": { label: "Não compareceu", variant: "destructive" },
  blocked: { label: "Bloqueado", variant: null },
};

const AppointmentActionsDialog: React.FC<AppointmentActionsDialogProps> = ({
  appointment,
  open,
  onOpenChange,
  onEdit,
  onCancel,
  onPayment,
  isProcessing,
}) => {
  const startDate = appointment.start;
  const endDate = appointment.end;
  const formattedDate = format(startDate, "PPP", { locale: ptBR });
  const startTime = format(startDate, "HH:mm");
  const endTime = format(endDate, "HH:mm");
  const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60); // in minutes
  
  const statusInfo = statusLabels[appointment.status];

  // Generate WhatsApp confirmation message
  const generateWhatsAppLink = () => {
    if (!appointment.client?.phone) {
      return null;
    }
    
    // Clean the phone number by removing non-numeric characters
    const cleanPhone = appointment.client.phone.replace(/\D/g, '');
    
    // Format date for the message
    const appointmentDate = format(startDate, "dd/MM/yyyy", { locale: ptBR });
    
    // Create the message text (already URL encoded)
    const message = `Olá ${appointment.client.name}! Confirmando seu agendamento para ${appointment.service.name} no dia ${appointmentDate} às ${startTime}.`;
    
    // Create the WhatsApp URL
    const whatsappUrl = `https://api.whatsapp.com/send/?phone=${cleanPhone}&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`;
    
    return whatsappUrl;
  };
  
  const whatsappLink = generateWhatsAppLink();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detalhes do Agendamento</DialogTitle>
          <DialogDescription>
            {statusInfo && (
              <Badge variant={statusInfo.variant || "default"} className="mt-2">
                {statusInfo.label}
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4" />
                <span className="text-muted-foreground">Data</span>
              </div>
              <p>{formattedDate}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center text-sm">
                <Clock className="mr-2 h-4 w-4" />
                <span className="text-muted-foreground">Horário</span>
              </div>
              <p>{startTime} - {endTime} ({duration} min)</p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center text-sm">
              <User className="mr-2 h-4 w-4" />
              <span className="text-muted-foreground">Cliente</span>
            </div>
            <p>{appointment.client.name || "Cliente não especificado"}</p>
            {appointment.client.phone && (
              <p className="text-sm text-muted-foreground">{appointment.client.phone}</p>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center text-sm">
              <FileText className="mr-2 h-4 w-4" />
              <span className="text-muted-foreground">Serviço</span>
            </div>
            <p>{appointment.service.name || "Serviço não especificado"}</p>
            {appointment.service.price > 0 && (
              <p className="text-sm font-medium text-primary" style={{ color: `var(--booking-color, var(--primary))` }}>
                {formatCurrency(appointment.service.price)}
              </p>
            )}
          </div>

          {appointment.notes && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Observações</p>
              <p className="text-sm">{appointment.notes}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col space-y-2 sm:space-y-0">
          <div className="grid grid-cols-2 gap-2">
            {appointment.status !== "canceled" && (
              <>
                <Button onClick={onEdit} variant="outline">
                  Editar
                </Button>
                <Button onClick={onCancel} variant="destructive" disabled={isProcessing}>
                  {isProcessing ? "Processando..." : "Cancelar"}
                </Button>
              </>
            )}
          </div>
          
          <div className="grid grid-cols-1 w-full gap-2">
            {appointment.status === "scheduled" && (
              <Button 
                onClick={onPayment} 
                variant="default" 
                className="w-full"
                disabled={isProcessing}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Registrar Pagamento
              </Button>
            )}
            
            {appointment.status !== "canceled" && whatsappLink && (
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full">
                <Button 
                  className="w-full bg-green-500 hover:bg-green-600"
                  type="button"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Confirmar via WhatsApp
                </Button>
              </a>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentActionsDialog;
