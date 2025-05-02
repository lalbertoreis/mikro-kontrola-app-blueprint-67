
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
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
import { Loader2 } from "lucide-react";
import { useClients, useClientById } from "@/hooks/useClients";
import { ClientFormData } from "@/types/client";

// Validação com zod
const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Email inválido.",
  }),
  phone: z.string().min(10, {
    message: "Telefone inválido.",
  }),
  notes: z.string().optional(),
});

const ClientFormComponent: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const isEditing = id !== undefined;
  const { data: client, isLoading: isClientLoading } = useClientById(id);
  const { createClient, updateClient, isCreating, isUpdating } = useClients();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      notes: "",
    },
  });

  // Update form values when client data is loaded
  useEffect(() => {
    if (client && isEditing) {
      form.reset({
        name: client.name,
        email: client.email || "",
        phone: client.phone || "",
        notes: client.notes || "",
      });
    }
  }, [client, form, isEditing]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const clientData: ClientFormData = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        notes: values.notes,
      };

      if (isEditing && id) {
        await updateClient({ id, data: clientData });
        toast.success("Cliente atualizado com sucesso!");
      } else {
        await createClient(clientData);
        toast.success("Cliente cadastrado com sucesso!");
      }
      
      navigate("/dashboard/clients");
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      toast.error(
        isEditing
          ? "Erro ao atualizar cliente. Tente novamente."
          : "Erro ao cadastrar cliente. Tente novamente."
      );
    }
  };

  if (isClientLoading && isEditing) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Cliente" : "Novo Cliente"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do cliente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@exemplo.com" {...field} />
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
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Anotações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Informações adicionais sobre o cliente..." 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Observações importantes sobre o cliente.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <CardFooter className="px-0 pt-4 flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/dashboard/clients")}
                disabled={isCreating || isUpdating}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={isCreating || isUpdating}
              >
                {(isCreating || isUpdating) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? "Atualizar" : "Cadastrar"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ClientFormComponent;
