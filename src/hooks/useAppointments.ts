
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  fetchAppointments, 
  fetchAppointmentById, 
  createAppointment, 
  blockTimeSlot,
  fetchAvailableTimeSlots
} from "@/services/appointmentService";
import type { Appointment, AppointmentFormData } from "@/types/calendar";

export function useAppointments() {
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading, error } = useQuery({
    queryKey: ["appointments"],
    queryFn: fetchAppointments,
  });

  const createMutation = useMutation({
    mutationFn: (newAppointment: AppointmentFormData) => createAppointment(newAppointment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Agendamento criado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar agendamento:", error);
      toast.error("Erro ao criar agendamento. Tente novamente.");
    },
  });

  const blockTimeMutation = useMutation({
    mutationFn: (blockData: {
      employeeId: string;
      date: string;
      startTime: string;
      endTime: string;
      reason: string;
    }) => blockTimeSlot(blockData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Horário bloqueado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao bloquear horário:", error);
      toast.error("Erro ao bloquear horário. Tente novamente.");
    },
  });

  return {
    appointments,
    isLoading,
    error,
    createAppointment: createMutation.mutate,
    blockTimeSlot: blockTimeMutation.mutate,
    isCreating: createMutation.isPending,
    isBlocking: blockTimeMutation.isPending,
  };
}

export function useAppointmentById(id?: string) {
  return useQuery({
    queryKey: ["appointment", id],
    queryFn: () => (id ? fetchAppointmentById(id) : null),
    enabled: !!id,
  });
}

export function useAvailableTimeSlots(employeeId: string, serviceId: string, date: string) {
  return useQuery({
    queryKey: ["available-time-slots", employeeId, serviceId, date],
    queryFn: () => fetchAvailableTimeSlots(employeeId, serviceId, date),
    enabled: !!employeeId && !!serviceId && !!date,
  });
}
