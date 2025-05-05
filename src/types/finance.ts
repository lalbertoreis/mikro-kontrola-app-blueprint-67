
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  category: string;
  notes?: string;
  payment_method?: string;
  quantity?: number;
  unit_price?: number;
  client_id?: string;
  service_id?: string;
  package_id?: string;
  user_id: string;
  createdAt: string;
  updatedAt: string;
  clients?: {
    id: string;
    name: string;
  };
  services?: {
    id: string;
    name: string;
    price: number;
  };
  packages?: {
    id: string;
    name: string;
    price: number;
  };
}

export interface TransactionFormData {
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  category: string;
  notes?: string;
  payment_method?: string;
  quantity?: number;
  unit_price?: number;
  client_id?: string;
  service_id?: string;
  package_id?: string;
  user_id?: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  periodStart: string;
  periodEnd: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  is_active: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}
