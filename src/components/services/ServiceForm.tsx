
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { ServiceFormData } from "@/types/service";
import { useServiceById, useServices } from "@/hooks/useServices";

// Form schema with zod
const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, {
    message: "O preço não pode ser negativo.",
  }),
  duration: z.coerce.number().min(5, {
    message: "A duração deve ser de pelo menos 5 minutos.",
  }),
  multipleAttendees: z.boolean().default(false),
  maxAttendees: z.coerce.number().min(2, {
    message: "O número máximo de pessoas deve ser pelo menos 2.",
  }).optional().refine(val => val === undefined || val >= 2, {
    message: "O número máximo de pessoas deve ser pelo menos 2.",
  }),
  isActive: z.boolean().default(true),
});

const ServiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: service, isLoading: isServiceLoading } = useServiceById(id);
  const { createService, updateService, isCreating, isUpdating } = useServices();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      duration: 30,
      multipleAttendees: false,
      maxAttendees: undefined,
      isActive: true,
    },
  });

  // Enable/disable maxAttendees field based on multipleAttendees toggle
  const multipleAttendees = form.watch("multipleAttendees");

  // Load service data if editing
  useEffect(() => {
    if (service) {
      form.reset({
        name: service.name,
        description: service.description || "",
        price: service.price,
        duration: service.duration,
        multipleAttendees: service.multipleAttendees,
        maxAttendees: service.maxAttendees,
        isActive: service.isActive,
      });
    }
  }, [service, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      const serviceData: ServiceFormData = {
        name: values.name,
        description: values.description,
        price: values.price,
        duration: values.duration,
        multipleAttendees: values.multipleAttendees,
        maxAttendees: values.multipleAttendees ? values.maxAttendees : undefined,
        isActive: values.isActive,
      };

      if (id) {
        await updateService({ id, data: serviceData });
      } else {
        await createService(serviceData);
      }
      
      navigate("/dashboard/services");
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {isServiceLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do serviço" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descrição do serviço..."
                        className="resize-none"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duração (minutos)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="5"
                          step="5"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Tempo necessário para realizar o serviço
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Ativo</FormLabel>
                        <FormDescription>
                          Serviço disponível para agendamento
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="multipleAttendees"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Múltiplos Atendimentos</FormLabel>
                        <FormDescription>
                          Permite atender vários clientes ao mesmo tempo
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {multipleAttendees && (
                  <FormField
                    control={form.control}
                    name="maxAttendees"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Máximo de Pessoas</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="2"
                            step="1"
                            placeholder="Número máximo de atendimentos"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => {
                              const value = e.target.value === "" ? undefined : parseInt(e.target.value);
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Quantidade máxima de pessoas atendidas simultaneamente
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard/services")}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting || isCreating || isUpdating}
                >
                  {(isSubmitting || isCreating || isUpdating) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {id ? "Atualizar" : "Cadastrar"} Serviço
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceForm;
