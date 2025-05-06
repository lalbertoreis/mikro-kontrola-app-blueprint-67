
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Check, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNotifications } from "@/hooks/useNotifications";

const Notifications = () => {
  const { notifications, markAsRead, markAllAsRead, loading } = useNotifications();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  
  const filteredNotifications = filter === "unread" 
    ? notifications.filter(n => !n.read) 
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  };

  const getNotificationIcon = () => {
    return <Bell className="h-4 w-4" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Notificações</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount} não {unreadCount === 1 ? 'lida' : 'lidas'}
              </Badge>
            )}
          </div>
          <div className="flex space-x-2">
            <Button 
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              size="sm"
            >
              Todas
            </Button>
            <Button 
              variant={filter === "unread" ? "default" : "outline"}
              onClick={() => setFilter("unread")}
              size="sm"
            >
              Não lidas
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={markAllAsRead}
              disabled={notifications.every(n => n.read)}
            >
              <Check className="h-4 w-4 mr-2" />
              Marcar todas como lidas
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-kontrola-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Carregando notificações...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {filter === "unread" 
                ? "Não há notificações não lidas." 
                : "Não há notificações para exibir."}
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 border rounded-lg ${
                  notification.read ? "bg-card" : "bg-accent/10"
                }`}
              >
                <div className="flex items-start">
                  <div className="p-2 rounded-full bg-primary/10 mr-4">
                    {getNotificationIcon()}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{notification.title}</h3>
                      <div className="text-sm text-muted-foreground">
                        {formatNotificationDate(notification.createdAt)}
                      </div>
                    </div>
                    <p className="text-muted-foreground mt-1 mb-4">{notification.message}</p>
                    
                    {!notification.read && (
                      <div className="flex justify-end">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Marcar como lida
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
