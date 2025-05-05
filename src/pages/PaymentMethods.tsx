import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { createPaymentMethod, updatePaymentMethod, deletePaymentMethod } from "@/services/transactionService";

interface PaymentMethod {
  id: string;
  name: string;
  fee?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const paymentMethodSchema = z.object({
  name: z.string().min(1, { message: "Nome é obrigatório" }),
  fee: z.number().min(0, { message: "Taxa não pode ser negativa" }).optional(),
  is_active: z.boolean().default(true),
});

type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>;

const PaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentMethod, setCurrentMethod] = useState<PaymentMethod | null>(null);
  const [methodToDelete, setMethodToDelete] = useState<string | null>(null);
  const { user } = useAuth();

  const form = useForm<PaymentMethodFormData>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      name: "",
      fee: 0,
      is_active: true,
    },
  });

  const fetchPaymentMethods = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching payment methods:", error);
        return;
      }

      setPaymentMethods(data || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const handleAddMethod = () => {
    form.reset({
      name: "",
      fee: 0,
      is_active: true,
    });
    setCurrentMethod(null);
    setIsDialogOpen(true);
  };

  const handleEditMethod = (method: PaymentMethod) => {
    form.reset({
      name: method.name,
      fee: method.fee || 0,
      is_active: method.is_active,
    });
    setCurrentMethod(method);
    setIsDialogOpen(true);
  };

  const handleDeleteMethod = (id: string) => {
    setMethodToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (methodToDelete) {
      await deletePaymentMethod(methodToDelete);
      fetchPaymentMethods();
      setIsDeleteDialogOpen(false);
    }
  };

  const onSubmit = async (data: PaymentMethodFormData) => {
    if (!user) return;

    if (currentMethod) {
      // Ensure all required fields are explicitly set when editing
      await updatePaymentMethod(currentMethod.id, {
        name: data.name,
        fee: data.fee,
        is_active: data.is_active
      });
    } else {
      // Ensure all required fields are explicitly set when adding
      await createPaymentMethod({
        name: data.name,
        fee: data.fee,
        is_active: data.is_active,
        user_id: user.id,
      });
    }

    setIsDialogOpen(false);
    fetchPaymentMethods();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Métodos de Pagamento</h1>
            <p className="text-muted-foreground">
              Gerencie os métodos de pagamento aceitos pelo seu negócio.
            </p>
          </div>
          <Button onClick={handleAddMethod}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Método
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Métodos de Pagamento</CardTitle>
            <CardDescription>
              {isLoading
                ? "Carregando métodos de pagamento..."
                : `Total de ${paymentMethods.length} métodos cadastrados.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Taxa (%)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        Carregando métodos de pagamento...
                      </TableCell>
                    </TableRow>
                  ) : paymentMethods.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        Nenhum método de pagamento encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paymentMethods.map((method) => (
                      <TableRow key={method.id}>
                        <TableCell className="font-medium">{method.name}</TableCell>
                        <TableCell>{method.fee ? `${method.fee}%` : "-"}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              method.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {method.is_active ? "Ativo" : "Inativo"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditMethod(method)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteMethod(method.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Excluir</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog para adicionar/editar método de pagamento */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentMethod ? "Editar Método de Pagamento" : "Novo Método de Pagamento"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Cartão de Crédito" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taxa (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
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
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div>
                      <FormLabel>Ativo</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-readonly
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit">
                  {currentMethod ? "Atualizar" : "Adicionar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação para excluir método */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir método de pagamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este método de pagamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default PaymentMethods;
