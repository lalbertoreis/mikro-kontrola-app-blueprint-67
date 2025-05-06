
import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import NotificationList from "./NotificationList";
import { Notification } from "@/types/notification";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const NotificationIndicator: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Fetch recent appointments for notifications
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          id,
          start_time,
          status,
          created_at,
          updated_at,
          clients (id, name),
          services (id, name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (appointmentsError) throw appointmentsError;

      // Convert appointments to notifications
      const notificationsList: Notification[] = appointments.map(appointment => {
        const startTime = new Date(appointment.start_time);
        const formattedDate = format(startTime, "dd/MM/yyyy 'às' HH:mm");
        const clientName = appointment.clients?.name || "Cliente não especificado";
        const serviceName = appointment.services?.name || "Serviço não especificado";

        let type: "appointment_created" | "appointment_canceled" | "appointment_updated";
        let title: string;
        let message: string;
        
        // Determine notification type based on appointment status
        if (appointment.status === 'canceled') {
          type = "appointment_canceled";
          title = "Agendamento cancelado";
          message = `${clientName} cancelou o agendamento de ${serviceName} para ${formattedDate}.`;
        } else if (new Date(appointment.created_at).getTime() === new Date(appointment.updated_at).getTime()) {
          type = "appointment_created";
          title = "Novo agendamento";
          message = `${clientName} agendou ${serviceName} para ${formattedDate}.`;
        } else {
          type = "appointment_updated";
          title = "Agendamento atualizado";
          message = `O agendamento de ${clientName} para ${serviceName} foi alterado para ${formattedDate}.`;
        }

        return {
          id: appointment.id,
          title,
          message,
          type,
          read: false,
          entityId: appointment.id,
          entityType: "appointment",
          createdAt: appointment.created_at,
        };
      });

      setNotifications(notificationsList);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };
  
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <NotificationList 
          notifications={notifications.filter(n => !n.read)}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onClose={handleClose}
        />
      </PopoverContent>
    </Popover>
  );
};

export default NotificationIndicator;
