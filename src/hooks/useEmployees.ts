
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  fetchEmployees, 
  fetchEmployeeById, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee 
} from "@/services/employeeService";
import type { Employee, EmployeeFormData } from "@/types/employee";

export function useEmployees() {
  const queryClient = useQueryClient();

  const { data: employees = [], isLoading, error } = useQuery({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
  });

  const createMutation = useMutation({
    mutationFn: (newEmployee: EmployeeFormData) => createEmployee(newEmployee),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Funcionário adicionado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao adicionar funcionário:", error);
      toast.error("Erro ao adicionar funcionário. Tente novamente.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EmployeeFormData }) => 
      updateEmployee(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Funcionário atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar funcionário:", error);
      toast.error("Erro ao atualizar funcionário. Tente novamente.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Funcionário excluído com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir funcionário:", error);
      toast.error("Erro ao excluir funcionário. Tente novamente.");
    },
  });

  return {
    employees,
    isLoading,
    error,
    createEmployee: createMutation.mutate,
    updateEmployee: updateMutation.mutate,
    deleteEmployee: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useEmployeeById(id?: string) {
  return useQuery({
    queryKey: ["employee", id],
    queryFn: () => (id ? fetchEmployeeById(id) : null),
    enabled: !!id,
  });
}
