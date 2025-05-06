
import { BusinessSettings } from "@/types/settings";
import { Employee } from "@/types/employee";
import { Service } from "@/types/service";

export type Period = "morning" | "afternoon" | "evening";
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

export interface BookingStepProps {
  onNext?: () => void;
  onPrevious?: () => void;
}

export interface BookingDateTimeStepProps extends BookingStepProps {
  date?: Date;
  setDate: (date: Date) => void;
  time?: string;
  setTime: (time: string) => void;
  period?: Period;
  setPeriod: (period: Period) => void;
  availableTimeSlots: string[];
  employeeId?: string;
  serviceId?: string;
  isLoading: boolean;
  businessSlug?: string;
  service?: Service;
  employees?: Employee[];
  selectedEmployee?: any;
  selectedDate?: Date;
  selectedPeriod?: Period;
  selectedTime?: string;
  availableDays?: { [key: number]: boolean };
  availablePeriods?: Period[];
  isLoadingDays?: boolean;
  isLoadingSlots?: boolean;
  weekDays?: Date[];
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  currentWeekStart?: Date;
  onEmployeeSelect?: (employee: any) => void;
  onDateSelect?: (date: Date) => void;
  onPeriodSelect?: (period: Period) => void;
  onTimeSelect?: (time: string) => void;
  goToNextWeek?: () => void;
  goToPreviousWeek?: () => void;
}
