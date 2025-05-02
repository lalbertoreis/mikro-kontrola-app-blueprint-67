
export interface Holiday {
  id: string;
  date: string; // formato: "yyyy-MM-dd"
  name: string;
  type: HolidayType;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type HolidayType = 
  | 'national'  // Feriado nacional
  | 'state'     // Feriado estadual
  | 'municipal' // Feriado municipal
  | 'custom';   // Feriado personalizado

export interface HolidayFormData {
  date: Date;
  name: string;
  type: HolidayType;
  description?: string;
  isActive: boolean;
}
