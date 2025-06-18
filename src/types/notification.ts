
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  entity_id?: string;
  entity_type?: NotificationEntityType;
  created_at: string;
  updated_at: string;
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
