import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { Service, ServiceFormData } from "@/types/service";
import { useServices } from "@/hooks/useServices";

// Validação com zod
const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome do serviço deve ter pelo menos 2 caracteres.",
  }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, {
    message: "O preço deve ser um valor positivo.",
  }),
  duration: z.coerce.number().min(1, {
    message: "A duração deve ser pelo menos 1 minuto.",
  }),
  multipleAttendees: z.boolean().default(false),
  maxAttendees: z.coerce.number().min(1).optional(),
  isActive: z.boolean().default(true),
});

interface ServiceFormProps {
  service?: Service | null;
  onFormChange?: () => void;
  onClose?: () => void;
  onSuccess?: () => void;
  onSubmittingChange?: (isSubmitting: boolean) => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({
  service,
  onFormChange,
  onClose,
  onSuccess,
  onSubmittingChange
}) => {
  const navigate = useNavigate();
  const { createService, updateService, isCreating, isUpdating } = useServices();
  const isEditing = Boolean(service?.id);
  const isDialogMode = Boolean(onClose);
  const isSubmitting = isCreating || isUpdating;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: service
      ? {
          name: service.name,
          description: service.description || "",
          price: service.price,
          duration: service.duration,
          multipleAttendees: service.multipleAttendees,
          maxAttendees: service.maxAttendees,
          isActive: service.isActive,
        }
      : {
          name: "",
          description: "",
          price: 0,
          duration: 60,
          multipleAttendees: false,
          maxAttendees: 1,
          isActive: true,
        },
  });

  // Setup form change watcher
  useEffect(() => {
    if (onFormChange) {
      const subscription = form.watch(() => onFormChange());
      return () => subscription.unsubscribe();
    }
  }, [form, onFormChange]);

  // Notify parent about submitting state changes
  useEffect(() => {
    if (onSubmittingChange) {
      onSubmittingChange(isSubmitting);
    }
  }, [isSubmitting, onSubmittingChange]);

  // Watch for multipleAttendees changes to conditionally show maxAttendees
  const multipleAttendees = form.watch("multipleAttendees");

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

      if (isEditing && service?.id) {
        await updateService({ id: service.id, data: serviceData });
        toast.success("Serviço atualizado com sucesso!");
      } else {
        await createService(serviceData);
        toast.success("Serviço cadastrado com sucesso!");
      }
      
      if (isDialogMode && onSuccess) {
        onSuccess();
      } else {
        navigate("/dashboard/services");
      }
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço (R$)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
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
                <FormLabel>Duração (min)</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="multipleAttendees"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Múltiplos Atendimentos</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Permitir atendimento de múltiplos clientes ao mesmo tempo
                </div>
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
                <FormLabel>Máximo de Clientes</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
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
                <FormLabel>Serviço Ativo</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Disponibilizar este serviço para agendamentos
                </div>
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
        
        <div className="flex justify-end space-x-4 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={isDialogMode && onClose ? onClose : () => navigate("/dashboard/services")}
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
        </div>
      </form>
    </Form>
  );
};

export default ServiceForm;
