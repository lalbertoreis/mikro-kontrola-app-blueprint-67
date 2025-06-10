
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Shift } from "@/types/employee";
import { useEmployees, useEmployeeById } from "@/hooks/useEmployees";
import { useToast } from "@/components/ui/use-toast";
import { EmployeeFormData } from "@/types/employee";

const employeeSchema = z.object({
  name: z.string().min(1, { message: "O nome é obrigatório" }),
  role: z.string().min(1, { message: "O cargo é obrigatório" }),
});

export const useEmployeeFormLogic = (
  employeeId?: string,
  onSuccess?: () => void,
  onSubmittingChange?: (isSubmitting: boolean) => void
) => {
  const { toast } = useToast();
  const { createEmployee, updateEmployee, isCreating, isUpdating } = useEmployees();
  const { data: existingEmployee, isLoading: isLoadingEmployee } = useEmployeeById(employeeId);
  const isEditing = Boolean(employeeId);
  const [activeTab, setActiveTab] = useState("info");
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const form = useForm<z.infer<typeof employeeSchema>>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: "",
      role: "",
    },
  });

  useEffect(() => {
    if (existingEmployee && isEditing) {
      form.reset({
        name: existingEmployee.name,
        role: existingEmployee.role,
      });
      setShifts(existingEmployee.shifts || []);
      setSelectedServices(existingEmployee.services || []);
    } else if (!isEditing) {
      form.reset({
        name: "",
        role: "",
      });
      setShifts([]);
      setSelectedServices([]);
    }
  }, [existingEmployee, isEditing, form]);

  const onSubmit = (data: z.infer<typeof employeeSchema>) => {
    if (shifts.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um turno para o funcionário.",
        variant: "destructive",
      });
      setActiveTab("shifts");
      return;
    }

    if (selectedServices.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um serviço que o funcionário realiza.",
        variant: "destructive",
      });
      setActiveTab("services");
      return;
    }

    onSubmittingChange?.(true);

    const employeeData: EmployeeFormData = {
      name: data.name,
      role: data.role,
      shifts,
      services: selectedServices,
    };

    console.log("Form submitted:", employeeData);
    
    if (isEditing && employeeId) {
      updateEmployee({ id: employeeId, data: employeeData }, {
        onSuccess: () => {
          onSubmittingChange?.(false);
          onSuccess?.();
        },
        onError: () => {
          onSubmittingChange?.(false);
        }
      });
    } else {
      createEmployee(employeeData, {
        onSuccess: () => {
          onSubmittingChange?.(false);
          onSuccess?.();
        },
        onError: () => {
          onSubmittingChange?.(false);
        }
      });
    }
  };

  const goToNextStep = () => {
    if (activeTab === "info") {
      const isValid = form.trigger(["name", "role"]);
      if (isValid) {
        setActiveTab("shifts");
      }
    } else if (activeTab === "shifts") {
      if (shifts.length === 0) {
        toast({
          title: "Erro",
          description: "Adicione pelo menos um turno para o funcionário.",
          variant: "destructive",
        });
        return;
      }
      setActiveTab("services");
    } else if (activeTab === "services") {
      if (selectedServices.length === 0) {
        toast({
          title: "Erro",
          description: "Selecione pelo menos um serviço que o funcionário realiza.",
          variant: "destructive",
        });
        return;
      }
      setActiveTab("access");
    }
  };

  const goToPreviousStep = () => {
    if (activeTab === "shifts") {
      setActiveTab("info");
    } else if (activeTab === "services") {
      setActiveTab("shifts");
    } else if (activeTab === "access") {
      setActiveTab("services");
    }
  };

  return {
    form,
    activeTab,
    setActiveTab,
    shifts,
    setShifts,
    selectedServices,
    setSelectedServices,
    isLoadingEmployee,
    isEditing,
    isCreating,
    isUpdating,
    existingEmployee,
    onSubmit,
    goToNextStep,
    goToPreviousStep,
  };
};
