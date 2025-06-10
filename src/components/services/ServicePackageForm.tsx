import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Service, ServicePackage, ServicePackageFormData } from "@/types/service";
import { Search, Check, ArrowRightLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useServices } from "@/hooks/useServices";
import { useServicePackages } from "@/hooks/useServicePackages";

// Validação com zod
const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, {
    message: "O preço não pode ser negativo.",
  }),
  discount: z.coerce.number().min(0).max(100, {
    message: "O desconto deve estar entre 0 e 100%.",
  }),
  showInOnlineBooking: z.boolean().default(true),
});

interface ServicePackageFormProps {
  servicePackage?: ServicePackage | null;
  onFormChange?: () => void;
  onFormInitialized?: () => void;
  onClose?: () => void;
}

const ServicePackageForm: React.FC<ServicePackageFormProps> = ({
  servicePackage,
  onFormChange,
  onFormInitialized,
  onClose
}) => {
  const { toast } = useToast();
  const { services } = useServices();
  const { createPackage, updatePackage, isCreating, isUpdating } = useServicePackages();
  const isEditing = Boolean(servicePackage?.id);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>(
    servicePackage?.services || []
  );
  const [editMode, setEditMode] = useState<"discount" | "price">("discount");
  const [initialized, setInitialized] = useState(false);

  // Filter out system services
  const filteredServicesList = services.filter(service => 
    !service.name.includes("(Sistema)")
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: servicePackage
      ? {
          name: servicePackage.name,
          description: servicePackage.description || "",
          price: servicePackage.price,
          discount: servicePackage.discount,
          showInOnlineBooking: servicePackage.showInOnlineBooking,
        }
      : {
          name: "",
          description: "",
          price: 0,
          discount: 0,
          showInOnlineBooking: true,
        },
  });

  // Initialize form and notify parent when ready
  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      if (onFormInitialized) {
        onFormInitialized();
      }
    }
  }, [initialized, onFormInitialized]);

  // Set up form change watcher only after initialization
  useEffect(() => {
    if (onFormChange && initialized) {
      const subscription = form.watch(() => onFormChange());
      return () => subscription.unsubscribe();
    }
  }, [form, onFormChange, initialized]);

  // Notify parent when selected services change only after initialization
  useEffect(() => {
    if (onFormChange && initialized) {
      onFormChange();
    }
  }, [selectedServices, onFormChange, initialized]);

  // Filtrar serviços com base no termo de pesquisa
  const filteredServices = filteredServicesList.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular preço total dos serviços selecionados
  const totalPrice = selectedServices.reduce((total, serviceId) => {
    const service = services.find((s) => s.id === serviceId);
    return total + (service?.price || 0);
  }, 0);

  // Calculate total duration
  const totalDuration = selectedServices.reduce((total, serviceId) => {
    const service = services.find((s) => s.id === serviceId);
    return total + (service?.duration || 0);
  }, 0);

  // Monitorar alterações nos campos de preço e desconto
  const watchDiscount = form.watch("discount");
  const watchPrice = form.watch("price");

  // Calculate values based on edit mode
  useEffect(() => {
    if (selectedServices.length === 0) return;
    
    if (editMode === "discount") {
      // Se o usuário estiver editando o desconto, calcular o preço final
      const discountAmount = (totalPrice * watchDiscount) / 100;
      const finalPrice = totalPrice - discountAmount;
      form.setValue("price", Number(finalPrice.toFixed(2)), { shouldDirty: true });
    } else {
      // Se o usuário estiver editando o preço final, calcular o desconto
      if (totalPrice > 0) {
        const discountPercent = ((totalPrice - watchPrice) / totalPrice) * 100;
        form.setValue("discount", Number(Math.max(0, Math.min(100, discountPercent)).toFixed(2)), { shouldDirty: true });
      }
    }
  }, [watchDiscount, watchPrice, totalPrice, editMode, selectedServices.length, form]);

  const toggleService = (serviceId: string) => {
    const isSelected = selectedServices.includes(serviceId);
    if (isSelected) {
      setSelectedServices(selectedServices.filter((id) => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (selectedServices.length < 2) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos 2 serviços para criar um pacote.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Ensure all required fields are explicitly set in the package data
      const packageData: ServicePackageFormData = {
        name: values.name,
        description: values.description || "",
        services: selectedServices,
        price: values.price,
        discount: values.discount,
        showInOnlineBooking: values.showInOnlineBooking,
        totalDuration,
      };

      console.log("Form submitted:", packageData);

      if (isEditing && servicePackage?.id) {
        await updatePackage({ id: servicePackage.id, data: packageData });
      } else {
        await createPackage(packageData);
      }

      if (onClose) onClose();
    } catch (error) {
      console.error("Error submitting package:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o pacote. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Alternar entre modos de edição (desconto ou preço)
  const toggleEditMode = () => {
    setEditMode(editMode === "discount" ? "price" : "discount");
  };

  // Safe toFixed function that checks if the value is a number first
  const safeToFixed = (value: any, digits: number = 2) => {
    return typeof value === 'number' ? value.toFixed(digits) : '0.00';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Service selection panel */}
      <div className="md:col-span-1 bg-muted/30 p-2 sm:p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-2 sm:mb-4">Selecionar Serviços</h3>
        <div className="relative mb-3">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar serviços..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <ScrollArea className="h-[260px] pr-3">
          <div className="space-y-1.5">
            {filteredServices.map((service) => {
              const isSelected = selectedServices.includes(service.id);
              return (
                <div
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors",
                    isSelected
                      ? "bg-primary/10 text-primary border border-primary/30"
                      : "hover:bg-muted border border-transparent"
                  )}
                >
                  <div>
                    <div className="font-medium text-sm sm:text-base">{service.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>R$ {service.price.toFixed(2)}</span>
                      <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground"></span>
                      <span>{service.duration} min</span>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 flex-shrink-0" />
                  )}
                </div>
              );
            })}
            {filteredServices.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">
                Nenhum serviço encontrado.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      
      {/* Package details form */}
      <div className="md:col-span-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <Card className="shadow-sm">
                <CardContent className="pt-4 px-4 pb-4">
                  <h3 className="text-lg font-medium mb-3">Informações do Pacote</h3>
                  
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Pacote</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do pacote" {...field} />
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
                              placeholder="Descrição do pacote..."
                              className="resize-none h-16"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm">
                <CardContent className="pt-4 px-4 pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium">Precificação</h3>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={toggleEditMode}
                      className="flex items-center gap-2"
                    >
                      <span>{editMode === "discount" ? "Desconto %" : "Preço Final R$"}</span>
                      <ArrowRightLeft className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Valor Original</div>
                      <div className="font-medium">R$ {safeToFixed(totalPrice)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Desconto</div>
                      <div className="font-medium">{safeToFixed(form.watch("discount"))}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Valor com Desconto</div>
                      <div className="font-medium">R$ {safeToFixed(form.watch("price"))}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Economia do Cliente</div>
                      <div className="font-medium">R$ {safeToFixed(totalPrice - form.watch("price"))}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {editMode === "discount" ? (
                      <FormField
                        control={form.control}
                        name="discount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Desconto (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preço Final (R$)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max={totalPrice}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <FormField
                      control={form.control}
                      name="showInOnlineBooking"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Exibir na Agenda Online</FormLabel>
                            <FormDescription className="text-xs">
                              Tornar este pacote disponível para agendamento online
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
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-end space-x-4 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onClose && onClose()}
                disabled={isCreating || isUpdating}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={isCreating || isUpdating}
              >
                {isCreating || isUpdating ? "Salvando..." : (isEditing ? "Atualizar" : "Criar")} Pacote
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ServicePackageForm;

</edits_to_apply>
