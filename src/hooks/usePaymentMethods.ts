
import { useState, useEffect } from "react";
import { PaymentMethod } from "@/types/finance";
import { 
  createPaymentMethod, 
  updatePaymentMethod, 
  deletePaymentMethod 
} from "@/services/transactionService";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function usePaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchPaymentMethods = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching payment methods:", error);
        return;
      }

      setPaymentMethods(data || []);
    } finally {
      setIsLoading(false);
    }
  };

  const addPaymentMethod = async (data: { name: string, fee?: number, is_active?: boolean }) => {
    if (!user) return null;
    
    const result = await createPaymentMethod({
      ...data,
      user_id: user.id,
    });
    
    if (result) {
      await fetchPaymentMethods();
      return result;
    }
    
    return null;
  };

  const editPaymentMethod = async (id: string, data: { name: string, fee?: number, is_active?: boolean }) => {
    if (!user) return null;
    
    const result = await updatePaymentMethod(id, data);
    
    if (result) {
      await fetchPaymentMethods();
      return result;
    }
    
    return null;
  };

  const removePaymentMethod = async (id: string) => {
    if (!user) return false;
    
    const result = await deletePaymentMethod(id);
    
    if (result) {
      await fetchPaymentMethods();
      return true;
    }
    
    return false;
  };

  useEffect(() => {
    if (user) {
      fetchPaymentMethods();
    }
  }, [user]);

  return {
    paymentMethods,
    isLoading,
    fetchPaymentMethods,
    addPaymentMethod,
    editPaymentMethod,
    removePaymentMethod,
  };
}
