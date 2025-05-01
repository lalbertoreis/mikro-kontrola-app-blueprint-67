
export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  startDate: string;
  salary?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeFormData {
  name: string;
  email: string;
  phone: string;
  role: string;
  startDate: string;
  salary?: number;
  notes?: string;
}
