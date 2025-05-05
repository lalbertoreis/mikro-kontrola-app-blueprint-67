
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFixedCosts } from "@/hooks/useFixedCosts";
import { Loader2 } from "lucide-react";
import { FixedCost } from "@/types/fixedCost";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres",
  }),
  month: z.coerce.number().min(1).max(12, {
    message: "O mês deve estar entre 1 e 12",
  }),
  year: z.coerce.number().min(2000).max(2100, {
    message: "O ano deve estar entre 2000 e 2100",
  }),
  amount: z.coerce.number().positive({
    message: "O valor deve ser positivo",
  }),
  description: z.string().optional(),
});

interface FixedCostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fixedCost?: FixedCost;
}

export const FixedCostDialog: React.FC<FixedCostDialogProps> = ({
  open,
  onOpenChange,
  fixedCost,
}) => {
  const isEditing = Boolean(fixedCost?.id);
  const { addFixedCost, updateFixedCost, isAdding, isUpdating } = useFixedCosts();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: fixedCost?.name || "",
      month: fixedCost?.month || new Date().getMonth() + 1,
      year: fixedCost?.year || new Date().getFullYear(),
      amount: fixedCost?.amount || 0,
      description: fixedCost?.description || "",
    },
  });

  React.useEffect(() => {
    if (open && fixedCost) {
      form.reset({
        name: fixedCost.name,
        month: fixedCost.month,
        year: fixedCost.year,
        amount: fixedCost.amount,
        description: fixedCost.description || "",
      });
    } else if (open) {
      // Ensure all required fields have explicit non-optional values
      const currentDate = new Date();
      form.reset({
        name: "",  // Explicitly set as empty string, not optional
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
        amount: 0,
        description: "",
      });
    }
  }, [open, fixedCost, form]);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (isEditing && fixedCost) {
      updateFixedCost({ id: fixedCost.id, data });
    } else {
      addFixedCost(data);
    }
    onOpenChange(false);
  };

  const months = [
    { value: 1, label: "Janeiro" },
    { value: 2, label: "Fevereiro" },
    { value: 3, label: "Março" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Maio" },
    { value: 6, label: "Junho" },
    { value: 7, label: "Julho" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Setembro" },
    { value: 10, label: "Outubro" },
    { value: 11, label: "Novembro" },
    { value: 12, label: "Dezembro" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar" : "Novo"} Custo Fixo</DialogTitle>
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
                    <Input placeholder="Nome do custo fixo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mês</FormLabel>
                    <Select
                      value={String(field.value)}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o mês" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={String(month.value)}>
                            {month.label}
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
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano</FormLabel>
                    <FormControl>
                      <Input type="number" min="2000" max="2100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" {...field} />
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
                    <Textarea placeholder="Descrição opcional" {...field} />
                  </FormControl>
                  <FormMessage />
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
                disabled={isAdding || isUpdating}
                className="bg-kontrola-600 hover:bg-kontrola-700"
              >
                {(isAdding || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Atualizar" : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
