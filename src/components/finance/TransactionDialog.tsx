import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TransactionFormData, TransactionType } from "@/types/finance";
import { useClients } from "@/hooks/useClients";
import { useServices } from "@/hooks/useServices";
import { useServicePackages } from "@/hooks/useServicePackages";
import { fetchPaymentMethods } from "@/services/transactionService";

// Define categories for income and expense
const incomeCategories = ["Serviços", "Vendas", "Investimentos", "Outros"];
const expenseCategories = ["Materiais", "Infraestrutura", "Salários", "Marketing", "Impostos", "Outros"];

const transactionSchema = z.object({
  description: z.string().min(1, { message: "A descrição é obrigatória" }),
  amount: z.number().positive({ message: "O valor deve ser maior que zero" }),
  date: z.string().min(1, { message: "A data é obrigatória" }),
  type: z.enum(["income", "expense"], { 
    required_error: "O tipo da transação é obrigatório" 
  }),
  category: z.string().min(1, { message: "A categoria é obrigatória" }),
  notes: z.string().optional(),
  payment_method: z.string().optional(),
  quantity: z.number().optional(),
  unit_price: z.number().optional(),
  client_id: z.string().optional(),
  service_id: z.string().optional(),
  package_id: z.string().optional(),
});

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId?: string;
  onSuccess: () => void;
  initialData?: TransactionFormData;
}

export function TransactionDialog({ 
  open, 
  onOpenChange, 
  transactionId,
  onSuccess,
  initialData
}: TransactionDialogProps) {
  const isEditing = Boolean(transactionId);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const { clients } = useClients();
  const { services } = useServices();
  const { servicePackages } = useServicePackages();
  const [serviceTab, setServiceTab] = useState<"service" | "package">("service");
  
  const defaultValues: TransactionFormData = initialData || {
    description: "",
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    type: "income",
    category: "",
    notes: "",
    payment_method: "",
    quantity: 1,
    unit_price: 0,
  };

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues,
  });

  // Obter o tipo atual da transação para mostrar as categorias corretas
  const transactionType = form.watch("type");
  const categories = transactionType === "income" ? incomeCategories : expenseCategories;
  
  // Watch for changes in quantity, unit_price, service_id, and package_id
  const quantity = form.watch("quantity") || 1;
  const unitPrice = form.watch("unit_price") || 0;
  const serviceId = form.watch("service_id");
  const packageId = form.watch("package_id");
  
  // Calculate total amount based on quantity and unit price
  useEffect(() => {
    const calculatedAmount = quantity * unitPrice;
    if (calculatedAmount > 0) {
      form.setValue("amount", calculatedAmount);
    }
  }, [quantity, unitPrice, form]);
  
  // Update unit price when service is selected
  useEffect(() => {
    if (serviceTab === "service" && serviceId) {
      const selectedService = services.find(s => s.id === serviceId);
      if (selectedService) {
        form.setValue("description", selectedService.name);
        form.setValue("unit_price", selectedService.price);
        // Clear package_id when service is selected
        form.setValue("package_id", undefined);
      }
    }
  }, [serviceId, services, form, serviceTab]);
  
  // Update unit price when package is selected
  useEffect(() => {
    if (serviceTab === "package" && packageId) {
      const selectedPackage = servicePackages.find(p => p.id === packageId);
      if (selectedPackage) {
        form.setValue("description", selectedPackage.name);
        form.setValue("unit_price", selectedPackage.price);
        // Clear service_id when package is selected
        form.setValue("service_id", undefined);
      }
    }
  }, [packageId, servicePackages, form, serviceTab]);

  // Load payment methods
  useEffect(() => {
    const loadPaymentMethods = async () => {
      const methods = await fetchPaymentMethods();
      setPaymentMethods(methods);
    };
    
    if (open) {
      loadPaymentMethods();
    }
  }, [open]);

  // Reset form when dialog opens or initialData changes
  useEffect(() => {
    if (open && initialData) {
      form.reset(initialData);
      
      // Determine which tab to select
      if (initialData.service_id) {
        setServiceTab("service");
      } else if (initialData.package_id) {
        setServiceTab("package");
      }
    }
  }, [open, initialData, form]);

  const onSubmit = (data: TransactionFormData) => {
    // Keep only service_id or package_id based on the selected tab
    const finalData = { ...data };
    if (serviceTab === "service") {
      finalData.package_id = undefined;
    } else {
      finalData.service_id = undefined;
    }
    
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Transação" : "Nova Transação"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="income">Receita</SelectItem>
                      <SelectItem value="expense">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {transactionType === "income" && (
              <Tabs value={serviceTab} onValueChange={(v) => setServiceTab(v as "service" | "package")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="service">Serviço</TabsTrigger>
                  <TabsTrigger value="package">Pacote</TabsTrigger>
                </TabsList>
                <TabsContent value="service">
                  <FormField
                    control={form.control}
                    name="service_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Serviço</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o serviço" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {services.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.name} - R${service.price.toFixed(2)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                <TabsContent value="package">
                  <FormField
                    control={form.control}
                    name="package_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pacote de Serviços</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o pacote" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {servicePackages.map((pkg) => (
                              <SelectItem key={pkg.id} value={pkg.id}>
                                {pkg.name} - R${pkg.price.toFixed(2)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Descrição da transação" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="unit_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Unitário</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0,00" 
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? parseFloat(value) : 0);
                        }}
                        value={field.value || 0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="1"
                        min="1"
                        placeholder="1" 
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? parseInt(value) : 1);
                        }}
                        value={field.value || 1}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Total</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0,00" 
                        readOnly
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? parseFloat(value) : 0);
                        }}
                        value={field.value || 0}
                        className="bg-muted"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o cliente (opcional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Pagamento</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o método de pagamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.id} value={method.name}>
                            {method.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações sobre a transação"
                      rows={3}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="submit">
                {isEditing ? "Atualizar" : "Adicionar"} Transação
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default TransactionDialog;
