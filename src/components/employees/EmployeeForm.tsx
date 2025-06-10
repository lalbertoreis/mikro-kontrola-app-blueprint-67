
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { EmployeeFormData, Shift } from "@/types/employee";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ShiftSelector from "./ShiftSelector";
import ServiceSelector from "./ServiceSelector";
import EmployeeAccessTab from "./EmployeeAccessTab";
import { useToast } from "@/components/ui/use-toast";
import { useEmployees, useEmployeeById } from "@/hooks/useEmployees";

// Definir esquema de validação para o funcionário
const employeeSchema = z.object({
  name: z.string().min(1, { message: "O nome é obrigatório" }),
  role: z.string().min(1, { message: "O cargo é obrigatório" }),
});

interface EmployeeFormProps {
  employeeId?: string;
  onSuccess: () => void;
  onSubmittingChange?: (isSubmitting: boolean) => void;
}

const EmployeeForm = ({ employeeId, onSuccess, onSubmittingChange }: EmployeeFormProps) => {
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

  // Carregar dados do funcionário quando editando
  useEffect(() => {
    if (existingEmployee && isEditing) {
      form.reset({
        name: existingEmployee.name,
        role: existingEmployee.role,
      });
      setShifts(existingEmployee.shifts || []);
      setSelectedServices(existingEmployee.services || []);
    } else if (!isEditing) {
      // Reset form when creating new employee
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

    // Notificar que está enviando
    onSubmittingChange?.(true);

    // Montar dados completos do funcionário
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
          onSuccess();
        },
        onError: () => {
          onSubmittingChange?.(false);
        }
      });
    } else {
      createEmployee(employeeData, {
        onSuccess: () => {
          onSubmittingChange?.(false);
          onSuccess();
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

  if (isLoadingEmployee && isEditing) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Carregando dados do funcionário...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="shifts">Turnos</TabsTrigger>
            <TabsTrigger value="services">Serviços</TabsTrigger>
            <TabsTrigger value="access">Acesso</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="pt-4 pb-2">
            <Form {...form}>
              <form className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do funcionário" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo</FormLabel>
                      <FormControl>
                        <Input placeholder="Cargo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4">
                  <Button variant="outline" type="button" onClick={() => onSuccess()}>
                    Cancelar
                  </Button>
                  <Button type="button" onClick={goToNextStep}>
                    Próximo
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="shifts" className="pt-4 pb-2">
            <ShiftSelector shifts={shifts} onChange={setShifts} />
            <div className="mt-6 flex justify-end space-x-4">
              <Button variant="outline" type="button" onClick={goToPreviousStep}>
                Voltar
              </Button>
              <Button type="button" onClick={goToNextStep}>
                Próximo
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="services" className="pt-4 pb-2">
            <ServiceSelector
              selectedServiceIds={selectedServices}
              onChange={setSelectedServices}
            />
            <div className="mt-6 flex justify-end space-x-4">
              <Button variant="outline" type="button" onClick={goToPreviousStep}>
                Voltar
              </Button>
              <Button type="button" onClick={goToNextStep}>
                Próximo
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="access" className="pt-4 pb-2">
            <EmployeeAccessTab employeeId={employeeId} />
            <div className="mt-6 flex justify-end space-x-4">
              <Button variant="outline" type="button" onClick={goToPreviousStep}>
                Voltar
              </Button>
              <Button 
                type="button" 
                onClick={form.handleSubmit(onSubmit)}
                disabled={isCreating || isUpdating}
              >
                {isCreating || isUpdating ? "Salvando..." : (isEditing ? "Atualizar" : "Adicionar")} Funcionário
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EmployeeForm;
