
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeeFormData, Shift } from "@/types/employee";
import { useEmployees, useEmployeeById } from "@/hooks/useEmployees";
import ShiftSelector from "./ShiftSelector";
import ServiceSelector from "./ServiceSelector";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

// Definir esquema de validação para o funcionário
const employeeSchema = z.object({
  name: z.string().min(1, { message: "O nome é obrigatório" }),
  role: z.string().min(1, { message: "O cargo é obrigatório" }),
});

interface EmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId?: string;
}

const EmployeeDialog: React.FC<EmployeeDialogProps> = ({
  open,
  onOpenChange,
  employeeId,
}) => {
  const { createEmployee, updateEmployee, isCreating, isUpdating } = useEmployees();
  const { data: employee, isLoading: isEmployeeLoading } = useEmployeeById(employeeId);
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

  // Atualizar formulário quando os dados do funcionário forem carregados
  useEffect(() => {
    if (employee && isEditing) {
      form.reset({
        name: employee.name,
        role: employee.role,
      });
      setShifts(employee.shifts);
      setSelectedServices(employee.services);
    } else if (!isEditing) {
      form.reset({
        name: "",
        role: "",
      });
      setShifts([]);
      setSelectedServices([]);
    }
  }, [employee, form, isEditing]);

  const onSubmit = async (data: z.infer<typeof employeeSchema>) => {
    if (shifts.length === 0) {
      toast.error("Adicione pelo menos um turno para o funcionário.");
      setActiveTab("shifts");
      return;
    }

    if (selectedServices.length === 0) {
      toast.error("Selecione pelo menos um serviço que o funcionário realiza.");
      setActiveTab("services");
      return;
    }

    // Montar dados completos do funcionário
    const employeeData: EmployeeFormData = {
      name: data.name,
      role: data.role,
      shifts,
      services: selectedServices,
    };

    try {
      if (isEditing && employeeId) {
        await updateEmployee({ id: employeeId, data: employeeData });
        toast.success("Funcionário atualizado com sucesso!");
      } else {
        await createEmployee(employeeData);
        toast.success("Funcionário adicionado com sucesso!");
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar funcionário:", error);
      toast.error(
        isEditing
          ? "Erro ao atualizar funcionário. Tente novamente."
          : "Erro ao adicionar funcionário. Tente novamente."
      );
    }
  };

  const goToNextTab = async () => {
    if (activeTab === "info") {
      const isValid = await form.trigger(["name", "role"]);
      if (isValid) {
        setActiveTab("shifts");
      }
    } else if (activeTab === "shifts") {
      if (shifts.length === 0) {
        toast.error("Adicione pelo menos um turno para o funcionário.");
        return;
      }
      setActiveTab("services");
    }
  };

  const goToPreviousTab = () => {
    if (activeTab === "shifts") {
      setActiveTab("info");
    } else if (activeTab === "services") {
      setActiveTab("shifts");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(state) => {
      // Prevent dialog from closing during form submission
      if (isCreating || isUpdating) return;
      onOpenChange(state);
    }}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden">
        <DialogHeader className="sticky top-0 z-40 bg-background pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle>
              {isEditing ? "Editar Funcionário" : "Novo Funcionário"}
            </DialogTitle>
            <DialogClose className="z-50 relative">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        {isEmployeeLoading && isEditing ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ScrollArea className="max-h-[calc(90vh-10rem)]">
            <div className="px-1"> {/* Add padding to prevent scroll issues */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 sticky top-0 z-10">
                  <TabsTrigger value="info">Informações</TabsTrigger>
                  <TabsTrigger value="shifts">Turnos</TabsTrigger>
                  <TabsTrigger value="services">Serviços</TabsTrigger>
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
                    </form>
                  </Form>

                  <div className="flex justify-end space-x-4 mt-6">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={goToNextTab}>
                      Próximo
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="shifts" className="pt-4 pb-2">
                  <ShiftSelector shifts={shifts} onChange={setShifts} />
                  <div className="mt-6 flex justify-end space-x-4">
                    <Button variant="outline" onClick={goToPreviousTab}>
                      Voltar
                    </Button>
                    <Button onClick={goToNextTab}>
                      Próximo
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="services" className="pt-4 pb-2">
                  <ServiceSelector
                    selectedServiceIds={selectedServices}
                    onChange={setSelectedServices}
                  />
                  <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={goToPreviousTab}>
                      Voltar
                    </Button>
                    <Button 
                      onClick={form.handleSubmit(onSubmit)}
                      disabled={isCreating || isUpdating}
                    >
                      {(isCreating || isUpdating) && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {isEditing ? "Atualizar" : "Adicionar"} Funcionário
                    </Button>
                  </DialogFooter>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeDialog;
