
export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number; // in minutes
  multipleAttendees: boolean;
  maxAttendees?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceFormData {
  name: string;
  description?: string;
  price: number;
  duration: number;
  multipleAttendees: boolean;
  maxAttendees?: number;
}

export interface ServicePackage {
  id: string;
  name: string;
  description?: string;
  services: string[];
  price: number;
  discount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServicePackageFormData {
  name: string;
  description?: string;
  services: string[];
  price: number;
  discount: number;
}
