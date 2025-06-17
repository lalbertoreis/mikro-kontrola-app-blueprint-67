
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Notification, NotificationType } from "@/types/notification";

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const getStorageKey = (userId: string) => `notifications_${userId}`;

  const loadNotificationsFromStorage = (userId: string): Notification[] => {
    try {
      const stored = localStorage.getItem(getStorageKey(userId));
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading notifications from storage:', error);
    }
    return [];
  };

  const saveNotificationsToStorage = (userId: string, notifications: Notification[]) => {
    try {
      localStorage.setItem(getStorageKey(userId), JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications to storage:', error);
    }
  };

  const createMockNotifications = (userId: string): Notification[] => {
    return [
      {
        id: `${userId}-1`,
        title: "Novo agendamento",
        message: "Você tem um novo agendamento para amanhã às 14:00",
        type: "appointment_created" as NotificationType,
        read: false,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      },
      {
        id: `${userId}-2`,
        title: "Lembrete de agendamento",
        message: "Você tem um agendamento em 30 minutos",
        type: "appointment_reminder" as NotificationType,
        read: false,
        createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
      }
    ];
  };

  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      console.log("Fetching notifications for user:", user.id);
      
      let userNotifications = loadNotificationsFromStorage(user.id);
      
      // Se não há notificações salvas, criar notificações mock
      if (userNotifications.length === 0) {
        userNotifications = createMockNotifications(user.id);
        saveNotificationsToStorage(user.id, userNotifications);
      }

      setNotifications(userNotifications);
      setUnreadCount(userNotifications.filter(n => !n.read).length);
      
      console.log(`Loaded ${userNotifications.length} notifications for user ${user.id}`);
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
    
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    
    setNotifications(updatedNotifications);
    saveNotificationsToStorage(user.id, updatedNotifications);
    setUnreadCount(updatedNotifications.filter(n => !n.read).length);
  };

  const markAllAsRead = async () => {
    if (!user) return;

    console.log("Marking all notifications as read for user:", user.id);
    
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    
    setNotifications(updatedNotifications);
    saveNotificationsToStorage(user.id, updatedNotifications);
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
