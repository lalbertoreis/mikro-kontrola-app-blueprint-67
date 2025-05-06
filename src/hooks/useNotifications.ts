
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Notification } from "@/types/notification";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        // Fetch appointments from the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        // Fetch recent appointments
        const { data: appointments, error } = await supabase
          .from('appointments')
          .select(`
            id,
            status,
            start_time,
            created_at,
            updated_at,
            client:client_id(name),
            service:service_id(name),
            employee:employee_id(name)
          `)
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        const notificationsData: Notification[] = [];
        
        // Transform appointments into notifications
        appointments.forEach(appointment => {
          const appointmentDate = format(new Date(appointment.start_time), "dd/MM 'às' HH:mm", { locale: ptBR });
          
          // New appointment notification
          if (appointment.status === 'scheduled') {
            notificationsData.push({
              id: `new-${appointment.id}`,
              title: "Novo agendamento",
              message: `${appointment.client?.name || 'Cliente'} agendou ${appointment.service?.name || 'um serviço'} com ${appointment.employee?.name || 'um profissional'} para ${appointmentDate}.`,
              type: "appointment_created",
              read: false,
              entityId: appointment.id,
              entityType: "appointment",
              createdAt: appointment.created_at
            });
          }
          
          // Canceled appointment notification
          if (appointment.status === 'canceled') {
            notificationsData.push({
              id: `cancel-${appointment.id}`,
              title: "Agendamento cancelado",
              message: `${appointment.client?.name || 'Cliente'} cancelou o agendamento de ${appointment.service?.name || 'serviço'} que estava marcado para ${appointmentDate}.`,
              type: "appointment_canceled",
              read: false,
              entityId: appointment.id,
              entityType: "appointment",
              createdAt: appointment.updated_at
            });
          }
        });
        
        // Sort notifications by created date
        notificationsData.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setNotifications(notificationsData);
        setUnreadCount(notificationsData.filter(n => !n.read).length);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    
    // Set up realtime subscription for appointments
    const appointmentSubscription = supabase
      .channel('appointment-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'appointments' 
        }, 
        (payload) => {
          fetchNotifications(); // Refresh notifications when appointments change
        })
      .subscribe();
      
    return () => {
      supabase.removeChannel(appointmentSubscription);
    };
  }, []);
  
  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    
    updateUnreadCount();
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };
  
  const updateUnreadCount = () => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead
  };
}
