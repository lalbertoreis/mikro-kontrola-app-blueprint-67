
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  cep: string;
  address: string;
  lastAppointment?: string;
  notes?: string;
  pin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  cep: string;
  address: string;
  pin?: string;
  notes?: string;
}
