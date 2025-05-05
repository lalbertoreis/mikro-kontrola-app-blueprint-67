
import { Employee } from "./employee";
import { Service } from "./service";
import { Client } from "./client";

export interface Appointment {
  id: string;
  title: string;
  start: Date;
  end: Date;
  employeeId: string;
  serviceId: string | null;
  clientId: string | null;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // These are optional to handle data from the API
  employee?: Employee;
  service?: Service;
  client?: Client;
}

export type AppointmentStatus = 
  | 'scheduled'  // Agendado
  | 'confirmed'  // Confirmado
  | 'completed'  // Concluído
  | 'canceled'   // Cancelado
  | 'no-show'    // Não compareceu
  | 'blocked';   // Bloqueado

export interface AppointmentWithDetails extends Appointment {
  employee: Employee;
  service: Service;
  client: Client;
}

export interface CalendarViewOptions {
  view: 'week' | 'month';
  date: Date;
  employeeId?: string;
}

export interface AppointmentFormData {
  employee: string;
  service: string;
  client: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

