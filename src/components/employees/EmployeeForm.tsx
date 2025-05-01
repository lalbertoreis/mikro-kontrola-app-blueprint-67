import React, { useState } from "react";
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
import { useToast } from "@/components/ui/use-toast";

// Definir esquema de validação para o funcionário
const employeeSchema = z.object({
  name: z.string().min(1, { message: "O nome é obrigatório" }),
  role: z.string().min(1, { message: "O cargo é obrigatório" }),
});

interface EmployeeFormProps {
  employeeId?: string;
  onSuccess: () => void;
}

const EmployeeForm = ({ employeeId, onSuccess }: EmployeeFormProps) => {
  const { toast } = useToast();
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

    // Montar dados completos do funcionário - ensuring name and role are required
    const employeeData: EmployeeFormData = {
      name: data.name,
      role: data.role,
      shifts,
      services: selectedServices,
    };

    console.log("Form submitted:", employeeData);
    
    // Simulando sucesso após envio
    setTimeout(() => {
      toast({
        title: isEditing ? "Funcionário atualizado" : "Funcionário adicionado",
        description: isEditing 
          ? "As informações do funcionário foram atualizadas com sucesso." 
          : "O funcionário foi adicionado com sucesso.",
      });
      onSuccess();
    }, 1000);
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
    }
  };

  const goToPreviousStep = () => {
    if (activeTab === "shifts") {
      setActiveTab("info");
    } else if (activeTab === "services") {
      setActiveTab("shifts");
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
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
              <Button type="button" onClick={form.handleSubmit(onSubmit)}>
                {isEditing ? "Atualizar" : "Adicionar"} Funcionário
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EmployeeForm;
