
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  fetchServices, 
  fetchServiceById, 
  createService, 
  updateService, 
  deleteService 
} from "@/services/serviceService";
import type { Service, ServiceFormData } from "@/types/service";

export function useServices(businessUserId?: string) {
  const queryClient = useQueryClient();
  
  console.info("useServices hook called with businessUserId:", businessUserId);

  const { data: services = [], isLoading, error } = useQuery({
    queryKey: ["services", businessUserId],
    queryFn: () => {
      console.info("Executing queryFn with businessUserId:", businessUserId);
      return fetchServices(businessUserId);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  console.info("useServices hook returning", services.length, "services");

  const createMutation = useMutation({
    mutationFn: (newService: ServiceFormData) => createService(newService),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Serviço adicionado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao adicionar serviço:", error);
      toast.error("Erro ao adicionar serviço. Tente novamente.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ServiceFormData }) => 
      updateService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Serviço atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar serviço:", error);
      toast.error("Erro ao atualizar serviço. Tente novamente.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Serviço excluído com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir serviço:", error);
      toast.error("Erro ao excluir serviço. Tente novamente.");
    },
  });

  return {
    services,
    isLoading,
    error,
    createService: createMutation.mutate,
    updateService: updateMutation.mutate,
    deleteService: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useServiceById(id?: string) {
  return useQuery({
    queryKey: ["service", id],
    queryFn: async () => {
      if (!id) return null;
      console.log("useServiceById: Fetching service with ID:", id);
      const service = await fetchServiceById(id);
      console.log("useServiceById: Service data returned:", service);
      return service;
    },
    enabled: !!id,
  });
}
