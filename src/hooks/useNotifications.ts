
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

        // Fetch read notifications for the current user
        const { data: readNotifications, error: readError } = await supabase
          .from('notification_reads')
          .select('notification_id')
          .eq('user_id', supabase.auth.getUser().then(res => res.data.user?.id));

        if (readError) throw readError;
        
        const readNotificationIds = readNotifications?.map(n => n.notification_id) || [];
        
        const notificationsData: Notification[] = [];
        
        // Transform appointments into notifications
        appointments.forEach(appointment => {
          const appointmentDate = format(new Date(appointment.start_time), "dd/MM 'às' HH:mm", { locale: ptBR });
          
          // New appointment notification
          if (appointment.status === 'scheduled') {
            const notificationId = `new-${appointment.id}`;
            notificationsData.push({
              id: notificationId,
              title: "Novo agendamento",
              message: `${appointment.client?.name || 'Cliente'} agendou ${appointment.service?.name || 'um serviço'} com ${appointment.employee?.name || 'um profissional'} para ${appointmentDate}.`,
              type: "appointment_created",
              read: readNotificationIds.includes(notificationId),
              entityId: appointment.id,
              entityType: "appointment",
              createdAt: appointment.created_at
            });
          }
          
          // Canceled appointment notification
          if (appointment.status === 'canceled') {
            const notificationId = `cancel-${appointment.id}`;
            notificationsData.push({
              id: notificationId,
              title: "Agendamento cancelado",
              message: `${appointment.client?.name || 'Cliente'} cancelou o agendamento de ${appointment.service?.name || 'serviço'} que estava marcado para ${appointmentDate}.`,
              type: "appointment_canceled",
              read: readNotificationIds.includes(notificationId),
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
  
  const markAsRead = async (notificationId: string) => {
    try {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;
      
      if (!userId) throw new Error("User not authenticated");
      
      // Add to notification_reads table
      const { error } = await supabase
        .from('notification_reads')
        .insert({
          user_id: userId,
          notification_id: notificationId,
          read_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      
      updateUnreadCount();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };
  
  const markAllAsRead = async () => {
    try {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;
      
      if (!userId) throw new Error("User not authenticated");
      
      // Add all unread notification IDs to notification_reads table
      const unreadNotifications = notifications.filter(n => !n.read);
      
      if (unreadNotifications.length === 0) return;
      
      const reads = unreadNotifications.map(n => ({
        user_id: userId,
        notification_id: n.id,
        read_at: new Date().toISOString()
      }));
      
      const { error } = await supabase
        .from('notification_reads')
        .insert(reads);
        
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
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
