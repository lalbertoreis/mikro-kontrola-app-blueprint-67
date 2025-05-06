
import { BusinessSettings } from "@/types/settings";
import { Employee } from "@/types/employee";
import { Service } from "@/types/service";

// Updated to use Portuguese periods
export type Period = "morning" | "afternoon" | "evening" | "Manhã" | "Tarde" | "Noite";
export type TimeSlot = string;
export type BookingStep = "datetime" | "clientinfo" | "confirmation";

export interface BookingDialogProps {
  open: boolean;
  onClose: () => void;
  service: Service;
  employees: Employee[];
  businessSettings?: BusinessSettings;
  onBookingConfirm: (data: {
    service: Service;
    employee: Employee;
    date: Date;
    time: string;
    clientInfo?: {
      name: string;
      phone: string;
    }
  }) => void;
}
