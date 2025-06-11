
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  fetchClients, 
  fetchClientById, 
  createClient, 
  updateClient, 
  deleteClient 
} from "@/services/clientService";
import type { Client, ClientFormData } from "@/types/client";

export function useClients() {
  const queryClient = useQueryClient();
  
  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
  });

  const createMutation = useMutation({
    mutationFn: (newClient: ClientFormData) => createClient(newClient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Cliente adicionado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao adicionar cliente:", error);
      toast.error("Erro ao adicionar cliente. Tente novamente.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ClientFormData }) => 
      updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Cliente atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar cliente:", error);
      toast.error("Erro ao atualizar cliente. Tente novamente.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Cliente excluído com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir cliente:", error);
      toast.error("Erro ao excluir cliente. Tente novamente.");
    },
  });

  return {
    clients,
    isLoading,
    error,
    createClient: createMutation.mutate,
    updateClient: updateMutation.mutate,
    deleteClient: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useClientById(id?: string) {
  return useQuery({
    queryKey: ["client", id],
    queryFn: () => (id ? fetchClientById(id) : null),
    enabled: !!id,
  });
}
