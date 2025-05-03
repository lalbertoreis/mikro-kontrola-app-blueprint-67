
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  fetchServicePackages, 
  fetchServicePackageById, 
  createServicePackage, 
  updateServicePackage, 
  deleteServicePackage 
} from "@/services/packageService";
import type { ServicePackage, ServicePackageFormData } from "@/types/service";

export function useServicePackages() {
  const queryClient = useQueryClient();

  const { data: packages = [], isLoading, error } = useQuery({
    queryKey: ["servicePackages"],
    queryFn: fetchServicePackages,
  });

  const createMutation = useMutation({
    mutationFn: (newPackage: ServicePackageFormData) => createServicePackage(newPackage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicePackages"] });
      toast.success("Pacote adicionado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao adicionar pacote:", error);
      toast.error("Erro ao adicionar pacote. Tente novamente.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ServicePackageFormData }) => 
      updateServicePackage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicePackages"] });
      toast.success("Pacote atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar pacote:", error);
      toast.error("Erro ao atualizar pacote. Tente novamente.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteServicePackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicePackages"] });
      toast.success("Pacote excluído com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir pacote:", error);
      toast.error("Erro ao excluir pacote. Tente novamente.");
    },
  });

  return {
    packages,
    isLoading,
    error,
    createPackage: createMutation.mutate,
    updatePackage: updateMutation.mutate,
    deletePackage: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useServicePackageById(id?: string) {
  return useQuery({
    queryKey: ["servicePackage", id],
    queryFn: () => (id ? fetchServicePackageById(id) : null),
    enabled: !!id,
  });
}
