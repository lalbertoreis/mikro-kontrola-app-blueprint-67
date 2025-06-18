
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Notification, NotificationType, NotificationEntityType } from "@/types/notification";

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
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
        setUnreadCount(0);
      } else {
        // Convert the data to match our Notification interface
        const convertedData: Notification[] = (data || []).map(item => ({
          ...item,
          type: item.type as NotificationType,
          entity_type: item.entity_type as NotificationEntityType
        }));
        
        setNotifications(convertedData);
        setUnreadCount(convertedData.filter(n => !n.read).length);
        console.log(`Loaded ${convertedData.length} notifications for user ${user.id}`);
      }
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
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      // Atualizar o estado local
      const updatedNotifications = notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      
      setNotifications(updatedNotifications);
      setUnreadCount(updatedNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    console.log("Marking all notifications as read for user:", user.id);
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return;
      }

      // Atualizar o estado local
      const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
      
      setNotifications(updatedNotifications);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
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
