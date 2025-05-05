
import React from "react";
import { toast } from "sonner";
import { registerAppointmentPayment } from "@/services/appointmentService";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { fetchPaymentMethods } from "@/services/transactionService";
import { useEffect, useState } from "react";

const paymentSchema = z.object({
  paymentMethod: z.string({
    required_error: "Método de pagamento é obrigatório",
  }),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  serviceName: string;
  servicePrice: number;
}

export default function PaymentDialog({
  open,
  onOpenChange,
  appointmentId,
  serviceName,
  servicePrice,
}: PaymentDialogProps) {
  const [paymentMethods, setPaymentMethods] = useState<Array<{ id: string, name: string }>>([]);
  const queryClient = useQueryClient();
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: "",
    },
  });
  
  // Load payment methods
  useEffect(() => {
    const loadPaymentMethods = async () => {
      if (open) {
        try {
          const methods = await fetchPaymentMethods();
          setPaymentMethods(methods);
        } catch (error) {
          console.error("Error loading payment methods:", error);
          toast.error("Erro ao carregar métodos de pagamento");
        }
      }
    };
    
    loadPaymentMethods();
  }, [open]);
  
  const registerPaymentMutation = useMutation({
    mutationFn: ({ appointmentId, paymentMethod }: { appointmentId: string, paymentMethod: string }) => 
      registerAppointmentPayment(appointmentId, paymentMethod),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Pagamento registrado com sucesso!");
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      console.error("Erro ao registrar pagamento:", error);
      toast.error(error.message || "Erro ao registrar pagamento");
    },
  });
  
  const onSubmit = (values: PaymentFormValues) => {
    registerPaymentMutation.mutate({
      appointmentId,
      paymentMethod: values.paymentMethod,
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Pagamento</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <div className="font-medium">Serviço</div>
            <div>{serviceName}</div>
          </div>
          
          <div className="grid gap-2">
            <div className="font-medium">Valor</div>
            <div>R$ {servicePrice.toFixed(2)}</div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Pagamento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um método de pagamento" />
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
              
              <DialogFooter className="mt-6">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  disabled={registerPaymentMutation.isPending}
                >
                  {registerPaymentMutation.isPending ? "Processando..." : "Confirmar Pagamento"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
