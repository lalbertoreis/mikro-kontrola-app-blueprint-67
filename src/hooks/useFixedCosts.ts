
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  fetchFixedCosts, 
  fetchFixedCostById,
  createFixedCost, 
  updateFixedCost,
  deleteFixedCost
} from "@/services/fixedCostService";
import { FixedCostFormData } from "@/types/fixedCost";
import { useAuth } from "@/contexts/AuthContext";

export function useFixedCosts() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: fixedCosts = [], isLoading } = useQuery({
    queryKey: ["fixed-costs"],
    queryFn: fetchFixedCosts,
  });

  const createMutation = useMutation({
    mutationFn: (newFixedCost: FixedCostFormData) => {
      if (!user) throw new Error("User not authenticated");
      return createFixedCost({ ...newFixedCost, user_id: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fixed-costs"] });
      toast.success("Custo fixo adicionado com sucesso");
    },
    onError: (error) => {
      console.error("Error creating fixed cost:", error);
      toast.error("Erro ao adicionar custo fixo");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FixedCostFormData }) => 
      updateFixedCost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fixed-costs"] });
      toast.success("Custo fixo atualizado com sucesso");
    },
    onError: (error) => {
      console.error("Error updating fixed cost:", error);
      toast.error("Erro ao atualizar custo fixo");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFixedCost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fixed-costs"] });
      toast.success("Custo fixo removido com sucesso");
    },
    onError: (error) => {
      console.error("Error deleting fixed cost:", error);
      toast.error("Erro ao remover custo fixo");
    }
  });

  return {
    fixedCosts,
    isLoading,
    addFixedCost: createMutation.mutate,
    updateFixedCost: updateMutation.mutate,
    deleteFixedCost: deleteMutation.mutate,
    isAdding: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useFixedCostById(id?: string) {
  return useQuery({
    queryKey: ["fixed-cost", id],
    queryFn: () => (id ? fetchFixedCostById(id) : null),
    enabled: !!id,
  });
}
