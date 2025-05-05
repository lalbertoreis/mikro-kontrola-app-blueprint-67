
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { Service, ServicePackageFormData } from "@/types/service";
import { Search, Check, Loader2, Clock, X, CircleHelp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useServices } from "@/hooks/useServices";
import { useServicePackages, useServicePackageById } from "@/hooks/useServicePackages";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface ServicePackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageId?: string;
}

const ServicePackageDialog: React.FC<ServicePackageDialogProps> = ({
  open,
  onOpenChange,
  packageId,
}) => {
  const isEditing = Boolean(packageId);
  const { services } = useServices();
  const { data: packageData, isLoading: isLoadingPackage } = useServicePackageById(packageId);
  const { createPackage, updatePackage, isCreating, isUpdating } = useServicePackages();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [editMode, setEditMode] = useState<"discount" | "price">("discount");
  const [calculatingDiscount, setCalculatingDiscount] = useState(true);
  
  const isLoading = isCreating || isUpdating || isLoadingPackage;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      discount: 0,
      showInOnlineBooking: true,
    },
  });

  // Load data when editing
  useEffect(() => {
    if (open) {
      if (isEditing && packageData) {
        form.reset({
          name: packageData.name,
          description: packageData.description || "",
          price: packageData.price,
          discount: packageData.discount,
          showInOnlineBooking: packageData.showInOnlineBooking,
        });
        setSelectedServices(packageData.services);
      } else if (!isEditing) {
        form.reset({
          name: "",
          description: "",
          price: 0,
          discount: 0,
          showInOnlineBooking: true,
        });
        setSelectedServices([]);
      }
    }
  }, [isEditing, packageData, form, open]);

  // Filter services by search term
  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate the total price and duration of selected services
  const totalPrice = selectedServices.reduce((total, serviceId) => {
    const service = services.find((s) => s.id === serviceId);
    return total + (service?.price || 0);
  }, 0);

  // Calculate total duration
  const totalDuration = selectedServices.reduce((total, serviceId) => {
    const service = services.find((s) => s.id === serviceId);
    return total + (service?.duration || 0);
  }, 0);

  // Format duration as hours and minutes
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 
      ? `${hours}h${mins > 0 ? ` ${mins}min` : ''}`
      : `${mins}min`;
  };

  // Calculate discount and final price
  const discount = form.watch("discount") || 0;
  const price = form.watch("price") || 0;
  
  // Update price or discount based on edit mode
  useEffect(() => {
    if (selectedServices.length === 0) return;
    
    if (calculatingDiscount) {
      // Se está calculando o desconto, atualize o preço
      const discountAmount = (totalPrice * discount) / 100;
      const finalPrice = totalPrice - discountAmount;
      form.setValue("price", parseFloat(finalPrice.toFixed(2)));
    } else {
      // Se está calculando o preço, atualize o desconto
      const calculatedDiscount = ((totalPrice - price) / totalPrice) * 100;
      const clampedDiscount = Math.min(100, Math.max(0, calculatedDiscount));
      form.setValue("discount", parseFloat(clampedDiscount.toFixed(2)));
    }
  }, [selectedServices, discount, price, totalPrice, calculatingDiscount, form]);

  const toggleService = (serviceId: string) => {
    const isSelected = selectedServices.includes(serviceId);
    if (isSelected) {
      setSelectedServices(selectedServices.filter((id) => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const toggleCalculationMode = () => {
    setCalculatingDiscount(!calculatingDiscount);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (selectedServices.length < 2) {
      toast.error("Selecione pelo menos 2 serviços para criar um pacote.");
      return;
    }

    // Package data
    const packageFormData: ServicePackageFormData = {
      name: values.name,
      description: values.description || "",
      services: selectedServices,
      price: values.price,
      discount: values.discount,
      showInOnlineBooking: values.showInOnlineBooking,
      totalDuration: totalDuration,
    };

    if (isEditing && packageId) {
      updatePackage({ id: packageId, data: packageFormData }, {
        onSuccess: () => {
          onOpenChange(false);
        }
      });
    } else {
      createPackage(packageFormData, {
        onSuccess: () => {
          onOpenChange(false);
        }
      });
    }
  };

  // Safely get the price value for display
  const getFormattedPrice = (): string => {
    const priceValue = form.watch("price");
    // Check if priceValue is a number and not undefined/null
    return typeof priceValue === 'number' ? priceValue.toFixed(2) : '0.00';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] overflow-hidden">
        <DialogHeader className="sticky top-0 z-40 bg-background pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle>
              {isEditing ? "Editar Pacote" : "Novo Pacote de Serviços"}
            </DialogTitle>
            <DialogClose className="z-50 relative">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-h-[75vh] overflow-hidden">
            <div className="md:col-span-1 overflow-hidden flex flex-col">
              <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                <div className="flex-grow-0">
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
                </div>
                
                <ScrollArea className="flex-1 border rounded-md h-[calc(75vh-300px)]">
                  <div className="p-2 space-y-1">
                    {filteredServices.length > 0 ? filteredServices.map((service) => (
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
                    )) : (
                      <div className="p-4 text-center text-muted-foreground">
                        {searchTerm ? "Nenhum serviço encontrado." : "Nenhum serviço disponível."}
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                <div className="flex-grow-0 space-y-2">
                  <h3 className="text-lg font-medium">Serviços Selecionados</h3>
                  {selectedServices.length === 0 ? (
                    <div className="text-muted-foreground p-2 text-center border rounded-md">
                      Nenhum serviço selecionado
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {selectedServices.map((serviceId) => {
                          const service = services.find((s) => s.id === serviceId);
                          return service ? (
                            <Badge key={serviceId} variant="secondary" className="py-1.5">
                              {service.name} (R$ {service.price.toFixed(2)})
                            </Badge>
                          ) : null;
                        })}
                      </div>
                      
                      <div className="border rounded-md p-2 space-y-1 bg-muted/30">
                        <div className="flex justify-between items-center text-sm font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            Tempo total:
                          </span>
                          <span className="text-primary">{formatDuration(totalDuration)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-medium">
                          <span>Valor total:</span>
                          <span>R$ {totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-medium">
                          <span>Valor com desconto:</span>
                          <span className="text-primary">R$ {getFormattedPrice()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2 overflow-hidden flex flex-col">
              <ScrollArea className="h-[calc(75vh-80px)]">
                <div className="pr-4">
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
                      
                      <div className="border rounded-lg p-4 bg-muted/20 space-y-4">
                        <div className="flex justify-between">
                          <h4 className="font-medium">Preço e Descontos</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={toggleCalculationMode}
                            className="h-6 p-1 flex items-center gap-1"
                          >
                            <span className="text-xs">Alterar modo: </span>
                            <span className="text-xs font-medium">
                              {calculatingDiscount ? 'Desconto → Preço' : 'Preço → Desconto'}
                            </span>
                          </Button>
                        </div>
                      
                        <div className="grid grid-cols-2 gap-4">
                          {calculatingDiscount ? (
                            <>
                              <FormField
                                control={form.control}
                                name="discount"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                      <span>Desconto (%)</span>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <CircleHelp className="h-4 w-4 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Defina o percentual de desconto</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </FormLabel>
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
                                        disabled
                                        {...field}
                                        value={typeof field.value === 'number' ? field.value.toFixed(2) : '0.00'}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </>
                          ) : (
                            <>
                              <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                      <span>Preço Final (R$)</span>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <CircleHelp className="h-4 w-4 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Defina o preço final do pacote</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </FormLabel>
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
                              
                              <FormField
                                control={form.control}
                                name="discount"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Desconto calculado (%)</FormLabel>
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
                            </>
                          )}
                        </div>
                        
                        <div className="pt-2">
                          <p className="text-xs text-muted-foreground">
                            Valor original: R$ {totalPrice.toFixed(2)} • Economia: R$ {(totalPrice - price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="showInOnlineBooking"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Mostrar na agenda online</FormLabel>
                              <div className="text-sm text-muted-foreground">
                                Pacote estará disponível para agendamento online
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
                    </form>
                  </Form>
                </div>
              </ScrollArea>
              
              <DialogFooter className="pt-4 border-t mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isLoading || selectedServices.length < 2}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? "Atualizar" : "Criar"} Pacote
                </Button>
              </DialogFooter>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ServicePackageDialog;
