
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
import { Search, Check, CircleHelp, ArrowRightLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useServices } from "@/hooks/useServices";

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
  onClose?: () => void;
}

const ServicePackageForm: React.FC<ServicePackageFormProps> = ({
  servicePackage,
  onFormChange,
  onClose
}) => {
  const { toast } = useToast();
  const { services } = useServices();
  const isEditing = Boolean(servicePackage?.id);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>(
    servicePackage?.services || []
  );
  const [editMode, setEditMode] = useState<"discount" | "price">("discount");

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

  // Set up form change watcher
  useEffect(() => {
    if (onFormChange) {
      const subscription = form.watch(() => onFormChange());
      return () => subscription.unsubscribe();
    }
  }, [form, onFormChange]);

  // Notify parent when selected services change
  useEffect(() => {
    if (onFormChange) {
      onFormChange();
    }
  }, [selectedServices, onFormChange]);

  // Filtrar serviços com base no termo de pesquisa
  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular preço total dos serviços selecionados
  const totalPrice = selectedServices.reduce((total, serviceId) => {
    const service = services.find((s) => s.id === serviceId);
    return total + (service?.price || 0);
  }, 0);

  // Monitorar alterações nos campos de preço e desconto
  const watchDiscount = form.watch("discount");
  const watchPrice = form.watch("price");

  // Calcular desconto e preço final com base no modo de edição
  useEffect(() => {
    if (selectedServices.length === 0) return;
    
    if (editMode === "discount") {
      // Se o usuário estiver editando o desconto, calcular o preço final
      const discountAmount = (totalPrice * watchDiscount) / 100;
      const finalPrice = totalPrice - discountAmount;
      form.setValue("price", Number(finalPrice.toFixed(2)));
    } else {
      // Se o usuário estiver editando o preço final, calcular o desconto
      const discountPercent = ((totalPrice - watchPrice) / totalPrice) * 100;
      form.setValue("discount", Number(Math.max(0, Math.min(100, discountPercent)).toFixed(2)));
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

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (selectedServices.length < 2) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos 2 serviços para criar um pacote.",
        variant: "destructive",
      });
      return;
    }

    // Ensure all required fields are explicitly set in the package data
    const packageData: ServicePackageFormData = {
      name: values.name,
      description: values.description || "",
      services: selectedServices,
      price: values.price,
      discount: values.discount,
      showInOnlineBooking: values.showInOnlineBooking,
    };

    console.log("Form submitted:", packageData);

    // Simulando sucesso após envio
    setTimeout(() => {
      toast({
        title: isEditing ? "Pacote atualizado!" : "Pacote cadastrado!",
        description: `${values.name} foi ${
          isEditing ? "atualizado" : "cadastrado"
        } com sucesso.`,
      });
      if (onClose) onClose();
    }, 1000);
  };

  // Alternar entre modos de edição (desconto ou preço)
  const toggleEditMode = () => {
    setEditMode(editMode === "discount" ? "price" : "discount");
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Serviços Disponíveis</h3>
                <div className="relative mb-2">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar serviços..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <ScrollArea className="h-96 border rounded-md">
                  <div className="p-2 space-y-1">
                    {filteredServices.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => toggleService(service.id)}
                        className={`flex items-center justify-between p-2 cursor-pointer rounded-md ${
                          selectedServices.includes(service.id)
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted"
                        }`}
                      >
                        <div>
                          <div>{service.name}</div>
                          <div className="text-xs text-muted-foreground">
                            R$ {service.price.toFixed(2)} • {service.duration} min
                          </div>
                        </div>
                        {selectedServices.includes(service.id) && (
                          <Check className="h-4 w-4" />
                        )}
                      </div>
                    ))}
                    {filteredServices.length === 0 && (
                      <div className="p-4 text-center text-muted-foreground">
                        Nenhum serviço encontrado.
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium mb-4">Informações do Pacote</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
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
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Resumo do pacote */}
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <h4 className="font-medium">Resumo do Pacote</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Serviços:</span> {selectedServices.length}
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Valor Total:</span> R$ {totalPrice.toFixed(2)}
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Desconto:</span> {typeof form.watch("discount") === 'number' ? form.watch("discount").toFixed(2) : '0.00'}%
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Valor Final:</span> R$ {typeof form.watch("price") === 'number' ? form.watch("price").toFixed(2) : '0.00'}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Modo de Edição:</label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={toggleEditMode}
                        className="flex items-center gap-2"
                      >
                        {editMode === "discount" ? "Desconto %" : "Preço Final R$"}
                        <ArrowRightLeft className="h-3.5 w-3.5" />
                      </Button>
                    </div>

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
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium mb-2">Valores Calculados:</div>
                    {editMode === "discount" ? (
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preço Final Calculado (R$)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                disabled
                                {...field}
                                value={typeof field.value === 'number' ? field.value.toFixed(2) : '0.00'}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <FormField
                        control={form.control}
                        name="discount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Desconto Calculado (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                disabled
                                {...field}
                                value={typeof field.value === 'number' ? field.value.toFixed(2) : '0.00'}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="showInOnlineBooking"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Exibir na Agenda Online</FormLabel>
                        <FormDescription>
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
                
                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onClose && onClose()}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {isEditing ? "Atualizar" : "Criar"} Pacote
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServicePackageForm;
