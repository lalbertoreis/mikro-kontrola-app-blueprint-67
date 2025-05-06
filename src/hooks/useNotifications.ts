
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Notification } from "@/types/notification";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Local storage key for read notifications
const READ_NOTIFICATIONS_KEY = 'kontrola-read-notifications';

// Function to get read notification IDs from localStorage
const getReadNotificationsFromStorage = (): string[] => {
  try {
    const stored = localStorage.getItem(READ_NOTIFICATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return [];
  }
};

// Function to save read notification IDs to localStorage
const saveReadNotificationsToStorage = (ids: string[]) => {
  try {
    localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(ids));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

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

        // Get read notifications from localStorage
        const readNotificationIds = getReadNotificationsFromStorage();
        
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
      // Get current read notifications
      const readNotificationIds = getReadNotificationsFromStorage();
      
      // Add new notification ID if not already included
      if (!readNotificationIds.includes(notificationId)) {
        readNotificationIds.push(notificationId);
        saveReadNotificationsToStorage(readNotificationIds);
      }
      
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
      // Get all unread notification IDs
      const unreadNotifications = notifications.filter(n => !n.read);
      
      if (unreadNotifications.length === 0) return;
      
      // Get current read notifications
      const readNotificationIds = getReadNotificationsFromStorage();
      
      // Add all unread notification IDs
      unreadNotifications.forEach(notification => {
        if (!readNotificationIds.includes(notification.id)) {
          readNotificationIds.push(notification.id);
        }
      });
      
      // Save to localStorage
      saveReadNotificationsToStorage(readNotificationIds);
      
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
