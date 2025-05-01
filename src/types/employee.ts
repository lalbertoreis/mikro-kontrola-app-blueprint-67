
export interface Employee {
  id: string;
  name: string;
  role: string;
  shifts: Shift[];
  services: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Shift {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // format: "HH:MM"
  endTime: string; // format: "HH:MM"
  lunchBreakStart?: string; // format: "HH:MM"
  lunchBreakEnd?: string; // format: "HH:MM"
}

export interface EmployeeFormData {
  name: string;
  role: string;
  shifts: Shift[];
  services: string[];
}
