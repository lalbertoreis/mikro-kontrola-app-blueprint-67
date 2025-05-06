
import React, { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import NotificationList from "./NotificationList";
import { Notification } from "@/types/notification";

// Mock notifications (until we implement backend)
const mockNotifications: Notification[] = [
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
];

const NotificationIndicator: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  
  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };
  
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <NotificationList 
          notifications={notifications.filter(n => !n.read)}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onClose={handleClose}
        />
      </PopoverContent>
    </Popover>
  );
};

export default NotificationIndicator;
