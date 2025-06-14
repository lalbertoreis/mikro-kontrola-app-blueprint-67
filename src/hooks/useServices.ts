import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  fetchServices, 
  fetchServiceById, 
  createService, 
  updateService,
  deleteService,
  fetchServicesBySlug,
  fetchServiceByIdAndSlug 
} from "@/services/serviceService";
import type { Service, ServiceFormData } from "@/types/service";

export function useServices(businessUserId?: string) {
  const queryClient = useQueryClient();
  
  // Criar uma queryKey estável para evitar loops infinitos
  const queryKey = ["services", businessUserId || "current-user"];

  const { data: services = [], isLoading, error } = useQuery({
    queryKey,
    queryFn: () => fetchServices(businessUserId),
    enabled: true, // Sempre habilitado, mas com queryKey estável
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false, // Evitar refetch desnecessário
    refetchOnMount: false, // Don't refetch on mount if we have cached data
  });

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

// Novo hook para buscar serviços por slug do negócio
export function useServicesBySlug(slug?: string) {
  return useQuery({
    queryKey: ["services-by-slug", slug],
    queryFn: async () => {
      if (!slug) return [];
      console.log("useServicesBySlug: Fetching services for slug:", slug);
      const services = await fetchServicesBySlug(slug);
      console.log(`useServicesBySlug: ${services.length} services returned for slug:`, slug);
      return services;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

// Novo hook para buscar um serviço específico por ID e slug
export function useServiceByIdAndSlug(id?: string, slug?: string) {
  return useQuery({
    queryKey: ["service-by-id-and-slug", id, slug],
    queryFn: async () => {
      if (!id || !slug) return null;
      console.log(`useServiceByIdAndSlug: Fetching service ${id} for slug:`, slug);
      const service = await fetchServiceByIdAndSlug(id, slug);
      console.log("useServiceByIdAndSlug: Service data returned:", service);
      return service;
    },
    enabled: !!id && !!slug,
  });
}
