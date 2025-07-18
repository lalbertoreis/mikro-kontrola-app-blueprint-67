import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent } from "@/components/ui/card";
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
import { TransactionFormData, TransactionType } from "@/types/finance";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions } from "@/hooks/useTransactions";

// Categorias de exemplo
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
});

interface TransactionFormProps {
  transactionId?: string;
  onSuccess: () => void;
}

const TransactionForm = ({ transactionId, onSuccess }: TransactionFormProps) => {
  const isEditing = Boolean(transactionId);
  const { user } = useAuth();
  const { addTransaction, editTransaction, getTransaction } = useTransactions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialTransaction, setInitialTransaction] = useState(null);
  
  const defaultValues: TransactionFormData = {
    description: "",
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    type: "income" as TransactionType,
    category: "",
    notes: "",
    user_id: user?.id || ''
  };

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues,
  });

  // Load transaction data if editing
  useEffect(() => {
    if (isEditing && transactionId) {
      const loadTransaction = async () => {
        const transaction = await getTransaction(transactionId);
        if (transaction) {
          setInitialTransaction(transaction);
          form.reset({
            description: transaction.description,
            amount: Number(transaction.amount),
            date: transaction.date,
            type: transaction.type as TransactionType,
            category: transaction.category,
            notes: transaction.notes || "",
            user_id: user?.id || ''
          });
        }
      };
      loadTransaction();
    }
  }, [isEditing, transactionId, getTransaction, form, user?.id]);

  // Obter o tipo atual da transação para mostrar as categorias corretas
  const transactionType = form.watch("type");
  const categories = transactionType === "income" ? incomeCategories : expenseCategories;

  const onSubmit = async (data: TransactionFormData) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      console.log("Form submitted:", data);
      
      let result;
      if (isEditing && transactionId) {
        result = await editTransaction(transactionId, data);
      } else {
        result = await addTransaction(data);
      }
      
      if (result) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error submitting transaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0,00" 
                        {...field} 
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? parseFloat(value) : 0);
                        }}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações sobre a transação"
                      rows={4}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button variant="outline" type="button" onClick={() => onSuccess()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting 
                  ? "Salvando..." 
                  : isEditing 
                    ? "Atualizar" 
                    : "Adicionar"} Transação
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default TransactionForm;
