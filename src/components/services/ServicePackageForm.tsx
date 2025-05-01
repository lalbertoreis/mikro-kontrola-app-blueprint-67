import React, { useState } from "react";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Service, ServicePackageFormData } from "@/types/service";
import { Search, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";

// Dados de exemplo para serviços
const mockServices: Service[] = [
  {
    id: "1",
    name: "Corte de Cabelo",
    description: "Corte tradicional masculino",
    price: 50.00,
    duration: 30,
    multipleAttendees: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Manicure",
    description: "Manicure completa com esmaltação",
    price: 45.00,
    duration: 60,
    multipleAttendees: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

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

interface ServicePackageFormProps {
  packageId?: string;
  onSuccess: () => void;
}

const ServicePackageForm: React.FC<ServicePackageFormProps> = ({
  packageId,
  onSuccess,
}) => {
  const { toast } = useToast();
  const isEditing = Boolean(packageId);
  const [services] = useState<Service[]>(mockServices);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      discount: 0,
    },
  });

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
  const discountAmount = (totalPrice * (form.watch("discount") || 0)) / 100;
  const finalPrice = totalPrice - discountAmount;

  // Atualizar o campo de preço quando mudar a seleção de serviços
  React.useEffect(() => {
    form.setValue("price", finalPrice);
  }, [selectedServices, form.watch("discount")]);

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
      discount: values.discount
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
      onSuccess();
    }, 1000);
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
                      return (
                        <Badge key={serviceId} variant="secondary" className="mr-1 py-1.5">
                          {service?.name} (R$ {service?.price.toFixed(2)})
                        </Badge>
                      );
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
                
                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onSuccess()}
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
