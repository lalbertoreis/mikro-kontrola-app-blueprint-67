
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  entityId?: string;
  entityType?: NotificationEntityType;
  createdAt: string;
}

export type NotificationType = 
  | 'appointment_created'
  | 'appointment_updated'
  | 'appointment_reminder'
  | 'appointment_canceled'
  | 'system';

export type NotificationEntityType = 
  | 'appointment'
  | 'client'
  | 'employee'
  | 'service'
  | 'system';
