
import React from "react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notification } from "@/types/notification";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onClose: () => void;
}

const NotificationList: React.FC<NotificationListProps> = ({ 
  notifications, 
  onMarkAsRead,
  onMarkAllAsRead,
  onClose
}) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment_created':
      case 'appointment_updated':
      case 'appointment_reminder':
      case 'appointment_canceled':
        return <Bell className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  };

  // Filter unread notifications to show at the top
  const unreadNotifications = notifications.filter(n => !n.read);

  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Nenhuma notificação no momento.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-medium">Notificações</h3>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onMarkAllAsRead}
            disabled={unreadNotifications.length === 0}
          >
            <Check className="h-3 w-3 mr-1" />
            Marcar todas como lidas
          </Button>
          <Link to="/dashboard/notifications" onClick={onClose}>
            <Button variant="link" size="sm">
              Ver todas
            </Button>
          </Link>
        </div>
      </div>
      
      <ScrollArea className="h-[300px]">
        <div className="flex flex-col">
          {unreadNotifications.length > 0 ? (
            unreadNotifications.map((notification) => (
              <div 
                key={notification.id}
                className="p-3 border-b last:border-b-0 bg-accent/20"
              >
                <div className="flex items-start">
                  <div className="p-1 rounded-full bg-primary/10 mr-3">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <span className="text-xs text-muted-foreground">
                        {formatNotificationTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex justify-end">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onMarkAsRead(notification.id)}
                  >
                    Marcar como lida
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              Nenhuma notificação não lida.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default NotificationList;
