
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Check, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNotifications } from "@/hooks/useNotifications";
import { Skeleton } from "@/components/ui/skeleton";

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
      <div className="space-y-5 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Notificações</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount} não {unreadCount === 1 ? 'lida' : 'lidas'}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button 
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              size="sm"
              className="flex-1 sm:flex-none"
            >
              Todas
            </Button>
            <Button 
              variant={filter === "unread" ? "default" : "outline"}
              onClick={() => setFilter("unread")}
              size="sm"
              className="flex-1 sm:flex-none"
            >
              Não lidas
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={markAllAsRead}
              disabled={notifications.every(n => n.read)}
              className="flex-1 sm:flex-none"
            >
              <Check className="h-4 w-4 mr-2" />
              Marcar todas como lidas
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-[200px]" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              {filter === "unread" 
                ? "Não há notificações não lidas." 
                : "Não há notificações para exibir."}
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 border rounded-lg ${
                    notification.read ? "bg-card" : "bg-accent/10"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-primary/10 shrink-0">
                      {getNotificationIcon()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                        <h3 className="font-medium">{notification.title}</h3>
                        <div className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatNotificationDate(notification.created_at)}
                        </div>
                      </div>
                      <p className="text-muted-foreground mt-1 mb-4 break-words">{notification.message}</p>
                      
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
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
