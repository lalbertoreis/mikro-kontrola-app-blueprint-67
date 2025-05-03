import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ServiceFormData } from "@/types/service";
import ServicePackageForm from "./ServicePackageForm";

// Validação com zod
const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, {
    message: "O preço não pode ser negativo.",
  }),
  duration: z.coerce.number().int().min(5, {
    message: "A duração deve ser de pelo menos 5 minutos.",
  }),
  multipleAttendees: z.boolean(),
  maxAttendees: z.coerce.number().int().min(2).optional(),
});

const ServiceFormComponent: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const isEditing = id !== undefined;
  const [activeTab, setActiveTab] = React.useState<string>("service");
  
  // Mock para o serviço quando estivermos em edição
  const mockService: ServiceFormData | null = isEditing
    ? {
        name: "Corte de Cabelo",
        description: "Corte tradicional masculino",
        price: 50.00,
        duration: 30,
        multipleAttendees: false,
        isActive: true,
      }
    : null;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: mockService || {
      name: "",
      description: "",
      price: 0,
      duration: 30,
      multipleAttendees: false,
      maxAttendees: 2,
      isActive: true,
    },
  });

  // Atualiza o campo maxAttendees com o valor padrão quando multipleAttendees muda
  React.useEffect(() => {
    const multipleAttendees = form.watch('multipleAttendees');
    if (!multipleAttendees) {
      form.setValue('maxAttendees', undefined);
    } else if (!form.watch('maxAttendees')) {
      form.setValue('maxAttendees', 2);
    }
  }, [form.watch('multipleAttendees')]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    
    // Aqui irá a lógica para salvar o serviço
    
    toast({
      title: isEditing ? "Serviço atualizado!" : "Serviço cadastrado!",
      description: `${values.name} foi ${isEditing ? "atualizado" : "cadastrado"} com sucesso.`,
    });
    
    navigate("/dashboard/services");
  }

  function onPackageSuccess() {
    toast({
      title: "Pacote cadastrado!",
      description: "O pacote de serviços foi cadastrado com sucesso.",
    });
    
    navigate("/dashboard/services");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="service">
                {isEditing ? "Editar Serviço" : "Novo Serviço"}
              </TabsTrigger>
              <TabsTrigger value="package">
                Novo Pacote
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="service">
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
                      <FormDescription>
                        Detalhes adicionais sobre o serviço oferecido.
                      </FormDescription>
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
                            placeholder="0,00" 
                            {...field}
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
                            placeholder="30" 
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
                  name="multipleAttendees"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Atendimentos múltiplos
                        </FormLabel>
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
                            placeholder="2" 
                            min={2}
                            {...field}
                            value={field.value || 2}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              field.onChange(isNaN(value) ? 2 : Math.max(2, value));
                            }}
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
                
                <CardFooter className="px-0 pt-4 flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate("/dashboard/services")}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {isEditing ? "Atualizar" : "Cadastrar"}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="package">
            <ServicePackageForm onSuccess={onPackageSuccess} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ServiceFormComponent;
