
import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { useServices, useServiceById } from "@/hooks/useServices";
import { ServiceFormData } from "@/types/service";

// Validation schema with zod
const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  description: z.string().optional(),
  price: z.number().min(0, {
    message: "O preço deve ser um valor positivo.",
  }),
  duration: z.number().min(1, {
    message: "A duração deve ser de pelo menos 1 minuto.",
  }),
  multipleAttendees: z.boolean().default(false),
  maxAttendees: z.number().min(2).optional(),
  isActive: z.boolean().default(true),
});

interface ServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId?: string;
}

const ServiceDialog: React.FC<ServiceDialogProps> = ({ open, onOpenChange, serviceId }) => {
  const isEditing = serviceId !== undefined;
  const { data: service, isLoading: isServiceLoading } = useServiceById(serviceId);
  const { createService, updateService, isCreating, isUpdating } = useServices();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      duration: 30,
      multipleAttendees: false,
      maxAttendees: 2,
      isActive: true,
    },
  });

  // Update form values when service data is loaded
  useEffect(() => {
    if (service && isEditing) {
      form.reset({
        name: service.name,
        description: service.description || "",
        price: service.price,
        duration: service.duration,
        multipleAttendees: service.multipleAttendees,
        maxAttendees: service.maxAttendees || 2,
        isActive: service.isActive,
      });
    } else if (!isEditing) {
      form.reset({
        name: "",
        description: "",
        price: 0,
        duration: 30,
        multipleAttendees: false,
        maxAttendees: 2,
        isActive: true,
      });
    }
  }, [service, form, isEditing]);

  // Atualiza o campo maxAttendees com o valor padrão quando multipleAttendees muda
  useEffect(() => {
    const multipleAttendees = form.watch('multipleAttendees');
    if (!multipleAttendees) {
      form.setValue('maxAttendees', undefined);
    } else if (!form.watch('maxAttendees')) {
      form.setValue('maxAttendees', 2);
    }
  }, [form.watch('multipleAttendees')]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const serviceData: ServiceFormData = {
        name: values.name,
        description: values.description,
        price: values.price,
        duration: values.duration,
        multipleAttendees: values.multipleAttendees,
        maxAttendees: values.multipleAttendees ? values.maxAttendees : undefined,
        isActive: values.isActive,
      };

      if (isEditing && serviceId) {
        await updateService({ id: serviceId, data: serviceData });
        toast.success("Serviço atualizado com sucesso!");
      } else {
        await createService(serviceData);
        toast.success("Serviço cadastrado com sucesso!");
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
      toast.error(
        isEditing
          ? "Erro ao atualizar serviço. Tente novamente."
          : "Erro ao cadastrar serviço. Tente novamente."
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
        </DialogHeader>
        
        {isServiceLoading && isEditing ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço (R$)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duração (minutos)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1"
                          placeholder="30"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
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
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="multipleAttendees"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Atendimentos múltiplos</FormLabel>
                      <FormDescription>
                        Permite que mais de uma pessoa seja atendida ao mesmo tempo.
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
              
              {form.watch('multipleAttendees') && (
                <FormField
                  control={form.control}
                  name="maxAttendees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número máximo de pessoas</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={2}
                          {...field}
                          value={field.value || 2}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Quantas pessoas podem ser atendidas simultaneamente.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Serviço Ativo</FormLabel>
                      <FormDescription>
                        Serviços ativos podem ser agendados por clientes.
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
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={isCreating || isUpdating}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={isCreating || isUpdating}
                >
                  {(isCreating || isUpdating) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEditing ? "Atualizar" : "Cadastrar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ServiceDialog;
