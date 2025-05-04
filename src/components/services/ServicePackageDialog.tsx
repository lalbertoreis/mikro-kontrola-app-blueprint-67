
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
import { Search, Check, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useServices } from "@/hooks/useServices";
import { useServicePackages, useServicePackageById } from "@/hooks/useServicePackages";
import { Switch } from "@/components/ui/switch";

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

  // Calculate the total price of selected services
  const totalPrice = selectedServices.reduce((total, serviceId) => {
    const service = services.find((s) => s.id === serviceId);
    return total + (service?.price || 0);
  }, 0);

  // Calculate discount and final price
  const discount = form.watch("discount") || 0;
  const discountAmount = (totalPrice * discount) / 100;
  const finalPrice = totalPrice - discountAmount;

  // Update price when selection or discount changes
  useEffect(() => {
    if (finalPrice >= 0) {
      form.setValue("price", parseFloat(finalPrice.toFixed(2)));
    }
  }, [selectedServices, discount, form]);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Pacote" : "Novo Pacote de Serviços"}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
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
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Serviços Selecionados</h3>
                  {selectedServices.length === 0 ? (
                    <div className="text-muted-foreground p-2 text-center border rounded-md">
                      Nenhum serviço selecionado
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedServices.map((serviceId) => {
                        const service = services.find((s) => s.id === serviceId);
                        return service ? (
                          <Badge key={serviceId} variant="secondary" className="mr-1 py-1.5">
                            {service.name} (R$ {service.price.toFixed(2)})
                          </Badge>
                        ) : null;
                      })}
                      <div className="text-sm font-medium pt-2">
                        Valor total: R$ {totalPrice.toFixed(2)}
                      </div>
                      <div className="text-sm font-medium text-primary">
                        Valor com desconto: R$ {finalPrice.toFixed(2)}
                      </div>
                    </div>
                  )}
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
                  
                  <div className="grid grid-cols-2 gap-4">
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
                              step="1"
                              {...field}
                              onChange={(e) => {
                                const value = Math.min(100, Math.max(0, Number(e.target.value)));
                                field.onChange(value);
                              }}
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
                              value={finalPrice.toFixed(2)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                  
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isEditing ? "Atualizar" : "Criar"} Pacote
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ServicePackageDialog;
