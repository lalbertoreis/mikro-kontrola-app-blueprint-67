
export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number; // in minutes
  createdAt: string;
  updatedAt: string;
}

export interface ServiceFormData {
  name: string;
  description?: string;
  price: number;
  duration: number;
}
