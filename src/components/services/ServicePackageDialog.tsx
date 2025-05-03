
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
import { Service, ServicePackage, ServicePackageFormData } from "@/types/service";
import { Search, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
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
});

interface ServicePackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageId?: string;
}

// Dados de exemplo para pacotes
const mockPackages: ServicePackage[] = [
  {
    id: "1",
    name: "Pacote Beleza Completa",
    description: "Inclui corte, manicure e pedicure",
    services: ["1", "2", "3"],
    price: 120.00,
    discount: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Pacote Dia da Noiva",
    description: "Tratamento completo para noivas",
    services: ["4", "5", "2", "3"],
    price: 300.00,
    discount: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const ServicePackageDialog: React.FC<ServicePackageDialogProps> = ({
  open,
  onOpenChange,
  packageId,
}) => {
  const isEditing = Boolean(packageId);
  const { services } = useServices();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Obter pacote pelo ID (simulado)
  const getPackageById = (id: string): ServicePackage | undefined => {
    return mockPackages.find(pkg => pkg.id === id);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      discount: 0,
    },
  });

  // Carregar dados do pacote ao editar
  useEffect(() => {
    if (isEditing && packageId) {
      setIsLoading(true);
      // Simular carregamento
      setTimeout(() => {
        const packageData = getPackageById(packageId);
        if (packageData) {
          form.reset({
            name: packageData.name,
            description: packageData.description || "",
            price: packageData.price,
            discount: packageData.discount,
          });
          setSelectedServices(packageData.services);
        }
        setIsLoading(false);
      }, 500);
    } else {
      form.reset({
        name: "",
        description: "",
        price: 0,
        discount: 0,
      });
      setSelectedServices([]);
    }
  }, [packageId, isEditing, form]);

  // Filtrar serviços com base no termo de pesquisa
  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular preço total dos serviços selecionados
  const totalPrice = selectedServices.reduce((total, serviceId) => {
    const service = services.find((s) => s.id === serviceId);
    return total + (service?.price || 0);
  }, 0);

  // Calcular desconto e preço final
  const discount = form.watch("discount") || 0;
  const discountAmount = (totalPrice * discount) / 100;
  const finalPrice = totalPrice - discountAmount;

  // Atualizar o campo de preço quando mudar a seleção de serviços
  useEffect(() => {
    form.setValue("price", finalPrice);
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

    // Montar dados do pacote
    const packageData: ServicePackageFormData = {
      name: values.name,
      description: values.description || "",
      services: selectedServices,
      price: values.price,
      discount: values.discount
    };

    console.log("Form submitted:", packageData);

    // Simulando sucesso após envio
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success(isEditing ? "Pacote atualizado com sucesso!" : "Pacote cadastrado com sucesso!");
      onOpenChange(false);
    }, 1000);
  };

  // Encontrar um serviço pelo ID
  const getServiceById = (id: string): Service | undefined => {
    return services.find(s => s.id === id);
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
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
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
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Serviços Selecionados</h3>
                  {selectedServices.length === 0 ? (
                    <div className="text-muted-foreground p-2 text-center border rounded-md">
                      Nenhum serviço selecionado
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedServices.map((serviceId) => {
                        const service = getServiceById(serviceId);
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
                  
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">
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
