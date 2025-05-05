
import { supabase } from "@/integrations/supabase/client";
import { FixedCostFormData, FixedCost } from "@/types/fixedCost";

export const fetchFixedCosts = async () => {
  const { data, error } = await supabase
    .from("fixed_costs")
    .select("*")
    .order("year", { ascending: false })
    .order("month", { ascending: false });

  if (error) {
    console.error("Error fetching fixed costs:", error);
    throw new Error(error.message);
  }

  return data as FixedCost[];
};

export const fetchFixedCostById = async (id: string) => {
  const { data, error } = await supabase
    .from("fixed_costs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching fixed cost:", error);
    throw new Error(error.message);
  }

  return data as FixedCost;
};

export const createFixedCost = async (data: FixedCostFormData & { user_id: string }) => {
  // Ensure all required fields are present with correct types
  const fixedCostData = {
    name: data.name,
    month: data.month,
    year: data.year,
    amount: data.amount,
    description: data.description || null,
    user_id: data.user_id
  };

  const { data: result, error } = await supabase
    .from("fixed_costs")
    .insert([fixedCostData])
    .select()
    .single();

  if (error) {
    console.error("Error creating fixed cost:", error);
    throw new Error(error.message);
  }

  return result as FixedCost;
};

export const updateFixedCost = async (id: string, data: FixedCostFormData) => {
  // Ensure all required fields are present with correct types
  const fixedCostData = {
    name: data.name,
    month: data.month,
    year: data.year,
    amount: data.amount,
    description: data.description || null
  };

  const { data: result, error } = await supabase
    .from("fixed_costs")
    .update(fixedCostData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating fixed cost:", error);
    throw new Error(error.message);
  }

  return result as FixedCost;
};

export const deleteFixedCost = async (id: string) => {
  const { error } = await supabase
    .from("fixed_costs")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting fixed cost:", error);
    throw new Error(error.message);
  }

  return true;
};
