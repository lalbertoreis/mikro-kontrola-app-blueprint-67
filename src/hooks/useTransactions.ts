
import { useState, useEffect } from "react";
import { Transaction, FinancialSummary, TransactionFormData } from "@/types/finance";
import { 
  fetchTransactions,
  fetchTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  fetchFinancialSummary
} from "@/services/transactionService";
import { useAuth } from "@/contexts/AuthContext";

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const { user } = useAuth();

  const loadTransactions = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const data = await fetchTransactions();
      setTransactions(data as Transaction[]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSummary = async (startDate?: string, endDate?: string) => {
    if (!user) return;
    
    try {
      const data = await fetchFinancialSummary(startDate, endDate);
      setSummary(data);
    } catch (error) {
      console.error("Error loading summary:", error);
    }
  };

  const getTransaction = async (id: string) => {
    if (!user) return null;
    return await fetchTransactionById(id);
  };

  const addTransaction = async (data: TransactionFormData) => {
    if (!user) return null;
    
    const result = await createTransaction({
      ...data,
      user_id: user.id
    });
    
    if (result) {
      await loadTransactions();
      await loadSummary();
      return result;
    }
    
    return null;
  };

  const editTransaction = async (id: string, data: TransactionFormData) => {
    if (!user) return null;
    
    const result = await updateTransaction(id, data);
    
    if (result) {
      await loadTransactions();
      await loadSummary();
      return result;
    }
    
    return null;
  };

  const removeTransaction = async (id: string) => {
    if (!user) return false;
    
    const result = await deleteTransaction(id);
    
    if (result) {
      await loadTransactions();
      await loadSummary();
      return true;
    }
    
    return false;
  };

  useEffect(() => {
    if (user) {
      loadTransactions();
      loadSummary();
    }
  }, [user]);

  return {
    transactions,
    isLoading,
    summary,
    loadTransactions,
    loadSummary,
    getTransaction,
    addTransaction,
    editTransaction,
    removeTransaction
  };
}
