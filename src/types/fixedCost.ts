
export interface FixedCost {
  id: string;
  name: string;
  month: number;
  year: number;
  amount: number;
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface FixedCostFormData {
  name: string;
  month: number;
  year: number;
  amount: number;
  description?: string;
}
