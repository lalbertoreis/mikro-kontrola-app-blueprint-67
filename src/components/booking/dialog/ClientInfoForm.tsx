
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DialogStepProps } from "./types";
import { ChevronLeft } from "lucide-react";

interface ClientInfoFormProps {
  onPrevStep: () => void;
  onSubmit: () => void;
  themeColor?: string;
  prefilledData?: Record<string, any>; // Add prefilledData prop
}

const formSchema = z.object({
  name: z.string().min(1, { message: "Nome é obrigatório" }),
  email: z.string().email({ message: "E-mail inválido" }),
  phone: z.string().min(8, { message: "Telefone inválido" })
});

const ClientInfoForm: React.FC<ClientInfoFormProps> = ({ 
  onPrevStep, 
  onSubmit, 
  themeColor = "#9b87f5", // Default color
  prefilledData
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: ""
    }
  });

  // Initialize form with prefilled data if available
  useEffect(() => {
    if (prefilledData) {
      form.reset({
        name: prefilledData.name || "",
        email: prefilledData.email || "",
        phone: prefilledData.phone || ""
      });
    }
  }, [prefilledData, form]);

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    console.log("Form data:", data);
    onSubmit();
  };

  return (
    <div>
      <div className="flex items-center mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onPrevStep} 
          className="mr-2 p-0 h-8 w-8"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-bold" style={{ color: themeColor }}>Suas informações</h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome completo</FormLabel>
                <FormControl>
                  <Input placeholder="Seu nome" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="seu@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input placeholder="(00) 00000-0000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full mt-6 text-white hover:opacity-90"
            style={{ backgroundColor: themeColor }}
          >
            Confirmar agendamento
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ClientInfoForm;
