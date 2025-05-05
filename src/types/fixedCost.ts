
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

// Use the FixedCostFormValues type from the schema instead
import { FixedCostFormValues } from "@/components/finance/fixedCostSchema";
export type FixedCostFormData = FixedCostFormValues;

