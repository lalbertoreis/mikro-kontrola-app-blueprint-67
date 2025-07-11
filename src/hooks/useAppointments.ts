
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  fetchAppointments, 
  fetchAppointmentById, 
  createAppointment, 
  blockTimeSlot,
  fetchAvailableTimeSlots,
  registerAppointmentPayment,
  cancelAppointment
} from "@/services/appointment";
import type { Appointment, AppointmentFormData } from "@/types/calendar";

export function useAppointments() {
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading, error } = useQuery({
    queryKey: ["appointments"],
    queryFn: fetchAppointments,
  });

  const createMutation = useMutation({
    mutationFn: (newAppointment: AppointmentFormData) => createAppointment(newAppointment),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      // Don't show toast here as it's handled in the component
    },
    onError: (error: any) => {
      console.error("Erro ao criar agendamento:", error);
      toast.error(error.message || "Erro ao criar agendamento. Tente novamente.");
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
    onError: (error: any) => {
      console.error("Erro ao bloquear horário:", error);
      toast.error(error.message || "Erro ao bloquear horário. Tente novamente.");
    },
  });

  const paymentMutation = useMutation({
    mutationFn: ({ appointmentId, paymentMethod }: { appointmentId: string, paymentMethod: string }) => 
      registerAppointmentPayment(appointmentId, paymentMethod),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Pagamento registrado com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao registrar pagamento:", error);
      toast.error(error.message || "Erro ao registrar pagamento. Tente novamente.");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (appointmentId: string) => cancelAppointment(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      // Don't show success toast here as it's handled in the component
    },
    onError: (error: any) => {
      console.error("Erro ao cancelar agendamento:", error);
      // Re-throw the error so it can be handled in the component
      throw error;
    },
  });

  return {
    appointments,
    isLoading,
    error,
    createAppointment: createMutation.mutateAsync,
    blockTimeSlot: blockTimeMutation.mutate,
    registerPayment: paymentMutation.mutate,
    cancelAppointment: cancelMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isBlocking: blockTimeMutation.isPending,
    isRegisteringPayment: paymentMutation.isPending,
    isCanceling: cancelMutation.isPending
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
