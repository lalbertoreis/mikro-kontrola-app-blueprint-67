
import { supabase } from "@/integrations/supabase/client";
import { Transaction, TransactionFormData } from "@/types/finance";
import { toast } from "sonner";

export async function fetchTransactions(startDate?: string, endDate?: string) {
  try {
    let query = supabase
      .from("transactions")
      .select(`
        *,
        clients:client_id(*),
        services:service_id(*),
        packages:package_id(*)
      `);
    
    // Adicionar filtros de data se fornecidos
    if (startDate) {
      query = query.gte("date", startDate);
    }
    
    if (endDate) {
      query = query.lte("date", endDate);
    }
    
    const { data, error } = await query.order("date", { ascending: false });

    if (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Erro ao carregar transações");
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in fetchTransactions:", error);
    toast.error("Erro ao carregar transações");
    return [];
  }
}

export async function fetchTransactionById(id: string) {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        *,
        clients:client_id(*),
        services:service_id(*),
        packages:package_id(*)
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching transaction:", error);
      toast.error("Erro ao carregar transação");
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in fetchTransactionById:", error);
    toast.error("Erro ao carregar transação");
    return null;
  }
}

export async function createTransaction(formData: TransactionFormData) {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .insert(formData)
      .select()
      .single();

    if (error) {
      console.error("Error creating transaction:", error);
      toast.error("Erro ao criar transação");
      return null;
    }

    toast.success("Transação criada com sucesso");
    return data;
  } catch (error) {
    console.error("Error in createTransaction:", error);
    toast.error("Erro ao criar transação");
    return null;
  }
}

export async function updateTransaction(id: string, formData: TransactionFormData) {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .update(formData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating transaction:", error);
      toast.error("Erro ao atualizar transação");
      return null;
    }

    toast.success("Transação atualizada com sucesso");
    return data;
  } catch (error) {
    console.error("Error in updateTransaction:", error);
    toast.error("Erro ao atualizar transação");
    return null;
  }
}

export async function deleteTransaction(id: string) {
  try {
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Erro ao excluir transação");
      return false;
    }

    toast.success("Transação excluída com sucesso");
    return true;
  } catch (error) {
    console.error("Error in deleteTransaction:", error);
    toast.error("Erro ao excluir transação");
    return false;
  }
}

export async function fetchPaymentMethods() {
  try {
    const { data, error } = await supabase
      .from("payment_methods")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("Error fetching payment methods:", error);
      toast.error("Erro ao carregar métodos de pagamento");
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in fetchPaymentMethods:", error);
    toast.error("Erro ao carregar métodos de pagamento");
    return [];
  }
}

export async function fetchFinancialSummary(startDate?: string, endDate?: string) {
  try {
    // Set default date range to current month if not provided
    if (!startDate || !endDate) {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      startDate = firstDayOfMonth.toISOString().split('T')[0];
      endDate = lastDayOfMonth.toISOString().split('T')[0];
    }

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .gte("date", startDate)
      .lte("date", endDate);

    if (error) {
      console.error("Error fetching transactions for summary:", error);
      toast.error("Erro ao carregar resumo financeiro");
      return {
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        periodStart: startDate,
        periodEnd: endDate,
      };
    }

    const totalIncome = data
      .filter(transaction => transaction.type === "income")
      .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
    
    const totalExpenses = data
      .filter(transaction => transaction.type === "expense")
      .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      periodStart: startDate,
      periodEnd: endDate,
    };
  } catch (error) {
    console.error("Error in fetchFinancialSummary:", error);
    toast.error("Erro ao carregar resumo financeiro");
    return {
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      periodStart: startDate || "",
      periodEnd: endDate || "",
    };
  }
}

export async function createPaymentMethod(data: { name: string, fee?: number, is_active?: boolean, user_id: string }) {
  try {
    const { data: result, error } = await supabase
      .from("payment_methods")
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error("Error creating payment method:", error);
      toast.error("Erro ao criar método de pagamento");
      return null;
    }

    toast.success("Método de pagamento criado com sucesso");
    return result;
  } catch (error) {
    console.error("Error in createPaymentMethod:", error);
    toast.error("Erro ao criar método de pagamento");
    return null;
  }
}

export async function updatePaymentMethod(id: string, data: { name: string, fee?: number, is_active?: boolean }) {
  try {
    const { data: result, error } = await supabase
      .from("payment_methods")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating payment method:", error);
      toast.error("Erro ao atualizar método de pagamento");
      return null;
    }

    toast.success("Método de pagamento atualizado com sucesso");
    return result;
  } catch (error) {
    console.error("Error in updatePaymentMethod:", error);
    toast.error("Erro ao atualizar método de pagamento");
    return null;
  }
}

export async function deletePaymentMethod(id: string) {
  try {
    const { error } = await supabase
      .from("payment_methods")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting payment method:", error);
      toast.error("Erro ao excluir método de pagamento");
      return false;
    }

    toast.success("Método de pagamento excluído com sucesso");
    return true;
  } catch (error) {
    console.error("Error in deletePaymentMethod:", error);
    toast.error("Erro ao excluir método de pagamento");
    return false;
  }
}
