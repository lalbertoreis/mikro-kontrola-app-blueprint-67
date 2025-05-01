
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Notification } from "@/types/notification";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Mock data until backend is implemented
const initialNotifications: Notification[] = [
  {
    id: "1",
    title: "Novo agendamento",
    message: "Maria Silva agendou um Corte de Cabelo para amanhã às 14:00.",
    type: "appointment_created",
    read: false,
    entityId: "appointment-123",
    entityType: "appointment",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Lembrete de agendamento",
    message: "Você tem um cliente em 1 hora - João Pereira para Manicure.",
    type: "appointment_reminder",
    read: true,
    entityId: "appointment-456",
    entityType: "appointment",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    title: "Agendamento cancelado",
    message: "O cliente Carlos Mendes cancelou o agendamento de Barba para hoje às 16:30.",
    type: "appointment_canceled",
    read: false,
    entityId: "appointment-789",
    entityType: "appointment",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    title: "Novo cliente registrado",
    message: "Paulo Oliveira se cadastrou no sistema.",
    type: "system",
    read: true,
    entityType: "client",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  
  const filteredNotifications = filter === "unread" 
    ? notifications.filter(n => !n.read) 
    : notifications;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };
  
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Notificações</h1>
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
              onClick={handleMarkAllAsRead}
              disabled={notifications.every(n => n.read)}
            >
              <Check className="h-4 w-4 mr-2" />
              Marcar todas como lidas
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {filter === "unread" 
                ? "Não há notificações não lidas." 
                : "Não há notificações para exibir."}
            </div>
          ) : (
            filteredNotifications.map(notification => (
              <div 
                key={notification.id} 
                className={`p-4 border rounded-lg ${
                  notification.read ? "bg-card" : "bg-accent/10"
                }`}
              >
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
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      Marcar como lida
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
