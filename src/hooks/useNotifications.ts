
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Notification, NotificationType } from "@/types/notification";

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      console.log("Fetching notifications for user:", user.id);
      
      // For now, we'll create mock notifications filtered by user
      // In a real implementation, you would have a notifications table
      const mockNotifications: Notification[] = [
        {
          id: `${user.id}-1`,
          title: "Novo agendamento",
          message: "Você tem um novo agendamento para amanhã às 14:00",
          type: "appointment_created" as NotificationType,
          read: false,
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        },
        {
          id: `${user.id}-2`,
          title: "Lembrete de agendamento",
          message: "Você tem um agendamento em 30 minutos",
          type: "appointment_reminder" as NotificationType,
          read: true,
          createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        }
      ];

      // Filter notifications by current user - they're already filtered by user.id in the mock
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
      
      console.log(`Loaded ${mockNotifications.length} notifications for user ${user.id}`);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    console.log("Marking notification as read:", notificationId);
    
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    if (!user) return;

    console.log("Marking all notifications as read for user:", user.id);
    
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    setUnreadCount(0);
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?.id]);

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
}
