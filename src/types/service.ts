
export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number; // in minutes
  multipleAttendees: boolean;
  maxAttendees?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  hasEmployees?: boolean; // Added property for employee availability
}

export interface ServiceFormData {
  name: string;
  description?: string;
  price: number;
  duration: number;
  multipleAttendees: boolean;
  maxAttendees?: number;
  isActive: boolean;
}

export interface ServicePackage {
  id: string;
  name: string;
  description?: string;
  services: string[];
  price: number;
  discount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  showInOnlineBooking: boolean;
  totalDuration?: number;
}

export interface ServicePackageFormData {
  name: string;
  description?: string;
  services: string[];
  price: number;
  discount: number;
  showInOnlineBooking: boolean;
  totalDuration?: number;
}
