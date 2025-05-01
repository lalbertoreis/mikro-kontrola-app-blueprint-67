
import { Employee } from "./employee";
import { Service } from "./service";
import { Client } from "./client";

export interface Appointment {
  id: string;
  title: string;
  start: Date;
  end: Date;
  employeeId: string;
  serviceId: string;
  clientId: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus = 
  | 'scheduled'  // Agendado
  | 'confirmed'  // Confirmado
  | 'completed'  // Concluído
  | 'canceled'   // Cancelado
  | 'no-show';   // Não compareceu

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
