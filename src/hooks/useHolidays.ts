
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  fetchHolidays, 
  fetchHolidayById, 
  createHoliday, 
  updateHoliday, 
  deleteHoliday,
  importHolidays
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
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: HolidayFormData }) => 
      updateHoliday(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
    },
  });

  const importMutation = useMutation({
    mutationFn: (year: number) => importHolidays(year),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
    },
  });

  return {
    holidays,
    isLoading,
    error,
    createHoliday: createMutation.mutate,
    updateHoliday: updateMutation.mutate,
    deleteHoliday: deleteMutation.mutate,
    importHolidays: importMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isImporting: importMutation.isPending,
  };
}

export function useHolidayById(id?: string) {
  return useQuery({
    queryKey: ["holiday", id],
    queryFn: () => (id ? fetchHolidayById(id) : null),
    enabled: !!id,
  });
}
