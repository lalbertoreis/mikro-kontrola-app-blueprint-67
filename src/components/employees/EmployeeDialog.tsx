
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

  // Reset form and data when dialog opens/closes or employeeId changes
  useEffect(() => {
    if (open) {
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
    }
  }, [employee, form, isEditing, open, employeeId]);

  const onSubmit = async (data: z.infer<typeof employeeSchema>) => {
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
      } else {
        await createEmployee(employeeData);
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar funcionário:", error);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {isEditing ? "Editar Funcionário" : "Novo Funcionário"}
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 rounded-full"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {isEmployeeLoading && isEditing ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ScrollArea className="max-h-[calc(90vh-10rem)]">
            <div className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6 rounded-lg bg-slate-100">
                  <TabsTrigger value="info" className="rounded-md">Informações</TabsTrigger>
                  <TabsTrigger value="shifts" className="rounded-md">Turnos</TabsTrigger>
                  <TabsTrigger value="services" className="rounded-md">Serviços</TabsTrigger>
                </TabsList>

                <TabsContent value="info">
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
                            <FormLabel>Função</FormLabel>
                            <FormControl>
                              <Input placeholder="Cargo/função" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end">
                        <Button 
                          onClick={form.handleSubmit(onSubmit)} 
                          disabled={isCreating || isUpdating}
                          className="bg-primary hover:bg-primary/90"
                        >
                          {(isCreating || isUpdating) && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Atualizar
                        </Button>
                      </div>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="shifts">
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium">Turnos de Trabalho</h3>
                    <ShiftSelector 
                      shifts={shifts} 
                      onChange={setShifts} 
                      showInlineErrors={true}
                    />
                    <div className="flex justify-end">
                      <Button 
                        onClick={form.handleSubmit(onSubmit)} 
                        disabled={isCreating || isUpdating}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {(isCreating || isUpdating) && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Atualizar Funcionário
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="services">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium">Serviços Oferecidos</h3>
                      <p className="text-sm text-muted-foreground">
                        Selecione os serviços que este funcionário pode realizar.
                      </p>
                    </div>
                    <ServiceSelector
                      selectedServiceIds={selectedServices}
                      onChange={setSelectedServices}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button 
                        onClick={handleClose}
                        variant="outline"
                      >
                        Voltar
                      </Button>
                      <Button 
                        onClick={form.handleSubmit(onSubmit)} 
                        disabled={isCreating || isUpdating}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {(isCreating || isUpdating) && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Atualizar Funcionário
                      </Button>
                    </div>
                  </div>
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
