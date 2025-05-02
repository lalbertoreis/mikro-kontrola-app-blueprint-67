
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  fetchHolidays, 
  fetchHolidayById, 
  createHoliday, 
  updateHoliday, 
  deleteHoliday 
} from "@/services/holidayService";
import type { Holiday, HolidayFormData } from "@/types/holiday";

export function useHolidays() {
  const queryClient = useQueryClient();

  const { data: holidays = [], isLoading, error } = useQuery({
    queryKey: ["holidays"],
    queryFn: fetchHolidays,
  });

  const createMutation = useMutation({
    mutationFn: (newHoliday: HolidayFormData) => createHoliday(newHoliday),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
      toast.success("Feriado adicionado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao adicionar feriado:", error);
      toast.error("Erro ao adicionar feriado. Tente novamente.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: HolidayFormData }) => 
      updateHoliday(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
      toast.success("Feriado atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar feriado:", error);
      toast.error("Erro ao atualizar feriado. Tente novamente.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
      toast.success("Feriado excluído com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir feriado:", error);
      toast.error("Erro ao excluir feriado. Tente novamente.");
    },
  });

  return {
    holidays,
    isLoading,
    error,
    createHoliday: createMutation.mutate,
    updateHoliday: updateMutation.mutate,
    deleteHoliday: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useHolidayById(id?: string) {
  return useQuery({
    queryKey: ["holiday", id],
    queryFn: () => (id ? fetchHolidayById(id) : null),
    enabled: !!id,
  });
}
