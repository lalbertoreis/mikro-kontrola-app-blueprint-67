
export interface Employee {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  shifts: Shift[];
  services: string[];
  createdAt: string;
  updatedAt: string;
  auth_user_id?: string; // <== Adicionado para persistir acesso
}

export interface Shift {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  lunchBreakStart?: string;
  lunchBreakEnd?: string;
}

export interface EmployeeFormData {
  name: string;
  role: string;
  shifts: Shift[];
  services: string[];
}
